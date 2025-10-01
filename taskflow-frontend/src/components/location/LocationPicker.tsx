import React, { useState, useEffect, useCallback } from 'react';
import {
    TextField,
    Autocomplete,
    Box,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    LocationOn as LocationOnIcon,
    MyLocation as MyLocationIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../hooks/useDebounce';
import { geolocationService } from '../../services/geolocationService';
import type { LocationPickerProps } from '../../types/Location';
import type { GeocodeResult, TaskLocation } from '../../types/Location';

const LocationPicker: React.FC<LocationPickerProps> = ({
    value,
    onChange,
    disabled = false,
    placeholder
}) => {
    const { t, i18n } = useTranslation();
    const [inputValue, setInputValue] = useState(value?.address || '');
    const [options, setOptions] = useState<GeocodeResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);

    const debouncedSearchTerm = useDebounce(inputValue, 300);

    useEffect(() => {
        const searchPlaces = async () => {
            if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 3) {
                setOptions([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const results = await geolocationService.searchPlaces(debouncedSearchTerm, i18n.language);

                const geocodedResults = await Promise.all(
                    results.slice(0, 5).map(async (result) => {
                        if (result.placeId) {
                            const details = await geolocationService.getPlaceDetails(result.placeId, i18n.language);
                            return details || result;
                        }
                        return result;
                    })
                );

                setOptions(geocodedResults.filter(Boolean));
            } catch (err) {
                setError(t('location.searchError', 'Error searching locations'));
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };

        searchPlaces();
    }, [debouncedSearchTerm, t, i18n.language]);

    const handleLocationSelect = useCallback((location: GeocodeResult | null) => {
        if (!location) {
            onChange(null);
            setInputValue('');
            return;
        }

        const taskLocation: TaskLocation = {
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            placeName: location.placeName,
            placeId: location.placeId
        };

        onChange(taskLocation);
        setInputValue(location.address);
    }, [onChange]);

    const handleGetCurrentLocation = async () => {
        setIsGettingCurrentLocation(true);
        setError(null);

        try {
            const position = await geolocationService.getCurrentLocation();

            if (!position) {
                setError(t('location.locationDenied', 'Location access denied'));
                return;
            }

            const geocoded = await geolocationService.reverseGeocode(
                position.latitude,
                position.longitude
            );

            if (geocoded) {
                handleLocationSelect(geocoded);
            } else {
                setError(t('location.geocodeError', 'Could not determine address'));
            }
        } catch (err) {
            setError(t('location.getCurrentLocationError', 'Error getting current location'));
        } finally {
            setIsGettingCurrentLocation(false);
        }
    };

    const handleClear = () => {
        handleLocationSelect(null);
    };

    const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
        setInputValue(newInputValue);

        if (!newInputValue.trim()) {
            handleLocationSelect(null);
        }
    };

    return (
        <Box>
            <Autocomplete
                value={value}
                onChange={(_event, newValue) => handleLocationSelect(newValue)}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                options={options}
                loading={loading}
                disabled={disabled}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return geolocationService.formatLocationDisplay(option);
                }}
                isOptionEqualToValue={(option, value) =>
                    option.placeId === value.placeId ||
                    (option.address === value.address &&
                        option.latitude === value.latitude &&
                        option.longitude === value.longitude)
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={t('location.selectLocation', 'Location (optional)')}
                        placeholder={placeholder || t('location.searchPlaceholder', 'Search for a place...')}
                        variant="outlined"
                        fullWidth
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <LocationOnIcon
                                    sx={{
                                        mr: 1,
                                        color: 'text.secondary',
                                        fontSize: 20
                                    }}
                                />
                            ),
                            endAdornment: (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}

                                    {!disabled && (
                                        <>
                                            <Tooltip title={t('location.getCurrentLocation', 'Use current location')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={handleGetCurrentLocation}
                                                    disabled={isGettingCurrentLocation}
                                                    sx={{ mr: 0.5 }}
                                                >
                                                    {isGettingCurrentLocation ? (
                                                        <CircularProgress size={16} />
                                                    ) : (
                                                        <MyLocationIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>

                                            {value && (
                                                <Tooltip title={t('location.clearLocation', 'Clear location')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={handleClear}
                                                        sx={{ mr: 0.5 }}
                                                    >
                                                        <ClearIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </>
                                    )}

                                    {params.InputProps.endAdornment}
                                </Box>
                            )
                        }}
                    />
                )}
                renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                        <Box component="li" key={key} {...otherProps}>
                            <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                                <Typography variant="body2">
                                    {option.placeName || option.address}
                                </Typography>
                                {option.placeName && option.placeName !== option.address && (
                                    <Typography variant="caption" color="text.secondary">
                                        {option.address}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    );
                }}
                noOptionsText={
                    inputValue.length < 3
                        ? t('location.typeToSearch', 'Type at least 3 characters to search')
                        : t('location.noResults', 'No locations found')
                }
            />

            {error && (
                <Alert
                    severity="warning"
                    sx={{ mt: 1 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            {value && (
                <Box sx={{ mt: 1 }}>
                    <Chip
                        label={geolocationService.formatLocationDisplay(value)}
                        icon={<LocationOnIcon />}
                        size="small"
                        variant="outlined"
                        color="primary"
                        onDelete={disabled ? undefined : handleClear}
                    />
                </Box>
            )}
        </Box>
    );
};

export default LocationPicker;
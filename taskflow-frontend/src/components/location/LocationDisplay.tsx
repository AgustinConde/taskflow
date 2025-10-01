import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { LocationOn as LocationOnIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { geolocationService } from '../../services/geolocationService';
import type { LocationDisplayProps } from '../../types/Location';

const LocationDisplay: React.FC<LocationDisplayProps> = ({
    location,
    showMap = true,
    mapHeight = 300,
    interactive = false
}) => {
    const { t } = useTranslation();
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapLoading, setMapLoading] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [map, setMap] = useState<any>(null);

    useEffect(() => {
        if (!showMap || !location || !mapRef.current) return;

        const initializeMap = async () => {
            setMapLoading(true);
            setMapError(null);

            try {
                await geolocationService.initializeGoogleMaps();

                if (!window.google?.maps) {
                    setMapError(t('location.mapsNotAvailable', 'Maps are not available'));
                    return;
                }

                const mapInstance = new window.google.maps.Map(mapRef.current!, {
                    center: {
                        lat: location.latitude,
                        lng: location.longitude
                    },
                    zoom: 15,
                    disableDefaultUI: !interactive,
                    draggable: interactive,
                    scrollwheel: interactive,
                    disableDoubleClickZoom: !interactive,
                    keyboardShortcuts: interactive,
                    mapId: 'TASKFLOW_MAP'
                });

                const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker") as any;

                const marker = new AdvancedMarkerElement({
                    map: mapInstance,
                    position: {
                        lat: location.latitude,
                        lng: location.longitude
                    },
                    title: location.placeName || location.address
                });

                if (interactive) {
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div style="padding: 8px; max-width: 300px;">
                                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">
                                    ${location.placeName || t('location.selectedLocation', 'Selected Location')}
                                </h3>
                                <p style="margin: 0; font-size: 14px; color: #666;">
                                    ${location.address}
                                </p>
                            </div>
                        `
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(mapInstance, marker);
                    });
                }

                setMap(mapInstance);
            } catch (error) {
                setMapError(t('location.mapLoadError', 'Error loading map'));
            } finally {
                setMapLoading(false);
            }
        };

        initializeMap();
    }, [location, showMap, interactive, t]);

    useEffect(() => {
        if (map && location) {
            map.setCenter({
                lat: location.latitude,
                lng: location.longitude
            });
        }
    }, [map, location]);

    if (!location) {
        return null;
    }

    return (
        <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            {/* Location Info */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: showMap ? 2 : 0 }}>
                <LocationOnIcon sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                    {location.placeName && (
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {location.placeName}
                        </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                        {location.address}
                    </Typography>
                </Box>
            </Box>

            {/* Map */}
            {showMap && (
                <Box sx={{ position: 'relative' }}>
                    {mapLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                zIndex: 2,
                                borderRadius: 1
                            }}
                        >
                            <CircularProgress size={40} />
                        </Box>
                    )}

                    {mapError ? (
                        <Alert severity="warning" sx={{ borderRadius: 1 }}>
                            {mapError}
                        </Alert>
                    ) : (
                        <Box
                            ref={mapRef}
                            sx={{
                                height: mapHeight,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                '& .gm-style': {
                                    borderRadius: '4px'
                                }
                            }}
                        />
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default LocationDisplay;
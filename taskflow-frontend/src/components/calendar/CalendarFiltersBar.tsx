import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/Category';

export interface CalendarFilters {
    category: number | 'all';
    status: 'all' | 'completed' | 'pending' | 'overdue';
}

interface CalendarFiltersProps {
    categories: Category[];
    filters: CalendarFilters;
    onFiltersChange: (filters: CalendarFilters) => void;
}

const CalendarFiltersBar: React.FC<CalendarFiltersProps> = ({
    categories,
    filters,
    onFiltersChange
}) => {
    const { t } = useTranslation();

    const handleCategoryChange = (event: SelectChangeEvent<number | 'all'>) => {
        onFiltersChange({
            ...filters,
            category: event.target.value as number | 'all'
        });
    };

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        onFiltersChange({
            ...filters,
            status: event.target.value as CalendarFilters['status']
        });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.category !== 'all') count++;
        if (filters.status !== 'all') count++;
        return count;
    };

    return (
        <Box
            display="flex"
            gap={2}
            alignItems="center"
            flexWrap="wrap"
            sx={{ mb: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}
        >
            <Typography variant="body2" color="textSecondary" fontWeight="medium">
                {t('filter')}
            </Typography>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('categories')}</InputLabel>
                <Select
                    value={filters.category}
                    label={t('categories')}
                    onChange={handleCategoryChange}
                >
                    <MenuItem value="all">{t('allCategories')}</MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: category.color
                                    }}
                                />
                                {category.name}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('status')}</InputLabel>
                <Select
                    value={filters.status}
                    label={t('status')}
                    onChange={handleStatusChange}
                >
                    <MenuItem value="all">{t('all')}</MenuItem>
                    <MenuItem value="completed">{t('completed')}</MenuItem>
                    <MenuItem value="pending">{t('pending')}</MenuItem>
                    <MenuItem value="overdue">{t('overdue')}</MenuItem>
                </Select>
            </FormControl>

            {getActiveFiltersCount() > 0 && (
                <Chip
                    label={`${getActiveFiltersCount()} ${t('active')}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onDelete={() => onFiltersChange({ category: 'all', status: 'all' })}
                />
            )}
        </Box>
    );
};

export default CalendarFiltersBar;
import { Box, Button, TextField, Typography, Select, MenuItem } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/Category';

type FilterType = 'all' | 'completed' | 'pending' | number | 'none';
type SortType = 'custom' | 'dueDate' | 'createdAt' | 'category';

interface TaskFiltersProps {
    search: string;
    onSearchChange: (search: string) => void;
    filter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    sortBy: SortType;
    onSortChange: (sort: SortType) => void;
    categories: Category[];
    onCategoryManagerOpen: () => void;
}

const TaskFilters = ({
    search,
    onSearchChange,
    filter,
    onFilterChange,
    sortBy,
    onSortChange,
    categories,
    onCategoryManagerOpen
}: TaskFiltersProps) => {
    const { t } = useTranslation();

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'center',
            mb: 2,
            flexWrap: 'wrap'
        }}>
            <TextField
                label={t('searchTasks')}
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                size="small"
                sx={{
                    minWidth: { xs: '100%', sm: 200 },
                    maxWidth: { xs: '100%', sm: 220 },
                    height: 40,
                    '.MuiInputBase-root': { height: 40 },
                    order: { xs: 1, sm: 1 }
                }}
            />

            <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={onCategoryManagerOpen}
                size="small"
                sx={{
                    height: 40,
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content',
                    order: { xs: 4, sm: 2 }
                }}
            >
                {t('manageCategories')}
            </Button>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                minWidth: 'fit-content',
                order: { xs: 2, sm: 3 }
            }}>
                <Typography
                    variant="body2"
                    component="span"
                    sx={{
                        mr: 1,
                        whiteSpace: 'nowrap',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                >
                    {t('filter')}
                </Typography>
                <Select
                    value={filter}
                    onChange={e => onFilterChange(e.target.value as FilterType)}
                    size="small"
                    sx={{ minWidth: { xs: 120, sm: 140 } }}
                >
                    <MenuItem value="all">{t('all')}</MenuItem>
                    <MenuItem value="completed">{t('completed')}</MenuItem>
                    <MenuItem value="pending">{t('pending')}</MenuItem>
                    <MenuItem value="none">{t('noCategory')}</MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        backgroundColor: category.color,
                                        borderRadius: '50%'
                                    }}
                                />
                                {category.name}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                minWidth: 'fit-content',
                order: { xs: 3, sm: 4 }
            }}>
                <Typography
                    variant="body2"
                    component="span"
                    sx={{
                        mr: 1,
                        whiteSpace: 'nowrap',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                >
                    {t('sortBy')}
                </Typography>
                <Select
                    value={sortBy}
                    onChange={e => onSortChange(e.target.value as SortType)}
                    size="small"
                    sx={{ minWidth: { xs: 100, sm: 120 } }}
                >
                    <MenuItem value="custom">{t('custom')}</MenuItem>
                    <MenuItem value="dueDate">{t('dueDateSort')}</MenuItem>
                    <MenuItem value="createdAt">{t('createdAt')}</MenuItem>
                    <MenuItem value="category">{t('category')}</MenuItem>
                </Select>
            </Box>
        </Box>
    );
};

export default TaskFilters;

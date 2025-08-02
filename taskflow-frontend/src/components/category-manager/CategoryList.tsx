import { Box, Typography, CircularProgress, Alert, Stack, Chip, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/Category';

interface CategoryListProps {
    categories: Category[];
    loading: boolean;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

const CategoryList = ({ categories, loading, onEdit, onDelete }: CategoryListProps) => {
    const { t } = useTranslation();

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {t('categories')} ({categories.length})
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : categories.length === 0 ? (
                <Alert severity="info">
                    {t('noCategoriesFound')}
                </Alert>
            ) : (
                <Stack spacing={1}>
                    {categories.map((category) => (
                        <Box
                            key={category.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                <Chip
                                    label={category.name}
                                    sx={{
                                        backgroundColor: category.color,
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                    size="small"
                                />
                                {category.description && (
                                    <Typography variant="body2" color="text.secondary">
                                        {category.description}
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                    onClick={() => onEdit(category)}
                                    size="small"
                                    color="primary"
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    onClick={() => onDelete(category)}
                                    size="small"
                                    color="error"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default CategoryList;

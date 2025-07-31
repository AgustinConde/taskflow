import { TextField, Box, Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CategoryFormProps {
    formData: {
        name: string;
        color: string;
        description: string;
    };
    setFormData: (data: { name: string; color: string; description: string }) => void;
    formErrors: Record<string, string>;
    predefinedColors: string[];
    editingCategory: any;
}

const CategoryForm = ({
    formData,
    setFormData,
    formErrors,
    predefinedColors,
    editingCategory
}: CategoryFormProps) => {
    const { t } = useTranslation();

    return (
        <>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {editingCategory ? t('editCategory') : t('addCategory')}
            </Typography>

            <Stack spacing={2}>
                <TextField
                    label={t('categoryName')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    fullWidth
                    size="small"
                />

                <TextField
                    label={t('categoryDescription')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                />

                <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {t('categoryColor')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {predefinedColors.map((color) => (
                            <Box
                                key={color}
                                onClick={() => setFormData({ ...formData, color })}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: color,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    border: formData.color === color ? 3 : 1,
                                    borderColor: formData.color === color ? 'primary.main' : 'divider',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                    {formErrors.color && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {formErrors.color}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </>
    );
};

export default CategoryForm;

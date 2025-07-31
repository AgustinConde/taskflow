import { Box, Button } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface CategoryFormActionsProps {
    editingCategory: any;
    onSave: () => void;
    onCancel: () => void;
    loading: boolean;
}

const CategoryFormActions = ({ editingCategory, onSave, onCancel, loading }: CategoryFormActionsProps) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {editingCategory && (
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    size="small"
                    disabled={loading}
                >
                    {t('cancel')}
                </Button>
            )}
            <Button
                onClick={onSave}
                variant="contained"
                size="small"
                startIcon={editingCategory ? <EditIcon /> : <AddIcon />}
                disabled={loading}
            >
                {editingCategory ? t('updateCategory') : t('createCategory')}
            </Button>
        </Box>
    );
};

export default CategoryFormActions;

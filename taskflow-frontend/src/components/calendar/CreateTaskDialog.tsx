import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/Category';

interface CreateTaskDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (taskData: {
        title: string;
        description: string;
        dueDate: string;
        categoryId: number | null;
    }) => Promise<boolean>;
    categories: Category[];
    initialDate?: Date;
    creating?: boolean;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
    open,
    onClose,
    onSubmit,
    categories,
    initialDate,
    creating = false
}) => {
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(
        initialDate || new Date()
    );
    const [categoryId, setCategoryId] = useState<number | null>(null);

    const handleSubmit = async () => {
        if (!title.trim()) return;

        const success = await onSubmit({
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDate ? dueDate.toISOString() : '',
            categoryId
        });

        if (success) {
            handleClose();
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setDueDate(initialDate || new Date());
        setCategoryId(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('addTask')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        autoFocus
                        label={t('title')}
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <TextField
                        label={t('description')}
                        fullWidth
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <TextField
                        label={t('dueDate')}
                        type="datetime-local"
                        fullWidth
                        value={dueDate ? dueDate.toISOString().slice(0, 16) : ''}
                        onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <FormControl fullWidth>
                        <InputLabel>{t('category')}</InputLabel>
                        <Select
                            value={categoryId || ''}
                            label={t('category')}
                            onChange={(e) => setCategoryId(e.target.value as number || null)}
                        >
                            <MenuItem value="">{t('noCategory')}</MenuItem>
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
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={creating}>
                    {t('cancel')}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!title.trim() || creating}
                >
                    {creating ? t('creating') : t('addTask')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateTaskDialog;
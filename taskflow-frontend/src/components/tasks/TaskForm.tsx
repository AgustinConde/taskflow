import { useState } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/Category';

interface TaskFormProps {
    categories: Category[];
    onSubmit: (taskData: {
        title: string;
        description: string;
        dueDate: string;
        categoryId: number | null;
    }) => Promise<boolean>;
    creating: boolean;
}

const TaskForm = ({ categories, onSubmit, creating }: TaskFormProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);

    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await onSubmit({
            title,
            description,
            dueDate,
            categoryId
        });

        if (success) {
            setTitle("");
            setDescription("");
            setDueDate("");
            setCategoryId(null);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                mb: 3,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center'
            }}
        >
            <TextField
                label={t('title')}
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                slotProps={{ htmlInput: { maxLength: 100 } }}
                sx={{ minWidth: 220, maxWidth: 260, flex: '0 1 220px' }}
            />
            <TextField
                label={t('description')}
                value={description}
                onChange={e => setDescription(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                sx={{ minWidth: 220, maxWidth: 260, flex: '0 1 220px' }}
            />
            <TextField
                label={t('dueDate')}
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: 220, maxWidth: 260, flex: '0 1 220px' }}
            />
            <FormControl sx={{ minWidth: 220, maxWidth: 260, flex: '0 1 220px' }}>
                <InputLabel>{t('category')}</InputLabel>
                <Select
                    value={categoryId || ''}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                    label={t('category')}
                >
                    <MenuItem value="">
                        <em>{t('noCategorySelected')}</em>
                    </MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        backgroundColor: category.color,
                                        borderRadius: '50%'
                                    }}
                                />
                                {category.name}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={creating || !title}
                sx={{
                    minWidth: 150,
                    maxWidth: 180,
                    flex: '0 1 150px',
                    whiteSpace: 'nowrap'
                }}
            >
                {creating ? t('creating') : t('addTask')}
            </Button>
        </Box>
    );
};

export default TaskForm;

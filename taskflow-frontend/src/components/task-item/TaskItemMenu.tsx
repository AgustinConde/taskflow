import { IconButton, Menu, MenuItem, Box } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';

interface TaskItemMenuProps {
    anchorEl: HTMLElement | null;
    menuOpen: boolean;
    onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
    onMenuClose: () => void;
    onInfoOpen: () => void;
    onEditOpen: () => void;
    onDelete: () => void;
}

const TaskItemMenu = ({
    anchorEl,
    menuOpen,
    onMenuOpen,
    onMenuClose,
    onInfoOpen,
    onEditOpen,
    onDelete
}: TaskItemMenuProps) => {
    const { t } = useTranslation();

    const handleInfoClick = () => {
        onInfoOpen();
        onMenuClose();
    };

    const handleEditClick = () => {
        onEditOpen();
        onMenuClose();
    };

    const handleDeleteClick = () => {
        onMenuClose();
        onDelete();
    };

    return (
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={onMenuOpen} aria-label="more" size="small">
                <MoreVertIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={onMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleInfoClick}>
                    <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                    {t('info')}
                </MenuItem>
                <MenuItem onClick={handleEditClick}>
                    <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                    {t('edit')}
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                    <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                    {t('delete')}
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default TaskItemMenu;

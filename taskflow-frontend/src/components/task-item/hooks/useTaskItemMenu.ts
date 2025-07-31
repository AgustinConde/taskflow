import { useState, useCallback } from 'react';

export const useTaskItemMenu = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    return {
        anchorEl,
        menuOpen,
        handleMenuOpen,
        handleMenuClose
    };
};

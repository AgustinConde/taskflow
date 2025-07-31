import { useState } from 'react';

type TabType = 'tasks' | 'dashboard';

export const useAppNavigation = () => {
    const [currentTab, setCurrentTab] = useState<TabType>('tasks');
    const [authDialogOpen, setAuthDialogOpen] = useState(false);

    const handleTabChange = (_: React.SyntheticEvent, newValue: TabType) => {
        setCurrentTab(newValue);
    };

    const openAuthDialog = () => {
        setAuthDialogOpen(true);
    };

    const closeAuthDialog = () => {
        setAuthDialogOpen(false);
    };

    return {
        currentTab,
        setCurrentTab,
        handleTabChange,
        authDialogOpen,
        openAuthDialog,
        closeAuthDialog
    };
};

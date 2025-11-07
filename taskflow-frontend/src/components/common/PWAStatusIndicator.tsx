import React from 'react';
import {
    Box,
    Tooltip,
    Chip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    Badge
} from '@mui/material';
import {
    CloudOff,
    Cloud,
    Sync,
    SyncDisabled,
    InstallMobile,
    Update,
    Download,
    CheckCircle
} from '@mui/icons-material';
import { usePWA } from '../../hooks/usePWA';
import { useOfflineSync } from '../../hooks/useOfflineSync';

const PWAStatusIndicator: React.FC = () => {
    const {
        isOnline,
        isInstallable,
        isInstalled,
        updateAvailable,
        installApp,
        updateApp,
        syncData
    } = usePWA();

    const {
        syncInProgress,
        pendingChanges,
        syncPendingChanges
    } = useOfflineSync();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleInstall = async () => {
        await installApp();
        handleClose();
    };

    const handleUpdate = async () => {
        await updateApp();
        handleClose();
    };

    const handleSync = async () => {
        await (pendingChanges > 0 ? syncPendingChanges() : syncData());
        handleClose();
    };

    const getStatusIcon = () => {
        if (syncInProgress) {
            return <Sync sx={{ animation: 'spin 1s linear infinite' }} />;
        }

        if (!isOnline) {
            return pendingChanges > 0 ? (
                <Badge badgeContent={pendingChanges} color="warning">
                    <CloudOff color="error" />
                </Badge>
            ) : (
                <CloudOff color="error" />
            );
        }

        if (pendingChanges > 0) {
            return (
                <Badge badgeContent={pendingChanges} color="warning">
                    <Cloud color="success" />
                </Badge>
            );
        }

        return <Cloud color="success" />;
    };

    const getStatusColor = () => {
        if (!isOnline) return 'error';
        if (pendingChanges > 0) return 'warning';
        return 'success';
    };

    const getStatusText = () => {
        if (syncInProgress) return 'Syncing...';
        if (!isOnline) return 'Offline';
        if (pendingChanges > 0) return `${pendingChanges} pending`;
        return 'Online';
    };

    return (
        <Box display="flex" alignItems="center" gap={1}>
            {/* Status indicator */}
            <Tooltip title={`Status: ${getStatusText()}`}>
                <Chip
                    icon={getStatusIcon()}
                    label={getStatusText()}
                    size="small"
                    color={getStatusColor()}
                    variant="outlined"
                    onClick={handleClick}
                    sx={{ cursor: 'pointer' }}
                />
            </Tooltip>

            {/* PWA Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: { minWidth: 200 }
                    }
                }}
            >
                <MenuItem disabled>
                    <ListItemIcon>
                        {isOnline ? <Cloud color="success" /> : <CloudOff color="error" />}
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body2" color={isOnline ? 'success.main' : 'error.main'}>
                            {isOnline ? 'Connected' : 'Offline Mode'}
                        </Typography>
                    </ListItemText>
                </MenuItem>

                <Divider />

                {/* Sync options */}
                <MenuItem
                    onClick={handleSync}
                    disabled={syncInProgress || (!isOnline && pendingChanges === 0)}
                >
                    <ListItemIcon>
                        {syncInProgress ? (
                            <Sync sx={{ animation: 'spin 1s linear infinite' }} />
                        ) : pendingChanges > 0 ? (
                            <Badge badgeContent={pendingChanges} color="warning">
                                <SyncDisabled />
                            </Badge>
                        ) : (
                            <Sync />
                        )}
                    </ListItemIcon>
                    <ListItemText>
                        {syncInProgress
                            ? 'Syncing...'
                            : pendingChanges > 0
                                ? `Sync ${pendingChanges} changes`
                                : 'Sync now'
                        }
                    </ListItemText>
                </MenuItem>

                <Divider />

                {/* PWA Install/Update options */}
                {isInstallable && (
                    <MenuItem onClick={handleInstall}>
                        <ListItemIcon>
                            <InstallMobile />
                        </ListItemIcon>
                        <ListItemText>Install App</ListItemText>
                    </MenuItem>
                )}
                {isInstalled && (
                    <MenuItem disabled>
                        <ListItemIcon>
                            <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText>App Installed</ListItemText>
                    </MenuItem>
                )}

                {updateAvailable && (
                    <MenuItem onClick={handleUpdate}>
                        <ListItemIcon>
                            <Update />
                        </ListItemIcon>
                        <ListItemText>Update Available</ListItemText>
                    </MenuItem>
                )}

                {!isInstallable && !isInstalled && !updateAvailable && (
                    <MenuItem disabled>
                        <ListItemIcon>
                            <Download />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body2" color="textSecondary">
                                PWA not available
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                )}
            </Menu>

            {/* Global styles for spin animation */}
            <style>
                {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
            </style>
        </Box>
    );
};

export default PWAStatusIndicator;

import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AchievementTrackerProvider } from './hooks/useAchievementTracker';
import Router from './Router';
import './i18n';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AchievementTrackerProvider>
          <Router />
        </AchievementTrackerProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

import { useContext } from 'react';
import { AppContext } from './AppContext';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import { useUsers } from './UserContext';
import type { User } from '../types/auth';

export const useApp = () => {
    const uiContext = useContext(AppContext);
    const auth = useAuth();
    const settings = useSettings();
    const users = useUsers();

    if (uiContext === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }

    // Combine all contexts for backward compatibility
    return {
        ...uiContext,
        ...auth,
        ...settings,
        ...users,
        // Compatibility aliases
        user: auth.currentUser || ({ id: 'guest', name: 'ضيف', username: 'guest' } as User),
        updateUser: auth.updateCurrentUser
    };
};

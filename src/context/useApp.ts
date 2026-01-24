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
    // We must ensure useAuth doesn't crash if we are only looking for UI context, 
    // but the current architecture deeply couples them.
    // Ideally split them, but for quick fix, we just ensure nesting.
    return {
        ...uiContext,
        ...auth,
        ...settings,
        ...users,
        user: auth.currentUser || ({ id: 'guest', name: 'ضيف', username: 'guest' } as User),
        updateUser: auth.updateCurrentUser
    };
};

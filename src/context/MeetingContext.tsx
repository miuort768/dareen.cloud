import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface MeetingState {
    showMeeting: boolean;
    conversationId: string | null;
}

interface MeetingContextType {
    meeting: MeetingState;
    startMeeting: (conversationId: string) => void;
    closeMeeting: () => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
    const [meeting, setMeeting] = useState<MeetingState>({
        showMeeting: false,
        conversationId: null
    });

    const startMeeting = useCallback((conversationId: string) => {
        setMeeting({ showMeeting: true, conversationId });
    }, []);

    const closeMeeting = useCallback(() => {
        setMeeting({ showMeeting: false, conversationId: null });
    }, []);

    return (
        <MeetingContext.Provider value={{ meeting, startMeeting, closeMeeting }}>
            {children}
        </MeetingContext.Provider>
    );
};

export const useMeeting = () => {
    const context = useContext(MeetingContext);
    if (!context) {
        throw new Error('useMeeting must be used within a MeetingProvider');
    }
    return context;
};

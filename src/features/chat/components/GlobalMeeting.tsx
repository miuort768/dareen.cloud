import { createPortal } from 'react-dom';
import { useMeeting } from '../../../context/MeetingContext';
import { useApp } from '../../../context/AppContext';
import { MeetingRoom } from './MeetingRoom';

export const GlobalMeeting = () => {
    const { meeting, closeMeeting } = useMeeting();
    const { currentUser } = useApp();

    if (!meeting.showMeeting || !meeting.conversationId || !currentUser) {
        return null;
    }

    return createPortal(
        <MeetingRoom
            conversationId={meeting.conversationId}
            currentUser={currentUser}
            onClose={closeMeeting}
        />,
        document.body
    );
};

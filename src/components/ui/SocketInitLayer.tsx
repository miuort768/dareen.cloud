import { useChatSocketInit } from '../../hooks/useChatSocketInit';

export const SocketInitLayer = () => {
    useChatSocketInit();
    return null;
};

import React, { useRef, useEffect, useState } from 'react';
import { 
    Send, Smile, MoreVertical, ChevronRight, 
    CheckCheck, Mic, ArrowDown, Search,
    Video, Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useChatContext } from '../../../context/ChatContext';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import type { Conversation, ChatMessage } from '../../../types/chat.types';
import type { User } from '../../../types/auth';

interface ChatWindowProps {
    selectedConv: Conversation;
    messages: ChatMessage[];
    newMessage: string;
    setNewMessage: (val: string) => void;
    handleSendMessage: (e: React.FormEvent) => void;
    isSending: boolean;
    currentUser: User | null;
    setSelectedConv: (val: Conversation | null) => void;
    openGroupSettings: () => void;
    confirmDeleteConversation: (conv: Conversation) => void;
    showMoreMenu: boolean;
    setShowMoreMenu: (val: boolean) => void;
    menuRef: React.RefObject<HTMLDivElement>;
    setTyping: (convId: string, isTyping: boolean, name: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    selectedConv,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    isSending,
    currentUser,
    setSelectedConv,
    openGroupSettings,
    confirmDeleteConversation,
    showMoreMenu,
    setShowMoreMenu,
    menuRef,
    setTyping
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const { typingUsers } = useChatContext();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Voice Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<any>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("يرجى السماح بالوصول للميكروفون لتسجيل الصوت");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const sendRecording = () => {
        if (!mediaRecorderRef.current) return;
        
        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            // Simulate sending voice message
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                // Here you would call handleSendMessage with the audio data
                // For now, we simulate by sending a placeholder text
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                const originalMsg = newMessage;
                setNewMessage("🎤 رسالة صوتية (Voice Message)");
                setTimeout(() => {
                    handleSendMessage(fakeEvent);
                    setNewMessage(originalMsg);
                }, 100);
            };
        };
        stopRecording();
    };

    const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isFarUp = scrollHeight - scrollTop - clientHeight > 300;
        setShowScrollBottom(isFarUp);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.emoji-toggle-btn')) return;
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onEmojiClick = (emojiData: any) => {
        setNewMessage(newMessage + emojiData.emoji);
    };

    const typingInThisConv = typingUsers.filter(u => u.conversationId === selectedConv.id);

    return (
        <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden relative h-full pb-[65px] lg:pb-0">
            {/* WhatsApp Doodle Background Pattern */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.1]" 
                style={{ 
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px'
                }} 
            />

            {/* Header - WhatsApp Style */}
            <header className="h-[60px] shrink-0 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-1 text-[#54656f] dark:text-[#aebac1]"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div 
                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
                        onClick={() => selectedConv.isGroup && openGroupSettings()}
                    >
                        <img 
                            src={selectedConv.isGroup ? "/group-avatar.png" : "/chat-avatar.jpg"} 
                            alt="avatar" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + selectedConv.displayName + "&background=random"; }}
                        />
                    </div>

                    <div className="flex flex-col text-right">
                        <h2 className="text-base font-medium text-[#111b21] dark:text-[#e9edef] leading-tight truncate max-w-[150px] md:max-w-[300px]">
                            {selectedConv.displayName}
                        </h2>
                        {typingInThisConv.length > 0 ? (
                            <span className="text-[12px] text-[#00a884] font-normal">جاري الكتابة...</span>
                        ) : (
                            <span className="text-[12px] text-[#667781] dark:text-[#8696a0] font-normal">آخر ظهور اليوم</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-5 text-[#54656f] dark:text-[#aebac1]">
                    <button className="hidden sm:block hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors">
                        <Video size={20} />
                    </button>
                    <button className="hidden sm:block hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors">
                        <Phone size={20} />
                    </button>
                    <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block" />
                    <button className="hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors">
                        <Search size={20} />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors"
                        >
                            <MoreVertical size={20} />
                        </button>
                        <AnimatePresence>
                            {showMoreMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#233138] shadow-xl z-[100] py-2 rounded-md"
                                >
                                    <button
                                        onClick={() => { openGroupSettings(); setShowMoreMenu(false); }}
                                        className="w-full text-right px-4 py-3 text-sm text-[#3b4a54] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors"
                                    >
                                        معلومات المحادثة
                                    </button>
                                    <button
                                        onClick={() => { confirmDeleteConversation(selectedConv); setShowMoreMenu(false); }}
                                        className="w-full text-right px-4 py-3 text-sm text-rose-500 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors"
                                    >
                                        حذف الدردشة
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Messages - WhatsApp Bubbles */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 lg:px-20 py-6 space-y-2 custom-scrollbar relative z-10"
            >
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const isGroup = selectedConv.isGroup;
                    
                    return (
                        <div 
                            key={msg.id || idx} 
                            className={cn(
                                "flex w-full mb-1",
                                isMe ? "justify-start" : "justify-end"
                            )}
                        >
                            <div className={cn(
                                "max-w-[90%] md:max-w-[75%] px-3 py-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] relative",
                                isMe 
                                    ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-[7.5px] rounded-tl-none ml-2" 
                                    : "bg-white dark:bg-[#202c33] rounded-[7.5px] rounded-tr-none mr-2"
                            )}>
                                {/* Bubble Tail logic could be added with pseudo-elements if needed */}
                                
                                {isGroup && !isMe && (
                                    <span className="block text-[12.5px] font-bold text-[#e542a3] mb-0.5 text-right">
                                        {msg.senderName}
                                    </span>
                                )}

                                <div className="text-[14.2px] text-[#111b21] dark:text-[#e9edef] leading-[1.4] whitespace-pre-wrap text-right tracking-tight">
                                    {msg.content}
                                </div>
                                
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-[10px] text-[#667781] dark:text-[#8696a0]">
                                        {format(new Date(msg.timestamp), 'h:mm a', { locale: ar })}
                                    </span>
                                    {isMe && <CheckCheck size={14} className="text-[#53bdeb]" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
                {showScrollBottom && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => scrollToBottom("smooth")}
                        className="absolute bottom-24 left-6 w-10 h-10 bg-white dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] rounded-full shadow-md flex items-center justify-center z-20 hover:bg-[#f0f2f5] dark:hover:bg-[#2a3942]"
                    >
                        <ArrowDown size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Input Bar - WhatsApp Style */}
            <footer className="bg-[#f0f2f5] dark:bg-[#202c33] min-h-[62px] flex items-end px-3 py-2.5 z-10 gap-2">
                <div className="flex items-center text-[#54656f] dark:text-[#8696a0]">
                    <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors emoji-toggle-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <Smile size={26} />
                    </button>
                    {/* Removed Paperclip per user request */}
                </div>

                <div className="flex-1 relative flex items-center">
                    {isRecording ? (
                        <div className="w-full bg-white dark:bg-[#2a3942] rounded-lg px-4 py-2.5 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                                <span className="text-rose-500 font-bold text-sm tracking-wider tabular-nums">{recordingTime}s</span>
                            </div>
                            <span className="text-gray-400 text-[12px] font-medium">جاري التسجيل...</span>
                            <button onClick={stopRecording} className="text-rose-500 text-sm font-bold hover:underline">إلغاء</button>
                        </div>
                    ) : (
                        <textarea
                            rows={1}
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                if (currentUser) setTyping(selectedConv.id, e.target.value.length > 0, currentUser.name);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e as any);
                                }
                            }}
                            placeholder="اكتب رسالة"
                            className="w-full bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#d1d7db] text-sm md:text-base border-none rounded-lg px-3 py-2.5 focus:ring-0 max-h-32 resize-none text-right scroll-smooth custom-scrollbar"
                        />
                    )}
                    
                    {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-4 z-[200]" ref={emojiPickerRef}>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="shadow-2xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                                    width={320}
                                    height={400}
                                    previewConfig={{ showPreview: false }}
                                />
                            </motion.div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center">
                    {newMessage.trim() || isRecording ? (
                        <button
                            onClick={isRecording ? sendRecording : handleSendMessage}
                            className="bg-[#00a884] text-white p-3 rounded-full hover:bg-[#008f6f] transition-all flex-shrink-0"
                        >
                            <Send size={24} className={cn("transition-transform", isSending && "animate-pulse")} />
                        </button>
                    ) : (
                        <button 
                            onClick={startRecording}
                            className="bg-[#00a884] text-white p-3.5 rounded-full hover:bg-[#008f6f] transition-all flex-shrink-0 shadow-lg active:scale-95"
                        >
                            <Mic size={24} />
                        </button>
                    )}
                </div>
            </footer>

        </div>
    );
};

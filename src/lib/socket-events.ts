// Socket.IO event names shared between client and server
// All event names MUST be used via these constants, never as raw strings

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Chat
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  NEW_MESSAGE: 'new_message',
  NEW_CONVERSATION: 'new_conversation',
  TYPING: 'typing',

  // Live Sessions
  SESSION_INVITE: 'session_invite',
  SESSION_ENDED: 'session_ended',
  SESSION_LINK_UPDATED: 'session_link_updated',
  LIVE_SESSION_STARTED: 'live_session_started',

  // Notifications
  NOTIFICATION: 'notification',

  // CRM
  TRIAL_SESSION_UPDATED: 'trial_session_updated',
  LEAD_UPDATED: 'lead_updated',
  CONTACT_MESSAGE_RECEIVED: 'contact_message_received',
  JOB_APPLICATION_RECEIVED: 'job_application_received',

  // Presence
  PRESENCE_UPDATE: 'presence_update',
  PRESENCE_PING: 'presence_ping',
} as const;

// Socket event payload types shared across files
export interface SessionInvitePayload {
  teacherName: string;
  subject: string;
  sessionId: string;
  meetingUrl: string;
  meetingProvider: string;
}

export interface SessionLinkUpdatedPayload {
  sessionId: string;
  meetingUrl: string;
  meetingProvider: string;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface NewMessagePayload {
  id: string;
  conversationId: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
}



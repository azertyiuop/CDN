export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  role?: 'viewer' | 'moderator' | 'admin' | 'streamer';
  isSystem?: boolean;
  color?: string;
  ip?: string;
}

export interface ChatUser {
  id: string;
  username: string;
  ip: string;
  joinTime: Date;
  messageCount: number;
  isMuted: boolean;
  isBanned: boolean;
  lastActivity: Date;
}

export interface StreamLog {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  ip?: string;
  username?: string;
}

export interface ConnectedUser {
  id: string;
  username: string;
  ip: string;
  userAgent: string;
  connectTime: Date;
  lastActivity: Date;
  page: string;
}

export interface Report {
  id: string;
  messageId: string;
  reportedUser: string;
  reportedMessage: string;
  reportReason: string;
  reporterUsername: string;
  timestamp: Date;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface PopupAnnouncement {
  id: string;
  title: string;
  description: string;
  image: string;
  isActive: boolean;
}

export interface Stream {
  id: string;
  title: string;
  thumbnail: string;
  isLive: boolean;
  viewers: number;
  duration: number;
  startTime: Date;
  category: string;
  quality: string;
  tags: string[];
}
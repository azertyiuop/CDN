export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  role?: 'viewer' | 'moderator' | 'admin' | 'streamer';
  isSystem?: boolean;
  color?: string;
  ip?: string;
  streamKey?: string; // Identifiant du stream ou 'global' pour le chat global
  chatType?: 'global' | 'stream' | string; // Type de chat pour différencier les contextes
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
  isMuted?: boolean;
  muteEndTime?: Date;
  muteCount?: number;
  muteHistory?: Array<{
    mutedAt: Date;
    duration: number;
    reason: string;
  }>;
  role?: 'viewer' | 'moderator' | 'admin' | 'owner';
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

export interface StreamKey {
  id: string;
  key: string;
  title: string;
  description: string;
  thumbnail: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  viewers: number;
  startTime?: Date;
  duration: number;
  hasM3U8?: boolean; // Indique si un fichier M3U8 a été uploadé
  hasM3U8?: boolean; // Indique si le fichier M3U8 a été uploadé
}
// Types centralisés pour l'application
export interface User {
  id: string;
  username: string;
  role: 'viewer' | 'moderator' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  role: 'viewer' | 'moderator' | 'admin';
  isSystem?: boolean;
  color?: string;
  ip?: string;
}

export interface ConnectedUser {
  id: string;
  username: string;
  ip: string;
  connectTime: Date;
  lastActivity: Date;
  page: string;
  role: 'viewer' | 'moderator' | 'admin';
  isMuted?: boolean;
  muteEndTime?: Date;
}

export interface StreamSource {
  id: string;
  name: string;
  url: string;
  type: 'm3u8' | 'mp4' | 'webm';
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface SecurityLog {
  id: string;
  action: string;
  username?: string;
  ip: string;
  timestamp: Date;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
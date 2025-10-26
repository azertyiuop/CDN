export const formatTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getRoleColor = (role?: string) => {
  switch (role) {
    case 'admin': return 'text-red-500';
    case 'moderator': return 'text-blue-500';
    default: return 'text-slate-600';
  }
};

export const getRoleIcon = (role?: string) => {
  switch (role) {
    case 'streamer': return '🎥';
    case 'admin': return '👑';
    case 'moderator': return '🛡️';
    default: return '';
  }
};

export const checkModeratorCredentials = (username: string) => {
  const lowerUsername = username.toLowerCase();
  return lowerUsername.includes('mod') || lowerUsername.includes('admin');
};
// Utilitaires centralisés
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

export const generateSecureId = () => {
  return crypto.randomUUID();
};

export const sanitizeInput = (input: string) => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const validateM3U8Url = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const encryptData = (data: string, key: string): string => {
  return btoa(data + key);
};

export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const decoded = atob(encryptedData);
    return decoded.replace(key, '');
  } catch {
    return '';
  }
};

export const checkPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = { viewer: 0, moderator: 1, admin: 2 };
  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy];
};
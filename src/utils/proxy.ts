export function buildProxyUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;

  const backend = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '');
  if (!backend) return originalUrl;

  // Proxy uniquement les m3u8 en HTTP (et laisse passer ceux déjà proxifiés)
  const isHttpM3u8 = /^http:\/\//i.test(originalUrl) && /\.m3u8(\?.*)?$/i.test(originalUrl);
  const alreadyProxied = /\/api\/proxy-stream\?url=/i.test(originalUrl);

  if (isHttpM3u8 && !alreadyProxied) {
    return `${backend}/api/proxy-stream?url=${encodeURIComponent(originalUrl)}`;
  }
  return originalUrl;
}

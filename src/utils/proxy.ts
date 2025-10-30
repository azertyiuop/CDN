export function buildProxyUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;

  const backendBase = (import.meta as any)?.env?.VITE_BACKEND_URL as string | undefined;
  const backend = backendBase && backendBase.replace(/\/+$/, '');

  const isHttpM3u8 = /^http:\/\//i.test(originalUrl) && /\.m3u8(\?.*)?$/i.test(originalUrl);
  const alreadyProxied = /\/api\/proxy-stream\?url=/i.test(originalUrl);

  if (!isHttpM3u8 || alreadyProxied) return originalUrl;

  // Chemin du proxy côté backend
  const proxyPath = '/api/proxy-stream?url=' + encodeURIComponent(originalUrl);

  // 1) Si VITE_BACKEND_URL est fourni, on l'utilise
  if (backend) {
    return `${backend}${proxyPath}`;
  }

  // 2) Fallback: backend embarqué dans le dossier "backend" (même origine)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/backend${proxyPath}`;
  }

  // Dernier recours: retourner l'URL originale
  return originalUrl;
}

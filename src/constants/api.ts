const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL não definida. Copie o .env.example para .env.",
  );
}

export const API_URL: string = apiUrl;

export function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

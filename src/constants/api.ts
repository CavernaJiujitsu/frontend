import Constants from "expo-constants";

export const API_URL: string =
  Constants.expoConfig?.extra?.API_URL ?? "http://localhost:3000";

export function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

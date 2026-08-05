export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : (import.meta.env.DEV ? "http://localhost:5024" : "");

export const getFullUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) return path;
  if (!API_BASE_URL) return path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

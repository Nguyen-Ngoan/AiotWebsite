// src/lib/apiConfig.ts

// Backend mặc định trên Cloud Run
const DEFAULT_PROD_API = "https://aiotautotech-backend-sb5sz45ysq-as.a.run.app/api";

// Backend local
const DEFAULT_LOCAL_API = "http://127.0.0.1:8000/api";

/**
 * Trả về base URL cho backend.
 * - Local (localhost / 127.0.0.1)  -> dùng API local
 * - Các domain khác (run.app, aiotautotech.com, ...) -> dùng Cloud Run backend
 * - Nếu có NEXT_PUBLIC_API_URL thì ưu tiên dùng (cho trường hợp sau này muốn đổi URL mà không sửa code)
 */
export function getApiBaseUrl(): string {
  // Ưu tiên biến môi trường NEXT_PUBLIC_API_URL (nếu có)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, ""); // bỏ dấu / cuối nếu có
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    const isLocal = host === "localhost" || host === "127.0.0.1";

    if (isLocal) {
      return DEFAULT_LOCAL_API;
    }
  }

  // Mặc định: backend Cloud Run
  return DEFAULT_PROD_API;
}

/**
 * Helper: trả về URL đầy đủ kèm path
 * ví dụ: getApiUrl("/posts/") -> "https://.../api/posts/"
 */
export function getApiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!path.startsWith("/")) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
}

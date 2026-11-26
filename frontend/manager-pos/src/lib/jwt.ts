export interface JwtPayload {
  sub: string;
  tenant_id: string;
  role: string;
  exp: number;
  iat: number;
  username?: string;
}

export function decodeJWT(token: string): JwtPayload | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error("Failed to decode JWT", error);
    return null;
  }
}
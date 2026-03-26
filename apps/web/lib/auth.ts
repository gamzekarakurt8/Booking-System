import type { AuthResponse } from "@booking/shared";

const TOKEN_STORAGE_KEY = "booking_token";
const USER_STORAGE_KEY = "booking_user";

export type ClientUser = AuthResponse["user"];

export function persistSession(token: string, user: ClientUser) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  document.cookie = `booking_token=${token}; Path=/; Max-Age=604800; SameSite=Lax`;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  document.cookie = "booking_token=; Path=/; Max-Age=0; SameSite=Lax";
}

export function readSession() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const userRaw = localStorage.getItem(USER_STORAGE_KEY);

  if (!token || !userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as ClientUser;
    return { token, user };
  } catch {
    return null;
  }
}

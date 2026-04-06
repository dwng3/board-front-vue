const ACCESS_TOKEN_KEY = "accessToken";
const USERNAME_KEY = "username";
const NICKNAME_KEY = "nickname";
const GUEST_MODE_KEY = "guestMode";

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(NICKNAME_KEY);
  localStorage.removeItem(GUEST_MODE_KEY);
}

export function setAuthUser(username: string, nickname = "") {
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(NICKNAME_KEY, nickname);
  localStorage.removeItem(GUEST_MODE_KEY);
}

export function setGuestMode() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(NICKNAME_KEY);
  localStorage.setItem(GUEST_MODE_KEY, "true");
}

export function isGuestMode() {
  return localStorage.getItem(GUEST_MODE_KEY) === "true";
}

export function getAuthUsername() {
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function getAuthNickname() {
  return localStorage.getItem(NICKNAME_KEY) || "";
}

export function createAuthHeaders(headers: Record<string, string> = {}) {
  const token = getAccessToken();

  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

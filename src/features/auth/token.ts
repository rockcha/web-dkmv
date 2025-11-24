// src/features/auth/token.ts (작은 유틸로 빼도 좋고, AuthContext 안에 써도 됨)
export const TOKEN_KEY = "dkmv_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

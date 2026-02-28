export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("memotai_access_token", access);
  localStorage.setItem("memotai_refresh_token", refresh);
};

export const getAccessToken = () => {
  return localStorage.getItem("memotai_access_token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("memotai_refresh_token");
};

export const clearTokens = () => {
  localStorage.removeItem("memotai_access_token");
  localStorage.removeItem("memotai_refresh_token");
};
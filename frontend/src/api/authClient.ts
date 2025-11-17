import axios from 'axios';

const SERVER_BASE_URL: string = import.meta.env.VITE_SERVER_BASE_URL as string;

const TOKEN_KEY = 'authToken';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const authClient = axios.create({
  baseURL: SERVER_BASE_URL + '/auth',
  withCredentials: true,
});

authClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (email: string, password: string) => {
  const response = await authClient.post('/', { email, password });
  if (response.data.accessToken) {
    setAuthToken(response.data.accessToken);
  }
  return { ...response.data, userId: response.data.user.id };
};

export const login = async (email: string, password: string) => {
  const response = await authClient.post('/', { email, password });
  if (response.data.accessToken) {
    setAuthToken(response.data.accessToken);
  }
  return { ...response.data, userId: response.data.user.id };
};

export const refresh = async () => {
  const response = await authClient.post('/refresh');
  if (response.data.accessToken) {
    setAuthToken(response.data.accessToken);
  }
  return { ...response.data, userId: response.data.user.id };
};

export const logout = async () => {
  const response = await authClient.post('/logout');
  removeAuthToken();
  return response.data;
};

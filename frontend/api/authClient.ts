import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export const authClient: AxiosInstance = axios.create({});

export const login = () => {}

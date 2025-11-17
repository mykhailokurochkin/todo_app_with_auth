import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

const SERVER_BASE_URL: string = import.meta.env.VITE_SERVER_BASE_URL as string;

export const todosClient: AxiosInstance = axios.create({});

export const getAll = () => {};

export const create = () => {};

export const update = () => {};

export const remove = () => {};
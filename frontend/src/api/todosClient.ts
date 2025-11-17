import axios from 'axios';
import type { AxiosInstance } from 'axios';

const SERVER_BASE_URL: string = import.meta.env.VITE_SERVER_BASE_URL as string;

export const todosClient: AxiosInstance = axios.create({
  baseURL: SERVER_BASE_URL,
});

export const getTodos = async (userId: string | number) => {
  const response = await todosClient.get('/todos', { params: { userId } });
  return response.data;
};

export const create = async (title: string, userId: string | number) => {
  const response = await todosClient.post('/todos', { todo: { title, userId } });
  return response.data;
};

export const update = (_todoId: number, _updates: { title?: string; completed?: boolean }) => { };

export const remove = (_todoId: number) => { };
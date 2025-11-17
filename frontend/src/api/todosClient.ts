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

export const create = async (title: string, description: string, userId: string | number) => {
  const response = await todosClient.post('/todos', { todo: { title, description, userId } });
  return response.data;
};

export const update = async (
  todoId: number,
  updates: { title?: string; status?: string; description?: string }
) => {
  const response = await todosClient.put(`/todos/${todoId}`, { updates });
  return response.data;
};

export const remove = async (todoId: number) => {
  const response = await todosClient.delete(`/todos/${todoId}`);
  return response.data;
};
export type Todo = {
  id: number,
  title: string,
  description?: string,
  status: 'todo' | 'in progress' | 'done',
  userId: number,
}
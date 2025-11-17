import { Todo } from "../db/sequelize.js";

export function getAll(userId: number) {
  return Todo.findAll({ where: { userId } });
}

export function add(title: string, userId: number) {
  return Todo.create({ title, completed: false, userId });
}

export function update(todoId: number, updates: { title?: string; completed?: boolean }) {
  return Todo.update(updates, { where: { id: todoId } });
}

export function remove(todoId: number) {
  return Todo.destroy({ where: { id: todoId } });
}
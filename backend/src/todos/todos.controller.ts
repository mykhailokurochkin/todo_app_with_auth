import { Router, Request, Response } from "express";
import { add, getAll, update, remove } from "./todos.service.js";
import { Todo } from "../db/sequelize.js";

const todosRouter = Router();

todosRouter.get('/', async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId in query parameters" });
  }

  try {
    const todos = await getAll(Number(userId));
    return res.status(200).json({ todos: todos as Todo[] });
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return res.status(500).json({ error: "Failed to fetch todos", details: (error as Error).message });
  }
});

todosRouter.post('/', async (req: Request, res: Response) => {
  const { title, description, userId } = req.body.todo;
  if (typeof title !== 'string' || !userId) {
    return res.status(400).json({ error: "Invalid or missing todo in request body" });
  }

  try {
    const newTodo = await add(title, description, Number(userId));
    return res.status(201).json({ todo: newTodo });
  } catch (error) {
    console.error('Error creating todo:', error);
    return res.status(500).json({ error: "Failed to create todo", details: (error as Error).message });
  }
});

todosRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { updates } = req.body;

  if (!id || !updates) {
    return res.status(400).json({ error: "Invalid or missing id or updates in request" });
  }

  try {
    await update(Number(id), updates);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update todo" });
  }
});

todosRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Invalid or missing id in request" });
  }

  try {
    await remove(Number(id));
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete todo" });
  }
});

export default todosRouter;
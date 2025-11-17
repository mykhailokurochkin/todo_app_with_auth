import { Router, Request, Response } from "express";
import { add, getAll } from "./todos.service.js";
import { Todo } from "../db/sequelize.js";

const todosRouter = Router();

todosRouter.get('/todos', async (req: Request, res: Response) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId in query parameters" });
  }

  try {
    const todos = await getAll(userId as any);
    return res.status(200).json({ todos: todos as Todo[] });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch todos" });
  }
});

todosRouter.post('/todos', async (req: Request, res: Response) => {
  const { title, userId, completed } = req.body.todo;
  if (
    typeof title !== 'string' ||
    typeof userId !== 'number' ||
    (typeof completed !== 'undefined' && typeof completed !== 'boolean')
  ) {
    return res.status(400).json({ error: "Invalid or missing todo in request body" });
  }

  try {
    const newTodo = await add({ title, userId, completed });
    return res.status(201).json({ todo: newTodo });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create todo" });
  }
});

export default todosRouter;
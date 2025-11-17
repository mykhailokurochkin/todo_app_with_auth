import { useMutation, useQueryClient } from '@tanstack/react-query';
import { update, remove } from '../../api/todosClient';
import type { Todo } from '../../types/Todo';
import { useState, useRef, useEffect } from 'react';

interface TodoItemProps {
  todo: Todo;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const queryClient = useQueryClient();
  const [currentTitle, setCurrentTitle] = useState(todo.title);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.selectionStart = inputRef.current.value.length;
    }
  }, [showInput]);

  const { mutate: useUpdateMutation } = useMutation({
    mutationFn: (completed: boolean) => {
      const updatedTodo = { ...todo, completed };
      return update(updatedTodo.id, updatedTodo);
    },
    onMutate: async (completed: boolean) => {
      const newTodo = { ...todo, completed };
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] | undefined) => {
        if (!oldTodos) return [newTodo];
        return oldTodos.map((t: Todo) =>
          t.id === newTodo.id ? newTodo : t
        );
      });
      return { previousTodos };
    },
    onError: (_err, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos as Todo[]);
      }
    },
    onSettled: (data) => {
      if (data) {
        queryClient.setQueryData(['todos', data.id], data);
      }
    },
  });

  const { mutate: useDeleteMutation } = useMutation({
    mutationFn: async () => {
      const deletedId = todo.id;
      await remove(deletedId);
      return deletedId;
    },
    onSuccess: (deletedId: number | string) => {
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] | undefined) => {
        if (!oldTodos) return [];
        return oldTodos.filter(t => t.id !== deletedId);
      });
      queryClient.removeQueries({ queryKey: ['todos', deletedId] });
    }
  });

  const { mutate: useRenameMutation } = useMutation({
    mutationFn: (newTitle: string) => {
      return update(todo.id, { title: newTitle });
    },
    onMutate: async (newTitle: string) => {
      const updatedTodo = { ...todo, title: newTitle };
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] | undefined) => {
        if (!oldTodos) return [updatedTodo];
        return oldTodos.map((t: Todo) =>
          t.id === updatedTodo.id ? updatedTodo : t
        );
      });
      return { previousTodos };
    },
    onError: (_err, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos as Todo[]);
      }
    },
    onSuccess: (data) => {
      setCurrentTitle(data.title);
      setShowInput(false);
    },
    onSettled: (data) => {
      if (data) {
        queryClient.setQueryData(['todos', data.id], data);
      }
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
  };

  const handleInputBlur = () => {
    if (currentTitle.trim() && currentTitle !== todo.title) {
      useRenameMutation(currentTitle.trim());
    }
    setShowInput(false);
    setCurrentTitle(todo.title);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (currentTitle.trim()) {
        useRenameMutation(currentTitle.trim());
      }
      setShowInput(false);
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setCurrentTitle(todo.title);
    }
  };

  const handleTodoKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !showInput) {
      e.preventDefault();
      setShowInput(true);
    }
  };

  return (
    <div className="todo__item">
      {showInput ? (
        <input
          className="todo__item--input"
          type="text"
          ref={inputRef}
          value={currentTitle}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
        />
      ) : (
        <button
          className="todo__item--semantic"
          type="button"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            width: "100%", 
            background: "none", 
            border: "none", 
            padding: 0, 
            textAlign: "left", 
            cursor: "pointer" 
          }}
          tabIndex={0}
          aria-label={`Edit or interact with todo: ${todo.title}`}
          onDoubleClick={() => setShowInput(true)}
          onKeyDown={handleTodoKeyDown}
        >
          <div className="todo__item--content" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              className="todo__item--checkbox"
              checked={todo.completed} 
              onChange={e => { 
                e.stopPropagation(); 
                useUpdateMutation(!todo.completed); 
              }}
              tabIndex={-1}
            />
            <span className="todo__item--label" style={{ marginLeft: 8 }}>{todo.title}</span>
          </div>
          <button
            className="todo__item--button"
            type="button"
            tabIndex={-1}
            aria-label="Delete todo"
            onClick={e => {
              e.stopPropagation();
              useDeleteMutation();
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="6"
                y1="6"
                x2="14"
                y2="14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="14"
                y1="6"
                x2="6"
                y2="14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </button>
      )}
    </div>
  );
}

export default TodoItem;
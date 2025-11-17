import { useMutation, useQueryClient } from '@tanstack/react-query';
import { update, remove } from '../../api/todosClient';
import type { Todo } from '../../types/Todo';
import { useState, useRef, useEffect } from 'react';

interface TodoItemProps {
  todo: Todo;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(todo.title);
  const [currentDescription, setCurrentDescription] = useState(todo.description || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentTitle(todo.title);
    setCurrentDescription(todo.description || '');
  }, [todo.title, todo.description]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.selectionStart = inputRef.current.value.length;
    }
  }, [isEditing]);

  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: (status: string) => update(todo.id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const { mutate: deleteMutation } = useMutation({
    mutationFn: () => remove(todo.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const { mutate: updateTitleMutation } = useMutation({
    mutationFn: (newTitle: string) => update(todo.id, { title: newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsEditing(false);
    },
    onError: () => setCurrentTitle(todo.title),
  });

  const { mutate: updateDescriptionMutation } = useMutation({
    mutationFn: (newDescription: string) => update(todo.id, { description: newDescription }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsEditing(false);
    },
    onError: () => setCurrentDescription(todo.description || ''),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
  };

  const submitRename = () => {
    const trimmedTitle = currentTitle.trim();
    if (!trimmedTitle) {
      deleteMutation();
      return;
    }
    if (trimmedTitle !== todo.title) {
      updateTitleMutation(trimmedTitle);
    } else {
      setIsEditing(false);
      setCurrentTitle(todo.title);
    }
  };

  const handleInputBlur = () => {
    submitRename();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentTitle(todo.title);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentDescription(e.target.value);
  };

  const submitDescriptionChange = () => {
    const trimmedDescription = currentDescription.trim();
    if (trimmedDescription !== (todo.description || '')) {
      updateDescriptionMutation(trimmedDescription);
    } else {
      setIsEditing(false);
      setCurrentDescription(todo.description || '');
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitDescriptionChange();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentDescription(todo.description || '');
    }
  };

  return (
    <>
      <div className="todo__item" data-status={todo.status || "todo"}>
        {isEditing ? (
          <div className="todo__item--edit-container">
            <input
              className="todo__item--input"
              type="text"
              ref={inputRef}
              value={currentTitle}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              placeholder="Title"
            />
            <textarea
              className="todo__item--textarea"
              ref={textareaRef}
              value={currentDescription}
              onChange={handleDescriptionChange}
              onBlur={submitDescriptionChange}
              onKeyDown={handleDescriptionKeyDown}
              placeholder="Description (optional)"
              rows={2}
            />
            <button
              className="todo__item--button todo__item--save"
              type="button"
              onClick={() => {
                submitRename();
                if (currentTitle.trim()) {
                  submitDescriptionChange();
                }
              }}
              aria-label="Save todo"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5 4.5L6 12L2.5 8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="todo__item--row">
            <select
              className="todo__item--dropdown"
              value={todo.status || "todo"}
              onChange={e => updateStatusMutation(e.target.value)}
              tabIndex={-1}
              style={{ marginRight: 8 }}
            >
              <option value="todo">To do</option>
              <option value="in progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <div className="todo__item--content">
              <span className="todo__item--label" style={{ textDecoration: todo.status === 'done' ? 'line-through' : 'none' }}>
                {todo.title}
              </span>
            </div>
            <button
              className="todo__item--button todo__item--edit"
              type="button"
              tabIndex={-1}
              aria-label="Edit todo"
              onClick={() => setIsEditing(true)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 2.5L13.5 4.5M2 12L3 13L11 5L10 4L2 12Z"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="todo__item--button"
              type="button"
              tabIndex={-1}
              aria-label="Delete todo"
              onClick={e => {
                e.stopPropagation();
                deleteMutation();
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
          </div>
        )}
      </div>
      {!isEditing && todo.description && (

        <span
          className="todo__item--description"
          style={{
            fontSize: '0.85rem',
            color: '#64748b',
            textDecoration: todo.status === 'done' ? 'line-through' : 'none'
          }}
        >
          {todo.description}
        </span>

      )}
    </>
  );
}

export default TodoItem;
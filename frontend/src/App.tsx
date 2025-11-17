import { useState, useEffect } from 'react'
import './App.css'
import type { FiltersType } from './types/FiltersType';
import AuthForm from './components/AuthForm/AuthForm';
import TodoItem from './components/TodoItem/TodoItem';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { create, getTodos } from './api/todosClient';
import { refresh, logout } from './api/authClient';
import type { Todo } from './types/Todo';

const App = () => {
  const [currentFilter, setCurrentFilter] = useState<FiltersType>('all');
  const [newTodoInput, setNewTodoInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await refresh();
        setIsLoggedIn(true);
        setUserId(result.userId);
      } catch (error) {
        setIsLoggedIn(false);
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (id: number) => {
    setIsLoggedIn(true);
    setUserId(id);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUserId(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const { data: todos, isLoading: isLoadingTodos } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await getTodos(userId as number);
      return response.todos;
    },
    enabled: isLoggedIn && userId !== null,
  });

  const { mutate: addTodo } = useMutation({
    mutationFn: async () => {
      return await create(newTodoInput, userId as number);
    },
    onSuccess: () => {
      setNewTodoInput('');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addTodo();
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="todo__app--container">
      {!isLoggedIn ? (
        <div className="auth-form-wrapper">
          <AuthForm onSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <div className="todo__app">
          <header className='header'>
            <form onSubmit={handleSubmit}>
              <input
                onChange={event => setNewTodoInput(event.target.value)}
                value={newTodoInput}
                data-cy="NewTodoField"
                type="text"
                className="header__input"
                placeholder="What needs to be done?"
                autoFocus
              />
            </form>
          </header >
          <main className='todo__list'>
            {isLoadingTodos ? (
              <div>Loading todos...</div>
            ) : (
              todos
                .filter((todo: Todo) => {
                  if (currentFilter === 'all') {
                    return true;
                  } else if (currentFilter === 'active') {
                    return !todo.completed;
                  } else if (currentFilter === 'completed') {
                    return todo.completed;
                  }
                  return true;
                })
                .map((todo: Todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))
            )}
          </main>
          <footer className='footer'>
            <div className="counter">
              {todos?.length} items left
            </div>

            <div className="filters">
              <button
                className={`
                  filters__button 
                  ${currentFilter === 'all' ? 'filters__button--active' : ''}
                `}
                onClick={() => setCurrentFilter('all')}
                type='button'
              >All</button>
              <button
                className={`
                  filters__button 
                  ${currentFilter === 'active' ? 'filters__button--active' : ''}
                `}
                onClick={() => setCurrentFilter('active')}
                type='button'
              >Active</button>
              <button
                className={`
                  filters__button 
                  ${currentFilter === 'completed' ? 'filters__button--active' : ''}
                `}
                onClick={() => setCurrentFilter('completed')}
                type='button'
              >Completed</button>
            </div>

            <div className="footer__actions">
              <button className='logout-button' onClick={handleLogout} type='button'>Logout</button>
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}

export default App

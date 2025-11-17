import { useState, useEffect } from 'react'
import './App.css'
import type { FiltersType } from './types/FiltersType';
import AuthForm from './components/AuthForm/AuthForm';
import { useMutation, useQuery } from '@tanstack/react-query';
import { create, getTodos } from './api/todosClient';
import { refresh, logout } from './api/authClient';

const App = () => {
  const [currentFilter, setCurrentFilter] = useState<FiltersType>('all');
  const [newTodoInput, setNewTodoInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refresh();
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const id = 25;

  const { data: todos, isLoading: isLoadingTodos } = useQuery({
    queryKey: ['todos'],
    queryFn: () => getTodos(id),
    enabled: isLoggedIn,
  });

  const { mutate: addTodo } = useMutation({
    mutationFn: async () => {
      return await create(newTodoInput, id);
    },
    onSuccess: () => {
      setNewTodoInput('');
    }
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
          </main>
          <footer className='footer'>
            <div className="counter">
              4 items left
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

            <button className='clear' type='button'>Clear Completed</button>
            <button onClick={handleLogout} type='button'>Logout</button>
          </footer>
        </div>
      )}
    </div>
  )
}

export default App

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
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { mutate: refreshMutation, isPending } = useMutation({
    mutationFn: refresh,
    onSuccess: (result) => {
      setIsLoggedIn(true);
      setUserId(result.userId);
    },
    onError: () => {
      setIsLoggedIn(false);
      setUserId(null);
    },
  });

  const filterCallback = (todo: Todo) => {
    if (currentFilter === 'all') {
      return true;
    } else if (currentFilter === 'todo') {
      return todo.status === 'todo';
    } else if (currentFilter === 'in progress') {
      return todo.status === 'in progress';
    } else if (currentFilter === 'done') {
      return todo.status === 'done';
    }
    return true;
  }

  useEffect(() => {
    refreshMutation();
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
      return await create(newTodoInput, newTodoDescription, userId as number);
    },
    onSuccess: () => {
      setNewTodoInput('');
      setNewTodoDescription('');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodoInput.trim()) {
      return;
    }
    
    addTodo();
  };

  if (isPending) {
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
            <form onSubmit={handleSubmit} className='header__form'>
              <input
                onChange={event => setNewTodoInput(event.target.value)}
                value={newTodoInput}
                type="text"
                className="header__input"
                placeholder="What needs to be done?"
                autoFocus
              />
              <textarea
                onChange={event => setNewTodoDescription(event.target.value)}
                value={newTodoDescription}
                className="header__textarea"
                placeholder="Description"
                maxLength={255}
              />
              <button className='header__create-button' type='submit'>Create</button>
            </form>
          </header>
          {!isLoadingTodos && todos?.length > 0 && (
            <>
              <main className='todo__list'>
                {todos
                  ?.filter(filterCallback)
                  .map((todo: Todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))}
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
                  ${currentFilter === 'todo' ? 'filters__button--active' : ''}
                `}
                    onClick={() => setCurrentFilter('todo')}
                    type='button'
                  >To do</button>
                  <button
                    className={`
                  filters__button 
                  ${currentFilter === 'in progress' ? 'filters__button--active' : ''}
                `}
                    onClick={() => setCurrentFilter('in progress')}
                    type='button'
                  >In progress</button>
                  <button
                    className={`
                  filters__button 
                  ${currentFilter === 'done' ? 'filters__button--active' : ''}
                `}
                    onClick={() => setCurrentFilter('done')}
                    type='button'
                  >Done</button>
                </div>
                <button className='logout-button' onClick={handleLogout} type='button'>Logout</button>
              </footer>
            </>
          )}
          {!isLoadingTodos && (!todos || todos.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <p>No todos yet. Create your first one!</p>
              <button
                className='logout-button'
                onClick={handleLogout}
                type='button'
              >Log out</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App

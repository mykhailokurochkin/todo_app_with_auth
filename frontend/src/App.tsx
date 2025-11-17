
import { useState } from 'react'
import './App.css'
import TodoItem from './components/TodoItem/TodoItem'
import type { FiltersType } from './types/FiltersType';
import { useQuery } from '@tanstack/react-query';

const App = () => {
  const [currentFilter, setCurrentFilter] = useState<FiltersType>('all');

  const {} = useQuery({
    queryKey: ['todos'],
    queryFn: () => []
  });

  return (
    <div className="todo__app--container">
      <div className="todo__app">
        <header className='header'>
          <input
            type="text"
            className='header__input'
            placeholder='Create a new task'
          />
        </header>
        <main className='todo__list'>
          <TodoItem />
          <TodoItem />
          <TodoItem />
          <TodoItem />
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
        </footer>
      </div>
    </div>
  )
}

export default App

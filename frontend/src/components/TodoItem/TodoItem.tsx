const TodoItem = () => {
  return (
    <div className="todo__item">
      <div className="todo__item--content">
        <input type="checkbox" className="todo__item--checkbox" />
        <span className="todo__item--label">TodoItem</span>
      </div>
      <button className="todo__item--button" type="button">
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
  );
}

export default TodoItem;
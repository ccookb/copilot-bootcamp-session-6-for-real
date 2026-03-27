import React from 'react';
import TodoCard from './TodoCard';

function TodoList({ todos, onToggle, onEdit, onDelete, isLoading, projects }) {
  if (todos.length === 0) {
    return (
      <div className="todo-list empty-state">
        <p className="empty-state-message">
          No todos yet. Add one to get started! 👻
        </p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => {
        const project = projects && todo.projectId
          ? projects.find(p => p.id === todo.projectId) || null
          : null;
        return (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
            project={project}
            projects={projects || []}
          />
        );
      })}
    </div>
  );
}

export default TodoList;

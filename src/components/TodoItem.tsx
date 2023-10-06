import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Todo } from '../types/Todo';

import * as postService from '../api/todos';
import { useTodos } from '../hooks/useTodos';

type Props = {
  todo: Todo,
  active?: boolean,
};

export const TodoItem: React.FC<Props> = ({ todo, active = false }) => {
  const { setTodos, setErrorMessage } = useTodos();

  const inputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState(todo.title);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const updateTitle = (todoId: number, data: { title: string }) => {
    setIsLoading(true);

    return postService.updateTodoTitle(todoId, data)
      .then(updatedTodo => {
        setTodos(prevTodos => {
          if (prevTodos) {
            return prevTodos.map(currentTodo => {
              if (currentTodo.id === todo.id) {
                return updatedTodo;
              }

              return currentTodo;
            });
          }

          return null;
        });
      })
      .catch(() => setErrorMessage('Unable to update todo'))
      .finally(() => setIsLoading(false));
  };

  const deleteTodo = (todoId: number) => {
    setIsLoading(true);

    return postService.removeTodo(todoId)
      .then(() => {
        setTodos(prevTodos => {
          if (prevTodos) {
            return prevTodos.filter(currentTodo => currentTodo.id !== todoId);
          }

          return null;
        });
      })
      .catch(() => setErrorMessage('Unable to remove todo'))
      .finally(() => setIsLoading(false));
  };

  const reset = () => {
    setNewTitle(todo.title);
    setIsEditing(false);
  };

  const onEsc = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      reset();
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newTitle.length) {
      deleteTodo(todo.id)
        .finally(() => setIsEditing(false));
    }

    if (newTitle.length) {
      updateTitle(todo.id, { title: newTitle.trim() })
        .finally(() => setIsEditing(false));
    }
  };

  return (
    <div
      data-cy="Todo"
      className={cn(
        'todo',
        {
          completed: todo.completed,
        },
      )}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
        />
      </label>

      {!isEditing ? (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => setIsEditing(true)}
          >
            {isEditing ? (
              todo.title
            ) : (
              newTitle
            )}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => deleteTodo(todo.id)}
          >
            ×
          </button>
        </>
      ) : (
        <form
          onSubmit={handleFormSubmit}
        >
          <input
            ref={inputRef}
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            onBlur={() => updateTitle(todo.id, { title: newTitle })}
            onKeyDown={onEsc}
          />
        </form>
      )}

      <div
        data-cy="TodoLoader"
        className={cn(
          'modal',
          'overlay',
          {
            'is-active': isLoading || active,
          },
        )}
      >
        <div
          className={cn(
            'modal-background',
            'has-background-white-ter',
          )}
        />
        <div className="loader" />
      </div>
    </div>
  );
};
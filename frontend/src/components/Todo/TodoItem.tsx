import React from 'react'

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: number
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
        todo.completed
          ? 'bg-bg2/50 border-rule/50 opacity-60'
          : 'bg-bg2 border-rule hover:border-accent/50'
      }`}
      onClick={() => onToggle(todo.id)}
    >
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
          todo.completed
            ? 'bg-accent border-accent'
            : 'border-muted hover:border-accent'
        }`}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`font-medium text-sm truncate ${
            todo.completed ? 'line-through text-muted' : 'text-ink'
          }`}
        >
          {todo.title}
        </h4>
        {todo.description && (
          <p className="text-xs text-muted mt-1 truncate">{todo.description}</p>
        )}
        <p className="text-xs text-muted/50 mt-2">
          {new Date(todo.createdAt).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(todo.id)
        }}
        className="flex-shrink-0 p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

export default TodoItem

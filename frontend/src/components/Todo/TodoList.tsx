import React from 'react'
import TodoItem from './TodoItem'

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: number
}

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete }) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <p className="text-muted">还没有待办事项</p>
        <p className="text-sm text-muted/60 mt-1">添加一个新任务开始吧</p>
      </div>
    )
  }

  const sortedTodos = [...todos].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="space-y-3">
      {sortedTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default TodoList

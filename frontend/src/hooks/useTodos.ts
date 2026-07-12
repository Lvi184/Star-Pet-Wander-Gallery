import { useState, useEffect, useCallback } from 'react'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: number
}

const STORAGE_KEY = 'star-pet-todos'

const loadTodos = (): Todo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load todos from localStorage:', error)
  }
  return []
}

const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    console.error('Failed to save todos to localStorage:', error)
  }
}

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const addTodo = useCallback((title: string, description?: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      createdAt: Date.now()
    }
    setTodos((prev) => [newTodo, ...prev])
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }, [])

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    completedCount,
    totalCount
  }
}

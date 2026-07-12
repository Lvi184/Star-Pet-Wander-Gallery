import React, { useState } from 'react'

interface TodoFormProps {
  onAdd: (title: string, description?: string) => void
}

const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('请输入任务标题')
      return
    }
    
    setError('')
    onAdd(trimmedTitle, description.trim() || undefined)
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加新的待办事项..."
          className="w-full px-4 py-3 bg-bg2 border border-rule rounded-xl text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </div>
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="添加描述（可选）..."
          rows={2}
          className="w-full px-4 py-3 bg-bg2 border border-rule rounded-xl text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-accent text-bg font-semibold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        添加任务
      </button>
    </form>
  )
}

export default TodoForm

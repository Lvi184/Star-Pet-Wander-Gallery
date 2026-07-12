import React from 'react'
import { useTodos } from '../../hooks/useTodos'

const TodoPage: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo, completedCount, totalCount } = useTodos()
  const [newTodo, setNewTodo] = React.useState('')

  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim()) {
      addTodo(newTodo)
      setNewTodo('')
    }
  }

  const getStars = (count: number, max: number = 5) => {
    const stars = []
    for (let i = 0; i < max; i++) {
      stars.push(
        <div key={i} className={`star ${i < count ? 'filled' : 'empty'}`} />
      )
    }
    return stars
  }

  return (
    <div className="space-y-6">
      <div className="pixel-frame bg-gradient-to-br from-clay-800 to-brown-800">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/game/images/crystal.png" alt="todo" className="w-8 h-8 pixelated" />
              <div>
                <h2 className="font-display text-2xl text-accent glow-text">待办事项</h2>
                <p className="text-muted mt-1 font-body text-sm">管理你的任务进度</p>
              </div>
            </div>
            <div className="text-right">
              <div className="game-stat">{completedCount}/{totalCount}</div>
              <p className="text-xs text-muted font-body">已完成</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted font-body mb-2">
              <span>完成进度</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar w-full h-4 rounded">
              <div className="progress-bar-fill h-full rounded" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-end mt-2">
              <div className="star-container">{getStars(Math.ceil(progress / 20))}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pixel-card">
        <div className="p-4">
          <h3 className="font-display text-lg text-accent mb-3 pb-2 border-b-2 border-clay-600">
            <span className="text-xl">➕</span> 添加新任务
          </h3>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="输入新任务..."
              className="flex-1 px-4 py-2 bg-bg2 border-2 border-clay-600 rounded-lg text-ink text-sm font-body focus:outline-none focus:border-accent transition"
            />
            <button
              type="submit"
              className="pixel-button px-4 py-2 text-white font-display text-sm"
            >
              添加
            </button>
          </form>
        </div>
      </div>

      <div className="pixel-card">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-accent flex items-center gap-2">
              <span className="text-xl">📝</span> 任务列表
            </h3>
            {totalCount > 0 && (
              <span className="text-xs text-muted font-body">{totalCount} 个任务</span>
            )}
          </div>
          
          {todos.length === 0 ? (
            <div className="text-center py-8">
              <img src="/assets/game/images/heart_empty.png" className="w-12 h-12 mx-auto pixelated mb-2 opacity-50" />
              <p className="text-sm text-muted font-body">暂无任务，添加一个吧！</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div 
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    todo.completed 
                      ? 'bg-green-900/20 border-green-500/30' 
                      : 'bg-bg2 border-clay-600 hover:border-accent'
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition ${
                      todo.completed ? 'bg-green-500' : 'bg-bg border-2 border-clay-500'
                    }`}
                  >
                    {todo.completed && <span className="text-xs">✓</span>}
                  </button>
                  <span className={`flex-1 font-body text-sm ${todo.completed ? 'text-muted line-through' : 'text-ink'}`}>
                    {todo.title}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition font-body"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TodoPage

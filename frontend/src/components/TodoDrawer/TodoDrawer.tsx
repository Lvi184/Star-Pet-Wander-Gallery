import React, { useState } from 'react';
import { useTodos } from '../../hooks/useTodos';

export default function TodoDrawer() {
  const { todos, addTodo, toggleTodo, deleteTodo, completedCount, totalCount } = useTodos();
  const [newTodo, setNewTodo] = useState('');

  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-clay-900/80 p-3 border-2 border-clay-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-sm text-brown-200 shadow-solid">待办进度</h3>
            <div className="text-xs text-clay-400 font-body">{completedCount}/{totalCount} 已完成</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-display text-gold-400 shadow-solid">{progress}%</div>
          </div>
        </div>
        <div className="game-progress-bar h-3">
          <div
            className="h-full game-progress-bar-progress transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-clay-900/80 border-2 border-clay-700">
        <div className="px-3 py-2 border-b-2 border-clay-700">
          <h3 className="font-display text-sm text-brown-200 shadow-solid">➕ 添加新任务</h3>
        </div>
        <form onSubmit={handleAdd} className="p-3 flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="输入新任务..."
            className="flex-1 px-3 py-2 bg-clay-950/80 border-2 border-clay-700 text-sm text-brown-100 placeholder-clay-500 focus:outline-none focus:border-clay-500 transition-colors font-body"
          />
          <button
            type="submit"
            className="pixel-button px-3 py-2 text-sm text-brown-100"
          >
            <span>添加</span>
          </button>
        </form>
      </div>

      <div className="bg-clay-900/80 border-2 border-clay-700">
        <div className="px-3 py-2 border-b-2 border-clay-700 flex items-center justify-between">
          <h3 className="font-display text-sm text-brown-200 shadow-solid">📝 任务列表</h3>
          {totalCount > 0 && (
            <span className="text-xs text-clay-400 font-body">{totalCount} 个任务</span>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {todos.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-3xl mb-2 opacity-30">📋</div>
              <div className="text-xs text-clay-500 font-body">暂无任务，添加一个吧！</div>
            </div>
          ) : (
            <div className="p-2 space-y-1.5">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-2 p-2 border-2 transition-all ${
                    todo.completed
                      ? 'bg-jade-900/40 border-jade-700/40'
                      : 'bg-clay-800/60 border-clay-700/60 hover:border-clay-600'
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 flex items-center justify-center flex-shrink-0 transition ${
                      todo.completed
                        ? 'bg-jade-500 text-white'
                        : 'bg-clay-900/80 border-2 border-clay-600'
                    }`}
                  >
                    {todo.completed && <span className="text-[10px]">✓</span>}
                  </button>
                  <span
                    className={`flex-1 text-sm truncate font-body ${
                      todo.completed ? 'text-clay-500 line-through' : 'text-brown-200'
                    }`}
                  >
                    {todo.title}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-xs text-red-400 hover:text-red-300 flex-shrink-0 px-1 font-body"
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
  );
}

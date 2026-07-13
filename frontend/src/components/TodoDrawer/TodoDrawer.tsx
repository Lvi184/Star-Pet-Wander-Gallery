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
      <div className="bg-cosmos-900/60 rounded-lg p-3 border border-cosmos-800/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-cosmos-200">待办进度</h3>
            <div className="text-xs text-cosmos-400">{completedCount}/{totalCount} 已完成</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gold-400">{progress}%</div>
          </div>
        </div>
        <div className="h-2 bg-cosmos-950/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cosmos-500 to-gold-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-cosmos-900/40 rounded-lg border border-cosmos-800/50">
        <div className="px-3 py-2 border-b border-cosmos-800/50">
          <h3 className="text-sm font-semibold text-cosmos-200">➕ 添加新任务</h3>
        </div>
        <form onSubmit={handleAdd} className="p-3 flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="输入新任务..."
            className="flex-1 px-3 py-2 bg-cosmos-950/60 border border-cosmos-700/50 rounded-lg text-sm text-cosmos-100 placeholder-cosmos-500 focus:outline-none focus:border-cosmos-500 transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-gradient-to-r from-cosmos-500 to-cosmos-400 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            添加
          </button>
        </form>
      </div>

      <div className="bg-cosmos-900/40 rounded-lg border border-cosmos-800/50">
        <div className="px-3 py-2 border-b border-cosmos-800/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-cosmos-200">📝 任务列表</h3>
          {totalCount > 0 && (
            <span className="text-xs text-cosmos-400">{totalCount} 个任务</span>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {todos.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-3xl mb-2 opacity-30">📋</div>
              <div className="text-xs text-cosmos-500">暂无任务，添加一个吧！</div>
            </div>
          ) : (
            <div className="p-2 space-y-1.5">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    todo.completed
                      ? 'bg-jade-900/30 border-jade-700/30'
                      : 'bg-cosmos-800/40 border-cosmos-700/40 hover:border-cosmos-600/50'
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition ${
                      todo.completed
                        ? 'bg-jade-500 text-white'
                        : 'bg-cosmos-900/60 border border-cosmos-600/50'
                    }`}
                  >
                    {todo.completed && <span className="text-[10px]">✓</span>}
                  </button>
                  <span
                    className={`flex-1 text-sm truncate ${
                      todo.completed ? 'text-cosmos-500 line-through' : 'text-cosmos-200'
                    }`}
                  >
                    {todo.title}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-xs text-red-400 hover:text-red-300 flex-shrink-0 px-1"
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

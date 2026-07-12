import React, { useState } from 'react'
import { usePetStore } from '../../stores/petStore'

interface Message {
  id: string
  text: string
  isUser: boolean
}

const Interact: React.FC = () => {
  const pet = usePetStore()
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '主人，你终于来啦！我今天在森林里发现了很多有趣的东西~', isUser: false },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), text: input, isUser: true }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    setTimeout(() => {
      const replies = [
        '真的吗？我也很想你！',
        '我今天捡到了一块奇怪的石头，你要看看吗？',
        '下次我们一起去月牙湖吧，那里的风景可美了！',
        '我有点困了，但是见到你很开心~',
      ]
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: replies[Math.floor(Math.random() * replies.length)],
        isUser: false,
      }
      setMessages((prev) => [...prev, reply])
    }, 800)
  }

  const actions = [
    { label: '喂食', icon: '/assets/game/images/enemy_01.png', effect: 'energy +10', color: 'from-orange-600 to-orange-800' },
    { label: '抚摸', icon: '/assets/game/images/a_button.png', effect: 'mood +10', color: 'from-pink-600 to-pink-800' },
    { label: '赠送道具', icon: '/assets/game/images/key.png', effect: 'mood +5', color: 'from-purple-600 to-purple-800' },
    { label: '一起休息', icon: '/assets/game/images/heart_empty.png', effect: 'energy +20', color: 'from-blue-600 to-blue-800' },
  ]

  const getMoodHearts = (mood: number) => {
    const hearts = []
    for (let i = 0; i < 5; i++) {
      hearts.push(
        <div key={i} className={`heart ${mood > (i + 1) * 20 ? 'full' : 'empty'}`} />
      )
    }
    return hearts
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <img src="/assets/game/images/b_button.png" alt="interact" className="w-8 h-8 pixelated" />
        <h2 className="font-display text-2xl text-accent glow-text">宠物互动</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="pixel-card bg-gradient-to-br from-clay-800 to-brown-800">
          <div className="p-6 flex flex-col items-center text-center">
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-bg2 to-clay-700 border-4 ${pet.mood > 70 ? 'border-green-500' : pet.mood > 40 ? 'border-accent' : 'border-orange-500'} flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(56,189,248,0.6)] pulse-glow`}>
              <img 
                src="/assets/game/atlases/generated/hero.png" 
                alt={pet.name}
                className="w-full h-full object-contain pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <h3 className="font-display text-xl text-white mt-4 glow-text">{pet.name}</h3>
            <p className="text-sm text-muted font-body">{pet.species}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="game-label">心情</span>
              <div className="heart-container">{getMoodHearts(pet.mood)}</div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="game-label">体力</span>
              <div className="progress-bar w-24 h-3 rounded">
                <div className="progress-bar-fill h-full rounded" style={{ width: `${pet.energy}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="pixel-chats bg-clay-700 p-4">
            <div className="h-72 overflow-y-auto flex flex-col gap-3 pr-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.isUser 
                      ? 'bg-accent text-white rounded-br-none' 
                      : 'bg-bg2 text-ink rounded-bl-none border border-clay-600'
                  }`}>
                    <p className="text-sm font-body leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="和宠物说点什么..."
              className="flex-1 px-4 py-3 bg-bg2 border-2 border-clay-600 rounded-lg text-ink text-sm font-body focus:outline-none focus:border-accent transition"
            />
            <button
              onClick={handleSend}
              className="pixel-button px-6 py-3 text-white font-display text-sm"
            >
              发送
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                className={`flex flex-col items-center gap-2 p-4 bg-gradient-to-b ${action.color} rounded-lg border-2 border-opacity-50 hover:border-accent transition hover:-translate-y-1 shadow-lg`}
              >
                <img src={action.icon} alt={action.label} className="w-8 h-8 pixelated" />
                <span className="text-xs font-display text-white">{action.label}</span>
                <span className="text-[10px] text-white/70 font-body">{action.effect}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Interact

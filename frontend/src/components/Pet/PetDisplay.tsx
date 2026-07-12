import React, { useState, useEffect } from 'react'

interface PetDisplayProps {
  mood: number
  energy: number
  currentAction: string
  onInteract: (action: 'pet' | 'feed' | 'play') => void
}

type PetState = 'idle' | 'walking' | 'exploring' | 'sleeping' | 'eating' | 'happy' | 'sad'

const PetDisplay: React.FC<PetDisplayProps> = ({ mood, energy, currentAction, onInteract }) => {
  const [petState, setPetState] = useState<PetState>('idle')
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    if (energy < 20) {
      setPetState('sleeping')
    } else if (mood > 80) {
      setPetState('happy')
    } else if (mood < 30) {
      setPetState('sad')
    } else if (currentAction === 'explore') {
      setPetState('exploring')
    } else if (currentAction === 'move') {
      setPetState('walking')
    } else if (currentAction === 'rest') {
      setPetState('sleeping')
    } else if (currentAction === 'collect') {
      setPetState('eating')
    } else {
      setPetState('idle')
    }
  }, [mood, energy, currentAction])

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4)
    }, petState === 'sleeping' ? 2000 : 500)
    return () => clearInterval(interval)
  }, [petState])

  const getExpression = () => {
    const expressions = {
      idle: ['😸', '😺', '😸', '😺'],
      walking: ['🐾', '🐾', '🐾', '🐾'],
      exploring: ['👀', '👁️', '👀', '👁️'],
      sleeping: ['😴', '😪', '😴', '😪'],
      eating: ['😋', '😋', '😋', '😋'],
      happy: ['😄', '😆', '🤩', '😄'],
      sad: ['😢', '😿', '😢', '😿'],
    }
    return expressions[petState][animationPhase]
  }

  const getGlow = () => {
    if (energy > 60) return 'shadow-[0_0_30px_rgba(56,189,248,0.5)]'
    if (energy > 30) return 'shadow-[0_0_15px_rgba(129,140,248,0.3)]'
    return 'shadow-[0_0_8px_rgba(148,163,184,0.2)]'
  }

  const getAnimationStyle = () => {
    switch (petState) {
      case 'idle':
        return 'animate-bounce-slow'
      case 'walking':
        return 'animate-walk'
      case 'exploring':
        return 'animate-spin-slow'
      case 'sleeping':
        return 'animate-breathe'
      case 'eating':
        return 'animate-bounce'
      case 'happy':
        return 'animate-jump'
      case 'sad':
        return 'animate-shake'
      default:
        return ''
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center transition-all duration-500 ${getGlow()} ${getAnimationStyle()}`}
        >
          <span className="text-6xl">{getExpression()}</span>
        </div>
        
        {petState === 'sleeping' && (
          <div className="absolute -top-2 -right-2 text-2xl animate-pulse">💤</div>
        )}
        
        {petState === 'happy' && (
          <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
        )}
        
        {petState === 'exploring' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-lg">🔍</div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="px-4 py-2 bg-accent/20 hover:bg-accent/40 rounded-lg text-xs font-medium text-accent transition-colors"
          onClick={() => onInteract('pet')}
        >
          🫂 抚摸
        </button>
        <button
          className="px-4 py-2 bg-primary/20 hover:bg-primary/40 rounded-lg text-xs font-medium text-primary transition-colors"
          onClick={() => onInteract('feed')}
        >
          🍖 喂食
        </button>
        <button
          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-xs font-medium text-green-500 transition-colors"
          onClick={() => onInteract('play')}
        >
          🎾 玩耍
        </button>
      </div>
    </div>
  )
}

export default PetDisplay
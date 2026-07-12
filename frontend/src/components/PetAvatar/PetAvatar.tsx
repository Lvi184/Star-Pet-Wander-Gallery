import React from 'react'

interface Props {
  mood: number
  energy: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-12 h-12 text-xl',
  md: 'w-20 h-20 text-3xl',
  lg: 'w-28 h-28 text-5xl',
}

const glowMap = {
  high: 'shadow-[0_0_30px_rgba(56,189,248,0.6)] animate-glow',
  medium: 'shadow-[0_0_15px_rgba(129,140,248,0.4)]',
  low: 'shadow-[0_0_8px_rgba(148,163,184,0.3)]',
}

const PetAvatar: React.FC<Props> = ({ mood, energy, size = 'md' }) => {
  const getExpression = () => {
    if (mood > 80) return '🌟😸🌟'
    if (mood > 60) return '😊'
    if (mood > 40) return '😐'
    if (mood > 20) return '😿'
    return '😫'
  }

  const getGlowLevel = () => {
    if (energy > 60) return 'high'
    if (energy > 30) return 'medium'
    return 'low'
  }

  const getBorderColor = () => {
    if (mood > 70) return 'border-green-500'
    if (mood > 40) return 'border-accent'
    return 'border-orange-500'
  }

  return (
    <div className="relative">
      <div
        className={`${sizeMap[size]} ${glowMap[getGlowLevel()]} rounded-full bg-gradient-to-br from-bg2 to-clay-700 border-4 ${getBorderColor()} flex items-center justify-center transition-all duration-500 transform hover:scale-110`}
      >
        <span className="animate-bounce-slow">{getExpression()}</span>
      </div>
      
      {energy > 60 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
      )}
      
      {mood > 80 && (
        <div className="absolute -top-2 -left-2 text-lg animate-bounce">✨</div>
      )}
    </div>
  )
}

export default PetAvatar

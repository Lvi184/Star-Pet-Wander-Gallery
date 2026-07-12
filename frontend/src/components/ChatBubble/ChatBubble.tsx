import React from 'react'

interface Props {
  text: string
  isUser?: boolean
}

const ChatBubble: React.FC<Props> = ({ text, isUser = false }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-accent/20 text-accent rounded-br-sm'
            : 'bg-bg2 text-muted border border-rule rounded-bl-sm'
        }`}
      >
        {text}
      </div>
    </div>
  )
}

export default ChatBubble

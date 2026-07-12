import React from 'react'

interface Props {
  title: string
  content: string
  imageUrl?: string
  date: string
}

const DiaryCard: React.FC<Props> = ({ title, content, imageUrl, date }) => {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-accent">{title}</h3>
        <span className="text-xs text-muted">{date}</span>
      </div>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover rounded-lg border border-rule"
          loading="lazy"
        />
      )}
      <p className="text-sm text-muted line-clamp-4 leading-relaxed">{content}</p>
    </div>
  )
}

export default DiaryCard

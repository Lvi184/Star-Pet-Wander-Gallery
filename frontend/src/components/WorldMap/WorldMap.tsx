import React from 'react'

interface Region {
  id: string
  name: string
  x: number
  y: number
  explored: boolean
}

interface Props {
  regions: Region[]
  currentRegionId?: string | null
  onRegionClick?: (id: string) => void
}

const WorldMap: React.FC<Props> = ({ regions, currentRegionId, onRegionClick }) => {
  return (
    <div className="relative w-full aspect-[16/10] bg-bg2 rounded-xl border border-rule overflow-hidden">
      <svg viewBox="0 0 800 500" className="w-full h-full">
        {/* 背景网格 */}
        {Array.from({ length: 20 }).map((_, i) => (
          <g key={i}>
            <line x1={i * 40} y1="0" x2={i * 40} y2="500" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
            <line x1="0" y1={i * 25} x2="800" y2={i * 25} stroke="#334155" strokeWidth="0.5" opacity="0.3" />
          </g>
        ))}
        {/* 区域节点 */}
        {regions.map((region) => {
          const isCurrent = region.id === currentRegionId
          const color = region.explored ? (isCurrent ? '#38bdf8' : '#818cf8') : '#475569'
          return (
            <g
              key={region.id}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => onRegionClick?.(region.id)}
            >
              <circle cx={region.x} cy={region.y} r={isCurrent ? 12 : 8} fill={color} opacity="0.8">
                {isCurrent && <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite" />}
              </circle>
              <text x={region.x} y={region.y + 24} textAnchor="middle" fill="#94a3b8" fontSize="12">
                {region.name}
              </text>
              {isCurrent && (
                <circle cx={region.x} cy={region.y} r="20" fill="none" stroke={color} strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" values="12;24" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default WorldMap

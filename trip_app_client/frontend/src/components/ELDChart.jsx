// src/components/ELDChart.jsx
import React from 'react'

const statusOrder = {
  off_duty: 0,
  sleeper: 1,
  driving: 2,
  on_duty_not_driving: 3
}

function ELDChart({ segments, width = 600, height = 200 }) {
  const hourToX = (hour) => (hour / 24) * width
  const lineSpacing = height / 4

  // Build an SVG path
  // Sort segments by start time
  const sorted = [...segments].sort((a, b) => a.start - b.start)
  let pathParts = []
  let isFirst = true

  sorted.forEach((seg) => {
    const segStartX = hourToX(seg.start)
    const segEndX = hourToX(seg.end)
    const segY = (statusOrder[seg.status] + 0.5) * lineSpacing

    if (isFirst) {
      pathParts.push(`M ${segStartX},${segY}`)
      isFirst = false
    } else {
      pathParts.push(`L ${segStartX},${segY}`)
    }
    pathParts.push(`L ${segEndX},${segY}`)
  })

  const pathData = pathParts.join(' ')

  // Build grid lines
  const gridLines = []
  for (let h = 0; h <= 24; h++) {
    const x = hourToX(h)
    gridLines.push(
      <line key={`hour-${h}`} x1={x} y1={0} x2={x} y2={height} stroke="#ccc" strokeWidth="1" />
    )
  }
  for (let s = 0; s < 4; s++) {
    const y = (s + 0.5) * lineSpacing
    gridLines.push(
      <line key={`status-${s}`} x1={0} y1={y} x2={width} y2={y} stroke="#999" strokeWidth="1" strokeDasharray="2,2" />
    )
  }

  // Status labels
  const statusLabels = Object.keys(statusOrder).map((k) => {
    const row = statusOrder[k]
    const y = (row + 0.5) * lineSpacing
    return (
      <text key={k} x={5} y={y - 5} fontSize="12" fill="#000">
        {k.toUpperCase()}
      </text>
    )
  })

  // Hour labels
  const hourLabels = []
  for (let h = 0; h <= 24; h++) {
    const x = hourToX(h)
    hourLabels.push(
      <text key={`h-${h}`} x={x + 2} y={height - 5} fontSize="10" fill="#000">
        {h}
      </text>
    )
  }

  return (
    <svg width={width} height={height} style={{ border: '1px solid #000' }}>
      {gridLines}
      {statusLabels}
      <path d={pathData} fill="none" stroke="blue" strokeWidth="2" />
      {hourLabels}
    </svg>
  )
}

export default ELDChart

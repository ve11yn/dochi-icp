"use client"

import { useRef, useEffect } from "react"

interface DochiProps {
  width?: string | number
  height?: string | number
}

export default function Dochi({ width = '100%', height = '100%' }: DochiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size - this is key to removing extra space
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      // Use actual container size, not offset size
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      
      ctx.scale(dpr, dpr)
    }
    
    setCanvasSize()
    
    // Orb state
    let time = 0
    let mouseX = canvas.getBoundingClientRect().width / 2
    let mouseY = canvas.getBoundingClientRect().height / 2
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    
    // Color palette
    const colors = {
      pink:     { r: 255, g: 235, b: 245 },
      lavender: { r: 240, g: 240, b: 255 },
      peach:    { r: 255, g: 240, b: 235 },
      blue:     { r: 230, g: 250, b: 255 },
      white:    { r: 255, g: 255, b: 255 }
    }

    // Function to smoothly blend colors with easing
    const lerpColor = (color1: any, color2: any, t: number) => {
      const easedT = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2

      return {
        r: Math.round(color1.r + (color2.r - color1.r) * easedT),
        g: Math.round(color1.g + (color2.g - color1.g) * easedT),
        b: Math.round(color1.b + (color2.b - color1.b) * easedT)
      }
    }

    const createMochiPath = (
      ctx: CanvasRenderingContext2D, 
      centerX: number, 
      centerY: number, 
      radius: number, 
      time: number
    ) => {
      ctx.beginPath()
      const points = 300
      const angleStep = (Math.PI * 2) / points
      const wobble = radius * 0.07

      for (let i = 0; i <= points; i++) {
        const angle = i * angleStep
        const r = radius + Math.sin(time * 0.8 + angle * 2) * wobble
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
    }
    
    // Handle resize
    const handleResize = () => {
      setCanvasSize()
    }
    
    window.addEventListener('resize', handleResize)
    
    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      
      targetX = (mouseX - rect.width / 2) / rect.width * 20
      targetY = (mouseY - rect.height / 2) / rect.height * 20
    }
    
    canvas.addEventListener('mousemove', handleMouseMove)
    
    // Animation function
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      
      ctx.clearRect(0, 0, width, height)
      
      time += 0.016
      
      currentX += (targetX - currentX) * 0.1
      currentY += (targetY - currentY) * 0.1
      
      const centerX = width / 2
      const centerY = height / 2 + Math.sin(time * 0.8) * 10
      
      // Make radius larger to fill the container better
      const radius = Math.min(width, height) * 0.4
      
      ctx.save()
      ctx.shadowColor = 'rgba(255, 255, 255, 0)'
      ctx.shadowBlur = radius * 0.5
      ctx.shadowOffsetY = radius * 0.15
      
      ctx.beginPath()
      createMochiPath(ctx, centerX, centerY, radius, time)
      ctx.clip()
      
      const gradientAngle = time * 0.2
      const gradX1 = centerX + Math.cos(gradientAngle) * radius * 1.5
      const gradY1 = centerY + Math.sin(gradientAngle) * radius * 1.5
      const gradX2 = centerX - Math.cos(gradientAngle) * radius * 1.5
      const gradY2 = centerY - Math.sin(gradientAngle) * radius * 1.5
      
      const linearGradient = ctx.createLinearGradient(gradX1, gradY1, gradX2, gradY2)
      
      const numStops = 20
      const baseColors = [colors.white, colors.pink, colors.lavender, colors.blue, colors.peach]
      const t = (time * 0.1) % baseColors.length
      const index = Math.floor(t)
      const blendT = t - index

      const fromSeq = baseColors.slice(index).concat(baseColors.slice(0, index))
      const toSeq = baseColors.slice(index + 1).concat(baseColors.slice(0, index + 1))

      const colorSequence = fromSeq.map((fromColor, i) => {
        const toColor = toSeq[i % baseColors.length]
        return lerpColor(fromColor, toColor, blendT)
      })
      
      for (let i = 0; i <= numStops; i++) {
        const position = i / numStops
        const scaledPosition = position * (colorSequence.length - 1)
        const colorIndex = Math.floor(scaledPosition)
        const localT = scaledPosition - colorIndex
        
        const fromColor = colorSequence[colorIndex % colorSequence.length]
        const toColor = colorSequence[(colorIndex + 1) % colorSequence.length]
        
        const blendedColor = lerpColor(fromColor, toColor, localT)
        linearGradient.addColorStop(position, `rgb(${blendedColor.r}, ${blendedColor.g}, ${blendedColor.b})`)
      }
      
      ctx.fillStyle = linearGradient
      ctx.fillRect(centerX - radius * 1.5, centerY - radius * 1.5, radius * 3, radius * 3)
      
      const highlightGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, 0,
        centerX, centerY, radius
      )
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)')
      highlightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)')
      highlightGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = highlightGradient
      ctx.fillRect(centerX - radius * 1.5, centerY - radius * 1.5, radius * 3, radius * 3)
      
      ctx.restore()
      
      // Draw face
      const eyeSpacing = radius * 0.35
      const eyeY = centerY - radius * 0.01
      
      ctx.fillStyle = '#000000'
      
      // Left eye
      ctx.save()
      ctx.translate(centerX - eyeSpacing + currentX * 0.5, eyeY + currentY * 0.5)
      ctx.beginPath()
      ctx.ellipse(0, 0, radius * 0.1, radius * 0.13, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      
      // Right eye
      ctx.save()
      ctx.translate(centerX + eyeSpacing + currentX * 0.5, eyeY + currentY * 0.5)
      ctx.beginPath()
      ctx.ellipse(0, 0, radius * 0.1, radius * 0.13, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      
      // Mouth
      ctx.save()
      ctx.translate(centerX + currentX * 0.3, centerY + radius * 0.15 + currentY * 0.3)
      ctx.beginPath()
      ctx.moveTo(-radius * 0.07, 0)
      ctx.lineTo(radius * 0.07, 0)
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = radius * 0.05
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.restore()
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
    
  return (
    <div 
      style={{ 
        width, 
        height, 
        margin: 0, 
        padding: 0, 
        display: 'block',
        lineHeight: 0,
        fontSize: 0
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          verticalAlign: 'top'
        }}
      />
    </div>
  )
}
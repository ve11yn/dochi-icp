"use client"

import { useRef, useEffect } from "react"

export default function Dochi({ width = '100%', height = '100%' }: { width?: string | number, height?: string | number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)
    
    // Orb state
    let time = 0
    let mouseX = canvas.offsetWidth / 2
    let mouseY = canvas.offsetHeight / 2
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    
  // Color palette
// Light pastel color palette
const colors = {
  pink:     { r: 255, g: 235, b: 245 }, // lighter baby pink  
  lavender: { r: 240, g: 240, b: 255 }, // lighter periwinkle  
  peach:    { r: 255, g: 240, b: 235 }, // lighter peach  
  blue:     { r: 230, g: 250, b: 255 }, // lighter aqua  
  white:    { r: 255, g: 255, b: 255 }  // pure white
}




// Function to smoothly blend colors with easing
const lerpColor = (color1, color2, t) => {
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

  const points = 300// Fewer points for a rounder shape
  const angleStep = (Math.PI * 2) / points
  const wobble = radius * 0.07

  for (let i = 0; i <= points; i++) {
    const angle = i * angleStep
    const r = radius + Math.sin(time * 0.8 + angle * 2) * wobble
    const x = centerX + Math.cos(angle) * r
    const y = centerY + Math.sin(angle) * r

    // const stretch = 1 + Math.cos(time * 2.5) * 0.01
    // const x = centerX + Math.cos(angle) * r * stretch
    // const y = centerY + Math.sin(angle) * r / stretch

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
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      
      // Calculate target offset for eyes (subtle movement)
      targetX = (mouseX - canvas.offsetWidth / 2) / canvas.offsetWidth * 20
      targetY = (mouseY - canvas.offsetHeight / 2) / canvas.offsetHeight * 20
    }
    
    canvas.addEventListener('mousemove', handleMouseMove)
    
    // Animation function
    const animate = () => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      
      // Clear canvas with white background
      ctx.clearRect(0, 0, width, height)
      
      // Update time
      time += 0.016
      
      // Smooth eye movement
      currentX += (targetX - currentX) * 0.1
      currentY += (targetY - currentY) * 0.1
      
      // Center position with gentle floating
      const centerX = width / 2
      const centerY = height / 2 + Math.sin(time * 0.8) * 10
      
      // Orb radius
      const radius = Math.min(width, height) * 0.3
      
      // Draw soft shadow

      ctx.save()
      ctx.shadowColor = 'rgba(255, 255, 255, 0)'
      ctx.shadowBlur = radius * 0.5
      ctx.shadowOffsetY = radius * 0.15
      
      // Create clipping mask for mochi shape
      ctx.beginPath()
      createMochiPath(ctx, centerX, centerY, radius, time)
        ctx.clip()
      
      // Draw smooth linear gradient with many stops
      const gradientAngle = time * 0.2
      const gradX1 = centerX + Math.cos(gradientAngle) * radius * 1.5
      const gradY1 = centerY + Math.sin(gradientAngle) * radius * 1.5
      const gradX2 = centerX - Math.cos(gradientAngle) * radius * 1.5
      const gradY2 = centerY - Math.sin(gradientAngle) * radius * 1.5
      
      const linearGradient = ctx.createLinearGradient(gradX1, gradY1, gradX2, gradY2)
      
      // Create many gradient stops for smooth transitions
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
        
        // Calculate which two colors we're between
        const scaledPosition = position * (colorSequence.length - 1)
        const colorIndex = Math.floor(scaledPosition)
        const localT = scaledPosition - colorIndex
        
        const fromColor = colorSequence[colorIndex % colorSequence.length]
        const toColor = colorSequence[(colorIndex + 1) % colorSequence.length]
        
        const blendedColor = lerpColor(fromColor, toColor, localT)
        linearGradient.addColorStop(position, `rgb(${blendedColor.r}, ${blendedColor.g}, ${blendedColor.b})`)
      }
      
      // Fill mochi with smooth gradient
      ctx.fillStyle = linearGradient
      ctx.fillRect(centerX - radius * 1.5, centerY - radius * 1.5, radius * 3, radius * 3)
      
      // Add subtle highlight for mochi texture
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
      
      // Draw mochi outline
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.02)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
      
      // Draw bigger cute face
      
      // Eye positions
      const eyeSpacing = radius * 0.35
      const eyeY = centerY - radius * 0.01
      
      // Draw bigger eyes - simple ovals
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
      
      // Draw bigger mouth - wider curve
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
      
      // Add soft rosy cheeks
      ctx.fillStyle = 'rgba(249, 235, 247, 0)'
      
      // Left cheek
      ctx.beginPath()
      ctx.arc(
        centerX - radius * 0.5,
        centerY + radius * 0.05,
        radius * 0.12,
        0,
        Math.PI * 2
      )
      ctx.fill()
      
      // Right cheek
      ctx.beginPath()
      ctx.arc(
        centerX + radius * 0.5,
        centerY + radius * 0.05,
        radius * 0.12,
        0,
        Math.PI * 2
      )
      ctx.fill()
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    // Start animation
    animate()
    
    // Cleanup
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
    
    return (
    <div style={{ width, height }}>
        <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer block"
        style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            imageRendering: 'auto'
        }}
        />
    </div>
    )
}
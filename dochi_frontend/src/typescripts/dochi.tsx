"use client"

import { useRef, useEffect } from "react"

interface DochiProps {
  size?: number;
  auraColor?: string;
}

/**
 * A standalone, animated Dochi character component.
 * @param size The size of the character in pixels. Defaults to 200.
 * @param auraColor The color of the glow effect. Defaults to a soft lavender.
 */
export default function Dochi({ size = 200, auraColor = 'rgba(220, 215, 255, 0.7)' }: DochiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas to square size with proper DPI handling
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = size * dpr 
      canvas.height = size * dpr
      canvas.style.width = size + 'px'
      canvas.style.height = size + 'px'
      ctx.scale(dpr, dpr)
    }
    
    setCanvasSize()
    
    // Orb state
    let time = 0
    let mouseX = size / 2
    let mouseY = size / 2
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    
    // Function to create the wobbly path for the character
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
      // Reduced the wobble amplitude for a softer, mochi-like feel
      const wobble = radius * 0.07 

      for (let i = 0; i <= points; i++) {
        const angle = i * angleStep
        // Slowed down the wobble frequencies for a gentler, doughier movement
        const r = radius + Math.sin(time * 0.8 + angle * 2) * wobble;
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
    
    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      targetX = (mouseX - size / 2) / size * 15
      targetY = (mouseY - size / 2) / size * 15
    }
    
    canvas.addEventListener('mousemove', handleMouseMove)
    
    // Main animation function
    const animate = () => {
      ctx.clearRect(0, 0, size, size)
      time += 0.016
      currentX += (targetX - currentX) * 0.1
      currentY += (targetY - currentY) * 0.1
      
      const centerX = size / 2
      // Reduced the floating amplitude and speed for a calmer movement
      const centerY = size / 2 + Math.sin(time * 0.7) * 4
      const radius = size * 0.35 
      
      // 1. CREATE THE AURA/GLOW using the passed auraColor prop
      const glowGradient = ctx.createRadialGradient(
          centerX, centerY, radius * 0.7,
          centerX, centerY, radius * 1.2
      );

      // Use the auraColor prop here
      const transparentAuraColor = auraColor.replace(/[^,]+(?=\))/, '0');
      glowGradient.addColorStop(0, auraColor);
      glowGradient.addColorStop(1, transparentAuraColor);

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. CREATE THE BODY SHAPE (as a clipping mask)
      ctx.save();
      createMochiPath(ctx, centerX, centerY, radius, time)
      ctx.clip()
      
      // 3. CREATE THE BODY COLOR GRADIENT
      const linearGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius)
      
      // Symmetrical gradient for even color distribution.
      linearGradient.addColorStop(0, 'rgb(170, 210, 255)');      // Saturated Sky Blue
      linearGradient.addColorStop(0.5, 'rgb(255, 240, 245)');    // Central light transition color
      linearGradient.addColorStop(1, 'rgb(255, 190, 220)');      // Saturated Pastel Pink
      
      ctx.fillStyle = linearGradient
      ctx.fillRect(0, 0, size, size)
      
      // 4. ADD A SHARPER, SHINIER HIGHLIGHT
      const highlightGradient = ctx.createRadialGradient(
        centerX - radius * 0.4, centerY - radius * 0.5, 0,
        centerX - radius * 0.2, centerY - radius * 0.2, radius * 0.6
      )
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      highlightGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = highlightGradient
      ctx.fillRect(0, 0, size, size)
      ctx.restore()
      
      // 5. DRAW THE FACE
      const eyeSpacing = radius * 0.35
      const eyeY = centerY - radius * 0.01
      ctx.fillStyle = '#000000'
      
      // Eyes
      ctx.save()
      ctx.translate(centerX - eyeSpacing + currentX * 0.5, eyeY + currentY * 0.5)
      ctx.beginPath()
      ctx.ellipse(0, 0, radius * 0.1, radius * 0.13, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [size, auraColor])
    
  return (
    <div style={{ flexShrink: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block' }}/>
    </div>
  )
}

import React, { useEffect, useRef, useCallback } from 'react';

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  character: string;
  opacity: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface MoneyRainProps {
  isActive: boolean;
}

const MoneyRain: React.FC<MoneyRainProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const rainDrops = useRef<RainDrop[]>([]);
  const lastTime = useRef<number>(0);

  // Enhanced money symbols for variety
  const moneyChars = [
    '$', '€', '£', '¥', '₿', '₹', '₽', '₩', '₪', '₨', 
    '₦', '₵', '₴', '₲', '₡', '₫', '₼', '₾', '₸', '₳',
    '₱', '﷼', '₞', '₟', '₠', '₢', '₣', '₤', '₥', '₦'
  ];

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  const initRainDrops = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rainDrops.current = [];
    const numColumns = Math.floor(canvas.width / 25); // Slightly wider spacing
    
    for (let i = 0; i < numColumns; i++) {
      // Create 2-4 drops per column for variety
      const dropsPerColumn = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < dropsPerColumn; j++) {
        rainDrops.current.push({
          x: i * 25 + Math.random() * 25,
          y: Math.random() * canvas.height - canvas.height,
          speed: Math.random() * 3 + 1, // Varied speeds
          character: moneyChars[Math.floor(Math.random() * moneyChars.length)],
          opacity: Math.random() * 0.8 + 0.2,
          size: Math.random() * 12 + 10,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2 // Subtle rotation
        });
      }
    }
  }, [moneyChars]);

  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const deltaTime = currentTime - lastTime.current;
    lastTime.current = currentTime;

    // Always clear with subtle trail effect
    ctx.fillStyle = isActive ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context for transformations
    ctx.save();

    rainDrops.current.forEach((drop, index) => {
      // Only update positions when timer is active
      if (isActive) {
        drop.y += drop.speed * (deltaTime / 16); // Normalize for 60fps
        drop.rotation += drop.rotationSpeed;

        // Reset if off screen
        if (drop.y > canvas.height + 50) {
          drop.y = -50 - Math.random() * 100;
          drop.x = Math.random() * canvas.width;
          drop.character = moneyChars[Math.floor(Math.random() * moneyChars.length)];
          drop.opacity = Math.random() * 0.8 + 0.2;
          drop.size = Math.random() * 12 + 10;
          drop.speed = Math.random() * 3 + 1;
          drop.rotation = Math.random() * 360;
          drop.rotationSpeed = (Math.random() - 0.5) * 2;
        }
      }

      // Apply transformations for rotation
      ctx.save();
      ctx.translate(drop.x + drop.size / 2, drop.y);
      ctx.rotate((drop.rotation * Math.PI) / 180);

      // Set font and style
      ctx.font = `bold ${drop.size}px 'Share Tech Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Create vertical gradient effect - dimmer when inactive
      const baseOpacity = isActive ? drop.opacity : drop.opacity * 0.3;
      const gradient = ctx.createLinearGradient(0, -drop.size, 0, drop.size);
      gradient.addColorStop(0, `rgba(34, 197, 94, ${baseOpacity * 0.9})`);
      gradient.addColorStop(0.3, `rgba(34, 197, 94, ${baseOpacity})`);
      gradient.addColorStop(0.7, `rgba(34, 197, 94, ${baseOpacity * 0.7})`);
      gradient.addColorStop(1, `rgba(34, 197, 94, ${baseOpacity * 0.3})`);
      
      ctx.fillStyle = gradient;
      
      // Add glow effect - reduced when inactive
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = isActive ? Math.max(3, drop.size * 0.3) : Math.max(1, drop.size * 0.1);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw the character
      ctx.fillText(drop.character, 0, 0);
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      ctx.restore();

      // Occasionally change character for visual interest - only when active
      if (isActive && Math.random() < 0.005) {
        drop.character = moneyChars[Math.floor(Math.random() * moneyChars.length)];
      }
    });

    ctx.restore();
    animationRef.current = requestAnimationFrame(animate);
  }, [moneyChars, isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();
    initRainDrops();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation
    lastTime.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resizeCanvas, initRainDrops, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 money-rain-container"
      style={{ 
        background: 'transparent'
      }}
    />
  );
};

export default MoneyRain;
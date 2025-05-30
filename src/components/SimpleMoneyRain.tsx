import React, { useEffect, useRef } from 'react';

// Simplified Money Rain - Performance Optimized Version
const SimpleMoneyRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Simple money symbols
  const symbols = ['$', '€', '£', '¥', '₿'];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Simple rain drops
    const drops: Array<{x: number; y: number; char: string}> = [];
    
    // Initialize drops
    for (let i = 0; i < 50; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: symbols[Math.floor(Math.random() * symbols.length)]
      });
    }

    const animate = () => {
      // Clear with trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw drops
      ctx.font = '16px monospace';
      ctx.fillStyle = '#22c55e';
      
      drops.forEach(drop => {
        ctx.fillText(drop.char, drop.x, drop.y);
        
        // Move down
        drop.y += 2;
        
        // Reset if off screen
        if (drop.y > canvas.height) {
          drop.y = 0;
          drop.x = Math.random() * canvas.width;
          drop.char = symbols[Math.floor(Math.random() * symbols.length)];
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default SimpleMoneyRain;
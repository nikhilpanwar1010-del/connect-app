import React, { useEffect, useRef } from 'react';

interface HeartRainCanvasProps {
  burst?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayOffset: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  type: 'heart' | 'sparkle' | 'petal';
}

const COLORS = [
  '#FF4D8D', // Hot pink
  '#FF7597', // Rose pink
  '#FFA6C1', // Soft rose
  '#FFB3CF', // Blush rose
  '#E91E63', // Magenta pink
  '#FFD1DC', // Pastel pink
  '#FFFFFF', // White sparkle
];

export const HeartRainCanvas: React.FC<HeartRainCanvasProps> = ({ burst = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle count: gentle on mobile, full on desktop
    const count = window.innerWidth < 768 ? 40 : 75;
    const particles: Particle[] = [];

    const createParticle = (fromBottom = true): Particle => {
      const types: ('heart' | 'sparkle' | 'petal')[] = ['heart', 'heart', 'heart', 'sparkle', 'petal'];
      return {
        x: Math.random() * width,
        y: fromBottom ? height + 20 + Math.random() * 80 : Math.random() * height,
        size: 14 + Math.random() * 22,
        speedY: -(1.2 + Math.random() * 2.2),
        speedX: (Math.random() - 0.5) * 0.8,
        swaySpeed: 0.02 + Math.random() * 0.03,
        swayOffset: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 0.35 + Math.random() * 0.55,
        type: types[Math.floor(Math.random() * types.length)],
      };
    };

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(false));
    }

    // Helper to draw a heart shape on canvas
    const drawHeart = (c: CanvasRenderingContext2D, size: number, color: string, alpha: number) => {
      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.shadowColor = color;
      c.shadowBlur = 10;

      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      // top left curve
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      // bottom left curve
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.3);
      // bottom right curve
      c.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      // top right curve
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();
      c.fill();
      c.restore();
    };

    // Helper to draw a sparkle
    const drawSparkle = (c: CanvasRenderingContext2D, size: number, color: string, alpha: number) => {
      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.shadowColor = '#FFFFFF';
      c.shadowBlur = 8;
      c.beginPath();
      c.moveTo(0, -size);
      c.quadraticCurveTo(0, 0, size, 0);
      c.quadraticCurveTo(0, 0, 0, size);
      c.quadraticCurveTo(0, 0, -size, 0);
      c.quadraticCurveTo(0, 0, 0, -size);
      c.closePath();
      c.fill();
      c.restore();
    };

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick += 0.03;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.speedY;
        p.x += Math.sin(tick * p.swaySpeed + p.swayOffset) * 1.2 + p.speedX;
        p.rotation += p.rotationSpeed;

        // Reset if float off top
        if (p.y < -50 || p.x < -50 || p.x > width + 50) {
          particles[i] = createParticle(true);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'heart') {
          drawHeart(ctx, p.size, p.color, p.opacity);
        } else if (p.type === 'sparkle') {
          drawSparkle(ctx, p.size * 0.6, p.color, p.opacity);
        } else {
          // Petal
          drawHeart(ctx, p.size * 0.7, p.color, p.opacity * 0.85);
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [burst]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ willChange: 'transform' }}
    />
  );
};

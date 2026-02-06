import React, { useEffect, useRef } from 'react';

interface BackgroundCanvasProps {
  mode: 'vibrant' | 'minimal';
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    // We will use a union type for our entities to support both Orbs and Shapes
    type Entity = Orb | Shape;
    let entities: Entity[] = [];

    // --- 1. FLUID ORBS (For 'vibrant' mode / Home) ---
    class Orb {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      targetAlpha: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.radius = Math.random() * 300 + 200; 
        this.vx = (Math.random() - 0.5) * 0.5; 
        this.vy = (Math.random() - 0.5) * 0.5;
        
        const colors = [
          { r: 100, g: 100, b: 255 },
          { r: 213, g: 0, b: 249 },
          { r: 80, g: 80, b: 80 },
        ];
        const c = colors[Math.floor(Math.random() * colors.length)];
        this.color = `rgb(${c.r},${c.g},${c.b})`;
        
        this.alpha = 0;
        this.targetAlpha = Math.random() * 0.15 + 0.1;
      }

      update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -this.radius) this.vx *= -1;
        if (this.x > w + this.radius) this.vx *= -1;
        if (this.y < -this.radius) this.vy *= -1;
        if (this.y > h + this.radius) this.vy *= -1;
        if (this.alpha < this.targetAlpha) this.alpha += 0.002;
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        const g = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        g.addColorStop(0, this.color.replace('rgb', 'rgba').replace(')', `, ${this.alpha})`));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
      }
    }

    // --- 2. GEOMETRIC SHAPES (For 'minimal' mode / Order & Tracking) ---
    class Shape {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      angle: number;
      spin: number;
      type: 'square' | 'triangle' | 'cross' | 'circle';
      color: string;
      alpha: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 30 + 15; // Small, subtle shapes
        
        // Gentle float upwards or sideways
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02; // Slow rotation

        const types = ['square', 'triangle', 'cross', 'circle'] as const;
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // Technical/Blueprint colors
        const colors = [
          { r: 255, g: 255, b: 255 }, // White
          { r: 213, g: 0, b: 249 },   // Purple accent
          { r: 0, g: 230, b: 118 },   // Green accent
          { r: 255, g: 145, b: 0 },   // Orange accent
        ];
        const c = colors[Math.floor(Math.random() * colors.length)];
        this.color = `rgb(${c.r},${c.g},${c.b})`;
        
        // Slightly more visible than orbs but still subtle (wireframe style)
        this.alpha = Math.random() * 0.15 + 0.1;
      }

      update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.spin;

        // Wrap around screen
        const padding = 50;
        if (this.x < -padding) this.x = w + padding;
        if (this.x > w + padding) this.x = -padding;
        if (this.y < -padding) this.y = h + padding;
        if (this.y > h + padding) this.y = -padding;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        c.strokeStyle = this.color.replace('rgb', 'rgba').replace(')', `, ${this.alpha})`);
        c.lineWidth = 1.5;
        
        c.beginPath();
        if (this.type === 'square') {
          c.rect(-this.size/2, -this.size/2, this.size, this.size);
        } else if (this.type === 'triangle') {
          const h = (Math.sqrt(3)/2) * this.size;
          c.moveTo(0, -h/2);
          c.lineTo(this.size/2, h/2);
          c.lineTo(-this.size/2, h/2);
          c.closePath();
        } else if (this.type === 'cross') {
          const s = this.size / 2;
          c.moveTo(-s, 0);
          c.lineTo(s, 0);
          c.moveTo(0, -s);
          c.lineTo(0, s);
        } else if (this.type === 'circle') {
          c.arc(0, 0, this.size/2, 0, Math.PI * 2);
        }
        c.stroke();
        c.restore();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      entities = [];
      
      if (mode === 'vibrant') {
        // Fluid Orbs for Home
        for (let i = 0; i < 8; i++) {
          entities.push(new Orb(canvas.width, canvas.height));
        }
      } else {
        // Geometric Shapes for Order/Tracking
        // More shapes because they are smaller
        for (let i = 0; i < 25; i++) {
          entities.push(new Shape(canvas.width, canvas.height));
        }
      }
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mode === 'vibrant') {
        ctx.globalCompositeOperation = 'screen';
      } else {
        ctx.globalCompositeOperation = 'source-over'; // Normal blending for sharp lines
      }

      entities.forEach(entity => {
        // We know update and draw exist on both, but TS might need help if methods differed significantly.
        // Since we unified the interface implicitly by calling methods present on both:
        (entity as any).update(canvas.width, canvas.height);
        (entity as any).draw(ctx);
      });
      
      ctx.globalCompositeOperation = 'source-over';
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationId);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};
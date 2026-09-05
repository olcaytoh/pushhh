import React, { useEffect, useRef } from 'react';
import { ChromaKeyVideo } from './ChromaKeyVideo';

interface ThreeStarVictoryVideoProps {
  customVideoUrl?: string | null;
  videoSrc?: string;
  starCount?: 3 | 5 | 7;
  repeatCount?: number;
  topicTitle?: string;
}

export const ThreeStarVictoryVideo: React.FC<ThreeStarVictoryVideoProps> = ({
  customVideoUrl,
  videoSrc = '/3s.mp4',
  starCount = 3,
  repeatCount = 3,
  topicTitle
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeVideoUrl = customVideoUrl || videoSrc;

  // Background Gold Coins & Sparkles particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 640);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      vRot: number;
      type: 'coin' | 'star' | 'sparkle';
      color: string;
      alpha: number;
    }

    const particles: Particle[] = [];
    const colors = ['#f59e0b', '#fbbf24', '#fef08a', '#eab308', '#ffffff'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 120,
        y: height * 0.45 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 8 - 2,
        size: Math.random() * 12 + 8,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        type: Math.random() > 0.4 ? 'coin' : Math.random() > 0.5 ? 'star' : 'sparkle',
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (frame % 4 === 0 && particles.length < 90) {
        particles.push({
          x: width / 2 + (Math.random() - 0.5) * 100,
          y: height * 0.4,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 5 - 2,
          size: Math.random() * 10 + 6,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          type: Math.random() > 0.4 ? 'coin' : Math.random() > 0.5 ? 'star' : 'sparkle',
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1
        });
      }

      ctx.save();
      ctx.translate(width / 2, height * 0.4);
      const rays = 16;
      const angleStep = (Math.PI * 2) / rays;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let i = 0; i < rays; i += 2) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, Math.max(width, height), i * angleStep + frame * 0.005, (i + 1) * angleStep + frame * 0.005);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.rotation += p.vRot;

        if (p.y > height + 40) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        if (p.type === 'coin') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.7, 0, 0, Math.PI * 2);
          const grad = ctx.createLinearGradient(-p.size, -p.size, p.size, p.size);
          grad.addColorStop(0, '#fef08a');
          grad.addColorStop(0.5, '#f59e0b');
          grad.addColorStop(1, '#b45309');
          ctx.fillStyle = grad;
          ctx.fill();
        } else if (p.type === 'star') {
          ctx.fillStyle = '#fbbf24';
          ctx.font = `${Math.round(p.size * 1.2)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', 0, 0);
        } else {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-p.size / 2, 0);
          ctx.lineTo(p.size / 2, 0);
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(0, p.size / 2);
          ctx.stroke();
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
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-950 via-blue-900 to-indigo-950 overflow-hidden flex flex-col items-center justify-between p-3 select-none rounded-2xl">
      {/* Background Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 w-full h-full" />

      {/* Radiant Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.2)_0%,transparent_75%)] pointer-events-none z-0" />

      {/* TOP HEADER: STAR BANNER */}
      <div className="relative z-10 pt-2 flex flex-col items-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          {Array.from({ length: starCount }).map((_, idx) => (
            <span
              key={idx}
              className="text-3xl sm:text-4xl animate-pulse drop-shadow-[0_0_15px_rgba(250,204,21,1)]"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              ⭐
            </span>
          ))}
        </div>

        <div className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 text-slate-950 font-black text-xs sm:text-sm px-4 py-1 rounded-full shadow-lg border-2 border-white uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
          <span>🏆</span>
          <span>{starCount} YILDIZLI ŞAMPİYONLUK KUPASI!</span>
          <span>🏆</span>
        </div>
      </div>

      {/* CENTER: CHROMA KEYED TRANSPARENT VIDEO */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center my-1 overflow-hidden">
        <ChromaKeyVideo
          src={activeVideoUrl}
          autoPlay={true}
          loop={true}
          muted={false}
          enableChromaKey={true}
          className="w-full h-full max-h-[45vh]"
        />
      </div>

      {/* BOTTOM FOOTER TEXT */}
      <div className="relative z-10 pb-2 text-center">
        <div className="text-yellow-300 font-black text-sm sm:text-base drop-shadow-md uppercase">
          {topicTitle ? `"${topicTitle}"` : 'Tebrikler!'}
        </div>
        <div className="text-xs text-amber-100 font-bold drop-shadow">
          Hiç Yanmadan {starCount} Yıldızlı Özel Başarıyı Kazandın!
        </div>
      </div>
    </div>
  );
};


import React, { useRef, useEffect } from 'react';

interface TransparentVideoProps {
  src: string;
  className?: string;
  threshold?: number; // 0 to 255 (brightness cutoff)
  smoothness?: number; // range for soft edge alpha
}

export const TransparentVideo: React.FC<TransparentVideoProps> = ({
  src,
  className = '',
  threshold = 30,
  smoothness = 20,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId: number | null = null;
    let isMounted = true;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const processFrame = () => {
      if (!isMounted) return;

      if (!video || video.paused || video.ended || video.readyState < 2) {
        return;
      }

      try {
        const width = video.videoWidth || 360;
        const height = video.videoHeight || 640;

        if (width > 0 && height > 0) {
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const frame = ctx.getImageData(0, 0, width, height);
            const l = frame.data.length;

            for (let i = 0; i < l; i += 4) {
              const r = frame.data[i];
              const g = frame.data[i + 1];
              const b = frame.data[i + 2];

              // Calculate perceived brightness or max component
              const brightness = Math.max(r, g, b);

              if (brightness <= threshold) {
                frame.data[i + 3] = 0; // Fully transparent
              } else if (brightness < threshold + smoothness) {
                // Smooth edge transition
                const alpha = ((brightness - threshold) / smoothness) * 255;
                frame.data[i + 3] = Math.min(255, Math.max(0, alpha));
              }
            }

            ctx.putImageData(frame, 0, 0);
          }
        }
      } catch {
        // Ignore canvas frame read errors silently
      }

      if (isMounted && !video.paused && !video.ended) {
        animationFrameId = requestAnimationFrame(processFrame);
      }
    };

    const handlePlay = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(processFrame);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('loadeddata', processFrame);
    video.addEventListener('canplay', processFrame);

    // If video is already ready and playing
    if (!video.paused) {
      animationFrameId = requestAnimationFrame(processFrame);
    }

    return () => {
      isMounted = false;
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('loadeddata', processFrame);
      video.removeEventListener('canplay', processFrame);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [threshold, smoothness, src]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Hidden source video */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="hidden"
      />
      {/* Rendered transparent canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pointer-events-none drop-shadow-md"
      />
    </div>
  );
};

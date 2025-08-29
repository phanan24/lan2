import { ReactNode, useEffect, useRef, useState } from 'react';

// Particle System Effect
interface ParticleSystemProps {
  count?: number;
  className?: string;
}

export function ParticleSystem({ count = 30, className = "" }: ParticleSystemProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 opacity-20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            '--float-intensity': `${10 + Math.random() * 20}px`
          } as any}
        />
      ))}
    </div>
  );
}

// 3D Cube Loader
export function Cube3DLoader() {
  return (
    <div className="relative w-12 h-12 mx-auto">
      <div className="absolute inset-0 animate-spin-3d">
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-2xl transform-gpu"></div>
      </div>
      <div className="absolute inset-0 animate-spin-3d animation-delay-2s opacity-70">
        <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 rounded-lg shadow-2xl transform-gpu"></div>
      </div>
      <div className="absolute inset-0 animate-spin-3d animation-delay-4s opacity-50">
        <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-red-600 rounded-lg shadow-2xl transform-gpu"></div>
      </div>
    </div>
  );
}

// Advanced Loading Spinner
export function LoadingSpinner3D() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-2s"></div>
      <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce animation-delay-4s"></div>
    </div>
  );
}

// Interactive 3D Card with Perspective
interface InteractiveCard3DProps {
  children: ReactNode;
  className?: string;
}

export function InteractiveCard3D({ children, className = "" }: InteractiveCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      
      setMousePos({ x: deltaX, y: deltaY });
      
      const rotateX = deltaY * -15;
      const rotateY = deltaX * 15;
      
      card.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        translateZ(20px)
        scale(1.05)
      `;
      
      // Update gradient based on mouse position
      card.style.background = `
        radial-gradient(
          circle at ${((deltaX + 1) * 50)}% ${((deltaY + 1) * 50)}%, 
          rgba(59, 130, 246, 0.1) 0%, 
          rgba(147, 51, 234, 0.1) 50%, 
          transparent 100%
        )
      `;
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setMousePos({ x: 0, y: 0 });
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
      card.style.background = '';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`
        relative transition-all duration-300 ease-out transform-gpu
        border border-white/20 backdrop-blur-sm rounded-2xl
        ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
      
      {/* Hover glow effect */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse-glow"
          style={{
            background: `radial-gradient(circle at ${((mousePos.x + 1) * 50)}% ${((mousePos.y + 1) * 50)}%, rgba(59, 130, 246, 0.3), transparent 70%)`
          }}
        />
      )}
    </div>
  );
}

// Wave Animation Background
export function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute bottom-0 w-full h-64" viewBox="0 0 1200 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="50%" stopColor="rgba(147, 51, 234, 0.1)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0.1)" />
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient)"
          d="M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,149.3C672,171,768,181,864,165.3C960,149,1056,107,1152,90.7C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          className="animate-wave"
        />
      </svg>
      
      <svg className="absolute bottom-0 w-full h-64" viewBox="0 0 1200 320" preserveAspectRatio="none">
        <path
          fill="rgba(59, 130, 246, 0.05)"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,149.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          className="animate-wave-reverse"
        />
      </svg>
    </div>
  );
}

// Holographic Text Effect
interface HolographicTextProps {
  children: string;
  className?: string;
}

export function HolographicText({ children, className = "" }: HolographicTextProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="relative z-10 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-bold animate-gradient-shift">
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-bold opacity-50 blur-sm animate-pulse"
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 text-cyan-400 opacity-30 animate-flicker"
        style={{ 
          textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
          filter: 'blur(1px)'
        }}
      >
        {children}
      </span>
    </div>
  );
}

// Matrix Rain Effect
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");
    
    const font_size = 10;
    const columns = canvas.width / font_size;
    
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0F4';
      ctx.font = font_size + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * font_size, drops[i] * font_size);
        
        if (drops[i] * font_size > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-20"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}

// Floating Orbs
export function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-sm animate-float`}
          style={{
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${
              ['rgba(59, 130, 246, 0.3)', 'rgba(147, 51, 234, 0.3)', 'rgba(16, 185, 129, 0.3)', 'rgba(245, 101, 101, 0.3)'][
                Math.floor(Math.random() * 4)
              ]
            }, transparent)`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 6}s`,
            '--float-intensity': `${20 + Math.random() * 30}px`
          } as any}
        />
      ))}
    </div>
  );
}

// Typing Animation Effect
interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
}

export function TypingAnimation({ text, speed = 100, className = "" }: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
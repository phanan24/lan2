import { ReactNode, useEffect, useRef } from 'react';

// 3D Card with hover effects
interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export function Card3D({ children, className = "", intensity = 'medium' }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const intensityValues = {
    low: { tilt: 5, glow: 0.3, scale: 1.02 },
    medium: { tilt: 10, glow: 0.5, scale: 1.05 },
    high: { tilt: 15, glow: 0.7, scale: 1.08 }
  };

  const config = intensityValues[intensity];

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      
      const rotateX = deltaY * -config.tilt;
      const rotateY = deltaX * config.tilt;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${config.scale})`;
      card.style.boxShadow = `${deltaX * 20}px ${deltaY * 20}px 40px rgba(0,0,0,${config.glow})`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [config]);

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-300 ease-out transform-gpu ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}
    >
      {children}
    </div>
  );
}

// Floating Animation Component
interface FloatingProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  intensity?: number;
}

export function Floating({ children, duration = 3, delay = 0, intensity = 10 }: FloatingProps) {
  return (
    <div
      className="animate-float"
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        '--float-intensity': `${intensity}px`
      } as any}
    >
      {children}
    </div>
  );
}

// 3D Button Component
interface Button3DProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  disabled?: boolean;
}

export function Button3D({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "",
  disabled = false 
}: Button3DProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
  };

  const handleMouseDown = () => {
    if (!buttonRef.current || disabled) return;
    buttonRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(-4px) scale(0.98)';
  };

  const handleMouseUp = () => {
    if (!buttonRef.current || disabled) return;
    buttonRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current || disabled) return;
    buttonRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`
        ${variants[variant]}
        text-white font-semibold py-3 px-6 rounded-xl
        transition-all duration-200 ease-out transform-gpu
        shadow-lg hover:shadow-2xl
        border-0 outline-none focus:ring-4 focus:ring-opacity-50
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
      }}
    >
      <span className="block transform translate-z-2">{children}</span>
    </button>
  );
}

// Parallax Container
interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className = "" }: ParallaxProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      
      parallaxRef.current.style.transform = `translateY(${parallax}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={parallaxRef} className={`transform-gpu ${className}`}>
      {children}
    </div>
  );
}

// 3D Navigation Item
interface NavItem3DProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}

export function NavItem3D({ children, active = false, onClick, icon }: NavItem3DProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-3 rounded-xl transition-all duration-300 ease-out transform-gpu
        ${active 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
          : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-600 shadow-md hover:shadow-xl hover:scale-102'
        }
        hover:translate-y-[-2px] active:translate-y-0
        border border-gray-200 hover:border-blue-300
      `}
      style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="flex items-center space-x-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="font-medium">{children}</span>
      </div>
      
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl opacity-20 animate-pulse"></div>
      )}
    </button>
  );
}

// Glitch Effect Text
interface GlitchTextProps {
  children: string;
  className?: string;
}

export function GlitchText({ children, className = "" }: GlitchTextProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute top-0 left-0 text-red-500 opacity-70 animate-glitch-1"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }}
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 text-blue-500 opacity-70 animate-glitch-2"
        style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)' }}
      >
        {children}
      </span>
    </div>
  );
}
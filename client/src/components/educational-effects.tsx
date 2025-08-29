import { ReactNode, useEffect, useState } from 'react';

// Success Animation for when students complete tasks
interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function SuccessAnimation({ show, onComplete }: SuccessAnimationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="animate-bounce-in">
        <div className="text-6xl animate-prismatic">🎉</div>
      </div>
      {/* Confetti Effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-bounce-in"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Encouraging Progress Bar
interface StudyProgressProps {
  progress: number; // 0 to 100
  subject: string;
}

export function StudyProgress({ progress, subject }: StudyProgressProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg hover-zoom">
      <div className="flex items-center space-x-3 mb-2">
        <div className="text-xl animate-float-enhanced">📊</div>
        <span className="font-medium text-gray-700">Tiến độ học {subject}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full animate-pulse-glow-enhanced transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-sm text-gray-600 mt-1 text-right">
        {progress}% hoàn thành
      </div>
    </div>
  );
}

// Motivational Quote Card
interface MotivationalCardProps {
  quote: string;
  author?: string;
}

export function MotivationalCard({ quote, author }: MotivationalCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200/50 hover-zoom animate-breathing">
      <div className="flex items-start space-x-3">
        <div className="text-2xl animate-levitate">💪</div>
        <div>
          <blockquote className="text-gray-700 italic">"{quote}"</blockquote>
          {author && (
            <cite className="text-sm text-gray-500 mt-2 block">— {author}</cite>
          )}
        </div>
      </div>
    </div>
  );
}

// Study Achievement Badge
interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  earned?: boolean;
}

export function AchievementBadge({ icon, title, description, earned = false }: AchievementBadgeProps) {
  return (
    <div className={`relative rounded-lg p-3 border-2 transition-all duration-300 hover-zoom ${
      earned 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 animate-pulse-glow-enhanced' 
        : 'bg-gray-50 border-gray-300 opacity-70'
    }`}>
      <div className="text-center">
        <div className={`text-3xl mb-2 ${earned ? 'animate-magnetic-pulse' : ''}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
      {earned && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce-in">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
}

// Interactive Learning Card
interface LearningCardProps {
  children: ReactNode;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function LearningCard({ children, subject, difficulty }: LearningCardProps) {
  const difficultyColors = {
    easy: 'from-green-400 to-emerald-500',
    medium: 'from-yellow-400 to-orange-500',
    hard: 'from-red-400 to-pink-500'
  };

  const difficultyIcons = {
    easy: '🌱',
    medium: '🌿', 
    hard: '🌳'
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover-zoom interactive-hover border border-white/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="animate-float-enhanced">{difficultyIcons[difficulty]}</span>
          <span className="font-medium text-gray-700">{subject}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${difficultyColors[difficulty]} animate-breathing`}>
          {difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó'}
        </div>
      </div>
      {children}
    </div>
  );
}

// Knowledge Tree Visualization
export function KnowledgeTree() {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['root']);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <span className="animate-levitate">🌳</span>
        <span>Cây tri thức</span>
      </h3>
      
      <div className="space-y-2">
        {/* Root Node */}
        <div 
          className="flex items-center space-x-2 cursor-pointer hover-zoom p-2 rounded"
          onClick={() => toggleNode('math')}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse-glow"></div>
          <span className="font-medium">Toán học</span>
          <span className="text-xl animate-tilt">{expandedNodes.includes('math') ? '📖' : '📚'}</span>
        </div>
        
        {expandedNodes.includes('math') && (
          <div className="ml-6 space-y-1 animate-fade-in-up">
            <div className="flex items-center space-x-2 p-2 rounded hover-zoom">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-breathing"></div>
              <span className="text-sm">Đại số</span>
              <span className="animate-float-enhanced">📐</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded hover-zoom">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-magnetic-pulse"></div>
              <span className="text-sm">Hình học</span>
              <span className="animate-tilt">📏</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Study Timer with Pomodoro technique
interface StudyTimerProps {
  duration: number; // in minutes
  onComplete?: () => void;
}

export function StudyTimer({ duration, onComplete }: StudyTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isActive && timeLeft !== 0) {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg text-center hover-zoom">
      <div className="flex items-center justify-center space-x-2 mb-3">
        <span className="animate-levitate text-xl">⏰</span>
        <span className="font-medium">Thời gian học tập</span>
      </div>
      
      <div className="text-3xl font-mono font-bold text-blue-600 mb-4 animate-pulse-glow-enhanced">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      <button
        onClick={() => setIsActive(!isActive)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors animate-breathing"
      >
        {isActive ? 'Tạm dừng' : 'Bắt đầu'}
      </button>
    </div>
  );
}
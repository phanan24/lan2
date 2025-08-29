import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import AskQuestions from "@/components/AskQuestions";
import CheckHomework from "@/components/CheckHomework";
import GenerateTests from "@/components/GenerateTests";
import UtilitiesMenu from "./UtilitiesMenu";
import AdminModal from "@/components/AdminModal";
import AIChatModal from "@/components/AIChatModal";
import { Card3D, Button3D, Floating, Parallax, GlitchText } from "@/components/3d-effects";
import { 
  ParticleSystem, 
  InteractiveCard3D, 
  WaveBackground, 
  HolographicText, 
  FloatingOrbs, 
  TypingAnimation 
} from "@/components/advanced-3d-effects";
import { MotivationalCard } from "@/components/educational-effects";

// Educational quotes for rotation
const educationalQuotes = [
  {
    quote: "Học tập không phải là chuẩn bị cho cuộc sống, học tập chính là cuộc sống",
    author: "John Dewey"
  },
  {
    quote: "Giáo dục là vũ khí mạnh nhất bạn có thể sử dụng để thay đổi thế giới",
    author: "Nelson Mandela"
  },
  {
    quote: "Đầu tư vào tri thức sẽ mang lại lợi nhuận tốt nhất",
    author: "Benjamin Franklin"
  },
  {
    quote: "Học không chỉ là biết, mà là hiểu và áp dụng",
    author: "Khuyết danh"
  }
];
import limvaLogo from "@assets/image_1756141107271_1756276621520.png";

export default function Home() {
  const [activeTab, setActiveTab] = useState("ask-questions");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAIChatModal, setShowAIChatModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  
  // Rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % educationalQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "ask-questions":
        return <AskQuestions />;
      case "check-homework":
        return <CheckHomework />;
      case "generate-tests":
        return <GenerateTests />;
      case "utilities":
        return <UtilitiesMenu />;
      default:
        return <AskQuestions />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen flex flex-col relative overflow-hidden matrix-bg">
      {/* Educational Background Effects - Static */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {/* Static Educational Icons */}
        <div className="absolute top-20 left-16 text-2xl">📚</div>
        <div className="absolute top-40 right-20 text-xl">🎓</div>
        <div className="absolute bottom-40 left-20 text-lg">✏️</div>
        <div className="absolute top-60 right-40 text-xl">🔬</div>
        <div className="absolute bottom-60 right-16 text-lg">📝</div>
        <div className="absolute top-80 left-60 text-xl">🧮</div>
        <div className="absolute bottom-80 right-60 text-lg">📐</div>
      </div>
      
      {/* Static Learning Waves */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1200 320" preserveAspectRatio="none">
          <path
            fill="rgba(34, 197, 94, 0.15)"
            d="M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,149.3C672,171,768,181,864,165.3C960,149,1056,107,1152,90.7C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
      
      {/* Educational Themed Background Shapes - Static */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Book-inspired shapes - static */}
        <div className="absolute top-20 left-10 w-32 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 opacity-8 rounded-lg shadow-lg transform rotate-12"></div>
        <div className="absolute top-40 right-20 w-28 h-20 bg-gradient-to-br from-green-400 to-emerald-500 opacity-10 rounded-lg shadow-md transform -rotate-6"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-28 bg-gradient-to-br from-purple-400 to-violet-500 opacity-8 rounded-lg shadow-lg transform rotate-3"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-18 bg-gradient-to-br from-orange-400 to-yellow-500 opacity-12 rounded-lg transform -rotate-12"></div>
      </div>

      {/* Enhanced Header - Static */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <header className="relative overflow-hidden">
            {/* Static header background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 right-10 w-8 h-8 bg-blue-400 opacity-8 rounded-full"></div>
              <div className="absolute top-4 left-20 w-6 h-6 bg-purple-400 opacity-10 rounded-full"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={limvaLogo} 
                      alt="LimVA Logo" 
                      className="w-12 h-12 object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-15 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                      LimVA
                    </div>
                    <div className="text-sm text-gray-600">
                      Hệ thống học tập và tương tác thông minh
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowAIChatModal(true)}
                    className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md"
                  >
                    <i className="fas fa-question-circle mr-2"></i>
                    Hướng dẫn sử dụng
                  </button>
                  <button
                    onClick={() => setShowAdminModal(true)}
                    className="text-sm px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md"
                  >
                    <i className="fas fa-shield-alt mr-2"></i>
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </header>
        </div>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content - Static Container */}
      <main className="flex-1 mx-auto px-2 sm:px-4 lg:px-6 py-8 relative z-10" style={{ maxWidth: activeTab === 'utilities' ? '95vw' : '1280px' }}>
        <div className="min-h-[500px] bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <div className="relative">
            {/* Educational content decorations - static */}
            <div className="absolute top-4 right-4 text-2xl opacity-15">🌟</div>
            <div className="absolute bottom-6 left-6 text-xl opacity-12">💡</div>
            <div className="absolute top-6 left-4 text-lg opacity-10">🚀</div>
            
            <div className="relative z-10">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer - Static */}
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white py-8 mt-16 relative overflow-hidden">
          {/* Static background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 right-20 w-16 h-16 bg-blue-500 opacity-8 rounded-full"></div>
            <div className="absolute bottom-4 left-16 w-12 h-12 bg-purple-500 opacity-10 rounded-full"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Motivational Section - Dynamic Quotes */}
            <div className="mb-8">
              <MotivationalCard 
                quote={educationalQuotes[currentQuote].quote}
                author={educationalQuotes[currentQuote].author}
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={limvaLogo} 
                    alt="LimVA Logo" 
                    className="w-8 h-8 object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 opacity-15 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent">
                    LimVA 🎓
                  </h3>
                  <p className="text-gray-400 text-sm">Hệ thống học tập và tương tác thông minh</p>
                </div>
              </div>

              {/* Center Info - Copyright Only */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  © 2025 LimVA. Bản quyền ý tưởng thuộc về Văn An.
                </p>
              </div>

              {/* Creator Info */}
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-gray-400 text-sm">Được tạo bởi</span>
                </div>
                <p className="text-white font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Văn An
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 mt-6 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                <div className="flex flex-wrap justify-center gap-4 mb-4 md:mb-0">
                  <span className="text-gray-400 cursor-pointer flex items-center space-x-1">
                    <span>🎓</span><span>Hỏi bài trực tiếp</span>
                  </span>
                  <span className="text-gray-400 cursor-pointer flex items-center space-x-1">
                    <span>📝</span><span>Kiểm tra bài làm</span>
                  </span>
                  <span className="text-gray-400 cursor-pointer flex items-center space-x-1">
                    <span>📋</span><span>Sinh đề thi</span>
                  </span>
                  <span className="text-gray-400 cursor-pointer flex items-center space-x-1">
                    <span>🔧</span><span>Tiện ích AI</span>
                  </span>
                  <a href="/terms" className="text-gray-400 cursor-pointer flex items-center space-x-1">
                    <span>📋</span><span>Điều khoản sử dụng</span>
                  </a>
                </div>
                <div className="text-xs">
                  <span>Version 1.0.0 – Phiên bản phát triển LimVA (Develop Build)</span>
                </div>
              </div>
            </div>
          </div>
        </footer>

      {/* Modals */}
      <AdminModal 
        show={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
      />
      <AIChatModal 
        show={showAIChatModal} 
        onClose={() => setShowAIChatModal(false)} 
      />
    </div>
  );
}

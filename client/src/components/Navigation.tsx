interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "ask-questions", label: "Hỏi bài", icon: <i className="fas fa-question-circle"></i> },
    { id: "check-homework", label: "Kiểm tra bài làm", icon: <i className="fas fa-check-circle"></i> },
    { id: "generate-tests", label: "Sinh đề", icon: <i className="fas fa-file-alt"></i> },
    { id: "utilities", label: "Tiện ích", icon: <i className="fas fa-tools"></i> },
  ];

  return (
    <nav className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4 py-4 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                ${activeTab === tab.id 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

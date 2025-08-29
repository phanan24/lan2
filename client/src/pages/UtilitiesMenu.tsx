import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SimpleDocumentReader from "../components/SimpleDocumentReader";
import AIChatInterface from "../components/AIChatInterface";
import ExperimentsMenu from "@/components/ExperimentsMenu";

export default function UtilitiesMenu() {
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);

  const utilities = [
    {
      id: "document-reader",
      title: "Trình đọc file",
      description: "Đọc và hiển thị file PDF, DOCX, TXT",
      icon: "fas fa-file-text",
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600"
    },
    {
      id: "ai-chat",
      title: "Trò chuyện và học hỏi cùng Cô giáo AI",
      description: "Hỗ trợ học tập 24/7 với AI thông minh",
      icon: "fas fa-robot",
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600"
    },
    {
      id: "simulation-experiments",
      title: "Mô phỏng thí nghiệm",
      description: "Thí nghiệm mô phỏng tương tác PhET",
      icon: "fas fa-flask",
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600"
    },
    {
      id: "word-to-pdf",
      title: "Word sang PDF",
      description: "Chuyển đổi file Word (.docx) sang PDF nhanh chóng",
      icon: "fas fa-file-pdf",
      color: "indigo",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-600"
    }
  ];

  const handleUtilitySelect = (utilityId: string) => {
    setSelectedUtility(utilityId);
  };

  const handleBackToMenu = () => {
    setSelectedUtility(null);
  };

  // Render specific utility component
  const renderUtilityComponent = () => {
    switch (selectedUtility) {
      case "document-reader":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Trình đọc file</h2>
              <Button variant="outline" onClick={handleBackToMenu}>
                <i className="fas fa-arrow-left mr-2"></i>
                Quay lại
              </Button>
            </div>
            
            {/* DocX Format Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Lưu ý:</strong> Trong định dạng DocX (Word), chỉ có văn bản được hiển thị, hình ảnh sẽ không xuất hiện.
                  </p>
                </div>
              </div>
            </div>
            
            <SimpleDocumentReader />
          </div>
        );
      
      case "ai-chat":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Trò chuyện và học hỏi cùng Cô giáo AI</h2>
              <Button variant="outline" onClick={handleBackToMenu}>
                <i className="fas fa-arrow-left mr-2"></i>
                Quay lại
              </Button>
            </div>
            <AIChatInterface />
          </div>
        );

      case "simulation-experiments":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mô phỏng thí nghiệm</h2>
              <Button variant="outline" onClick={handleBackToMenu}>
                <i className="fas fa-arrow-left mr-2"></i>
                Quay lại
              </Button>
            </div>
            <ExperimentsMenu />
          </div>
        );

      case "word-to-pdf":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Word sang PDF</h2>
              <Button variant="outline" onClick={handleBackToMenu}>
                <i className="fas fa-arrow-left mr-2"></i>
                Quay lại
              </Button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-file-pdf text-3xl text-indigo-600"></i>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Chuyển đổi Word sang PDF
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Công cụ chuyển đổi file Word (.docx) sang PDF miễn phí và nhanh chóng. 
                    Bảo mật cao, không lưu trữ file trên server.
                  </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <i className="fas fa-info-circle text-indigo-600 mt-1 mr-3"></i>
                    <div className="text-left">
                      <p className="text-sm text-indigo-800">
                        <strong>Hướng dẫn sử dụng:</strong>
                      </p>
                      <ul className="text-sm text-indigo-700 mt-2 space-y-1">
                        <li>• Nhấn nút "Mở công cụ" bên dưới</li>
                        <li>• Chọn file Word từ máy tính của bạn</li>
                        <li>• Đợi quá trình chuyển đổi hoàn tất</li>
                        <li>• Tải file PDF đã chuyển đổi về máy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <a
                  href="https://tools.pdf24.org/vi/word-sang-pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                  data-testid="button-open-word-to-pdf"
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  Mở công cụ chuyển đổi
                </a>
                
                <p className="text-xs text-gray-500 mt-4">
                  Bạn sẽ được chuyển đến trang web PDF24.org
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // If a utility is selected, render that component
  if (selectedUtility) {
    return (
      <div className="container mx-auto p-6">
        {renderUtilityComponent()}
      </div>
    );
  }

  // Render utilities menu
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tiện ích học tập</h1>
          <p className="text-gray-600">Chọn tiện ích bạn muốn sử dụng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {utilities.map((utility) => (
            <Card 
              key={utility.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleUtilitySelect(utility.id)}
            >
              <CardContent className="p-6">
                <div className={`${utility.bgColor} ${utility.borderColor} border rounded-lg p-6 text-center`}>
                  <i className={`${utility.icon} text-4xl ${utility.textColor} mb-4`}></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {utility.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {utility.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className={`border-${utility.color}-600 text-${utility.color}-600 hover:bg-${utility.color}-50`}
                    data-testid={`button-${utility.id}`}
                  >
                    <i className="fas fa-arrow-right mr-2"></i>
                    Sử dụng
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
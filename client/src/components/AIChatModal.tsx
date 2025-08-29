import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, FileCheck, PenTool, Wrench, FileText, Bot, Beaker } from "lucide-react";

interface AIChatModalProps {
  show: boolean;
  onClose: () => void;
}

type ViewType = 'main' | 'ask' | 'check' | 'generate' | 'utilities' | 'generate-questions' | 'generate-matrix' | 'file-reader' | 'ai-teacher' | 'experiment';

export default function AIChatModal({ show, onClose }: AIChatModalProps) {
  const [currentView, setCurrentView] = useState<ViewType>('main');

  const resetToMain = () => {
    setCurrentView('main');
  };

  const handleClose = () => {
    resetToMain();
    onClose();
  };

  const renderMainView = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('ask')} data-testid="card-ask">
        <CardHeader className="text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <CardTitle className="text-lg">Hỏi bài</CardTitle>
        </CardHeader>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('check')} data-testid="card-check">
        <CardHeader className="text-center">
          <FileCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <CardTitle className="text-lg">Kiểm tra bài làm</CardTitle>
        </CardHeader>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('generate')} data-testid="card-generate">
        <CardHeader className="text-center">
          <PenTool className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <CardTitle className="text-lg">Sinh đề</CardTitle>
        </CardHeader>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('utilities')} data-testid="card-utilities">
        <CardHeader className="text-center">
          <Wrench className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <CardTitle className="text-lg">Tiện ích</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );

  const renderAskView = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3">🙋‍♀️ Hướng dẫn Hỏi bài</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• Vào thẻ Hỏi bài</p>
          <p>• Nhấn Tham gia nhóm Zalo</p>
          <p>• Quét mã QR hoặc nhấn link tham gia nhóm Zalo</p>
          <p>• Xác nhận tham gia trên ứng dụng Zalo</p>
        </div>
      </div>
    </div>
  );

  const renderCheckView = () => (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3">✅ Hướng dẫn Kiểm tra bài làm</h3>
        <div className="space-y-2 text-sm text-green-700">
          <p>• Vào thẻ Kiểm tra bài làm</p>
          <p>• Chọn môn học và đọc kỹ lưu ý</p>
          <p>• Nhập nội dung bài làm để kiểm tra hoặc upload ảnh bài làm</p>
          <p>• Đợi AI xử lý và hiển thị kết quả</p>
          <p>• Nếu chưa hiểu kết quả, có thể chat với GPT để được giải thích thêm</p>
        </div>
      </div>
    </div>
  );

  const renderGenerateView = () => (
    <div className="grid grid-cols-1 gap-4">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('generate-questions')} data-testid="card-generate-questions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-purple-500" />
            Sinh câu hỏi
          </CardTitle>
          <CardDescription>Tạo các câu hỏi theo yêu cầu</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('generate-matrix')} data-testid="card-generate-matrix">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Sinh đề từ ma trận
          </CardTitle>
          <CardDescription>Tạo đề thi từ file ma trận</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );

  const renderUtilitiesView = () => (
    <div className="grid grid-cols-1 gap-4">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('file-reader')} data-testid="card-file-reader">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            Trình đọc file
          </CardTitle>
          <CardDescription>Đọc và xử lý file tài liệu</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('ai-teacher')} data-testid="card-ai-teacher">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-500" />
            Trò chuyện cùng Cô giáo AI
          </CardTitle>
          <CardDescription>Chat với AI như một cô giáo thật</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('experiment')} data-testid="card-experiment">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-orange-500" />
            Mô phỏng thí nghiệm
          </CardTitle>
          <CardDescription>Thực hiện thí nghiệm ảo</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );

  const renderGenerateQuestionsView = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-3">📝 Hướng dẫn Sinh câu hỏi</h3>
        <div className="space-y-2 text-sm text-purple-700">
          <p>• Vào thẻ Sinh đề</p>
          <p>• Chọn Sinh câu hỏi</p>
          <p>• Cấu hình đề (độ khó, loại câu hỏi, ...)</p>
          <p>• Nhập yêu cầu đặc biệt (ví dụ: Bài toán thực tế về Tích phân, ...)</p>
          <p>• Đợi AI sinh kết quả</p>
          <p>• Đề được tạo ra, đáp án ẩn và chỉ hiển thị sau khi làm xong</p>
        </div>
      </div>
    </div>
  );

  const renderGenerateMatrixView = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-3">📊 Hướng dẫn Sinh đề từ ma trận</h3>
        <div className="space-y-2 text-sm text-purple-700">
          <p>• Vào thẻ Sinh đề</p>
          <p>• Chọn Sinh đề từ ma trận</p>
          <p>• Đọc lưu ý, chọn môn học và upload file ma trận</p>
          <p>• Đợi AI sinh kết quả</p>
          <p>• Đề được tạo ra, đáp án ẩn và chỉ hiển thị sau khi làm xong</p>
        </div>
      </div>
    </div>
  );

  const renderFileReaderView = () => (
    <div className="space-y-4">
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold text-orange-800 mb-3">📂 Hướng dẫn Trình đọc file</h3>
        <div className="space-y-2 text-sm text-orange-700">
          <p>• Vào thẻ Tiện ích học tập</p>
          <p>• Chọn Trình đọc file</p>
          <p>• Đọc lưu ý và upload file</p>
        </div>
      </div>
    </div>
  );

  const renderAiTeacherView = () => (
    <div className="space-y-4">
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold text-orange-800 mb-3">👩‍🏫 Hướng dẫn Trò chuyện cùng Cô giáo AI</h3>
        <div className="space-y-2 text-sm text-orange-700">
          <p>• Vào thẻ Tiện ích học tập</p>
          <p>• Chọn Trò chuyện cùng Cô giáo AI</p>
          <p>• Nhắn tin trực tiếp để trao đổi, học hỏi như với một cô giáo bình thường</p>
        </div>
      </div>
    </div>
  );

  const renderExperimentView = () => (
    <div className="space-y-4">
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold text-orange-800 mb-3">🔬 Hướng dẫn Mô phỏng thí nghiệm</h3>
        <div className="space-y-2 text-sm text-orange-700">
          <p>• Vào thẻ Tiện ích học tập</p>
          <p>• Chọn Mô phỏng thí nghiệm</p>
          <p>• Chọn môn học cần thí nghiệm</p>
          <p>• Với Vật lý: chọn khối, chọn chương → nếu có thí nghiệm thì có thể sử dụng</p>
          <p>• Với Hóa học: có thể chọn 1 trong 20 thí nghiệm có sẵn</p>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'main': return renderMainView();
      case 'ask': return renderAskView();
      case 'check': return renderCheckView();
      case 'generate': return renderGenerateView();
      case 'utilities': return renderUtilitiesView();
      case 'generate-questions': return renderGenerateQuestionsView();
      case 'generate-matrix': return renderGenerateMatrixView();
      case 'file-reader': return renderFileReaderView();
      case 'ai-teacher': return renderAiTeacherView();
      case 'experiment': return renderExperimentView();
      default: return renderMainView();
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <span>Hướng dẫn sử dụng</span>
            {currentView !== 'main' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToMain}
                className="ml-auto"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            AI hỗ trợ người dùng trong việc hướng dẫn sử dụng website
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4" data-testid="guide-content">
          {renderCurrentView()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

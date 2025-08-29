import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SimpleDocumentReader from "./SimpleDocumentReader";

interface UtilitiesProps {
  onOpenAIChat: () => void;
}

export default function Utilities({ onOpenAIChat }: UtilitiesProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* First Row - Document Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleDocumentReader />

          {/* Second Card - Zalo Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fab fa-facebook-messenger mr-2 text-blue-600"></i>
                Hỏi đáp trực tiếp qua Zalo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <i className="fab fa-facebook-messenger text-4xl text-blue-600 mb-3"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tham gia nhóm Zalo
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Kết nối trực tiếp với giáo viên và học sinh khác để hỏi đáp tức thì
                  </p>
                  <a
                    href="https://zalo.me/g/your-group-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <i className="fab fa-facebook-messenger mr-2"></i>
                    Tham gia ngay
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - AI Chat & Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-robot mr-2 text-green-600"></i>
                Trò chuyện với AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <i className="fas fa-robot text-4xl text-green-600 mb-3"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hỗ trợ học tập 24/7
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Hỏi bất kỳ câu hỏi nào về học tập, AI sẽ giải đáp chi tiết
                  </p>
                  <Button 
                    onClick={onOpenAIChat} 
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-open-ai-chat"
                  >
                    <i className="fas fa-comments mr-2"></i>
                    Bắt đầu chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-calculator mr-2 text-purple-600"></i>
                Máy tính khoa học
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <i className="fas fa-calculator text-4xl text-purple-600 mb-3"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tính toán phức tạp
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Máy tính với các hàm toán học, lượng giác, logarit
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    data-testid="button-calculator"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i>
                    Mở máy tính
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Unit Converter & Academic Calendar & Word to PDF */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Converter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-exchange-alt mr-2 text-orange-600"></i>
                Chuyển đổi đơn vị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <i className="fas fa-exchange-alt text-4xl text-orange-600 mb-3"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Đổi đơn vị nhanh
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Chuyển đổi độ dài, khối lượng, thể tích, nhiệt độ
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    data-testid="button-unit-converter"
                  >
                    <i className="fas fa-arrows-alt-h mr-2"></i>
                    Chuyển đổi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-calendar-alt mr-2 text-red-600"></i>
                Lịch học tập
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <i className="fas fa-calendar-alt text-4xl text-red-600 mb-3"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Quản lý thời gian
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Lên kế hoạch học tập, đặt nhắc nhở, theo dõi tiến độ
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    data-testid="button-calendar"
                  >
                    <i className="fas fa-calendar-plus mr-2"></i>
                    Xem lịch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Word to PDF Converter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-file-pdf mr-2 text-indigo-600"></i>
                Word sang PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <i className="fas fa-file-pdf text-4xl text-indigo-600 mb-3"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chuyển đổi tệp
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Chuyển đổi file Word (.docx) sang PDF một cách nhanh chóng
                  </p>
                  <a
                    href="https://tools.pdf24.org/vi/word-sang-pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    data-testid="button-word-to-pdf"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i>
                    Sử dụng
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
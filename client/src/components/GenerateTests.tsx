import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getAvailableSubjects } from "@shared/subjects";
import { LatexRenderer } from "./LatexRenderer";

// PDF.js types
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function GenerateTests() {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState("10");
  const [requirements, setRequirements] = useState("");
  const [generatedTest, setGeneratedTest] = useState<any>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  
  // Matrix PDF generation states
  const [matrixSubject, setMatrixSubject] = useState("");
  const [matrixFile, setMatrixFile] = useState<File | null>(null);
  const [matrixImages, setMatrixImages] = useState<string[]>([]);
  const [matrixTest, setMatrixTest] = useState<any>(null);
  const [showMatrixAnswers, setShowMatrixAnswers] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch admin settings to determine available subjects
  const { data: adminSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  const useGpt5 = (adminSettings as any)?.gpt5Enabled && !(adminSettings as any)?.deepseekEnabled;
  const availableSubjects = getAvailableSubjects(useGpt5);

  const generateTestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/test/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedTest(data);
      setShowAnswers(false);
      toast({
        title: "Đề sinh thành công",
        description: "Đề thi đã được tạo xong.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể sinh đề. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const generateMatrixTestMutation = useMutation({
    mutationFn: async (data: { subject: string; matrixImages: string[] }) => {
      console.log("Sending matrix test generation request:", data);
      const response = await apiRequest("POST", "/api/test/generate-from-matrix", data);
      const result = await response.json();
      console.log("Matrix test generation response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Matrix test generation successful:", data);
      setMatrixTest(data);
      setShowMatrixAnswers(false);
      toast({
        title: "Đề sinh thành công từ ma trận",
        description: "Đề thi từ ma trận đã được tạo xong.",
      });
    },
    onError: (error) => {
      console.error("Matrix test generation error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể sinh đề từ ma trận. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!subject || !difficulty || !questionType || !questionCount) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin cấu hình.",
        variant: "destructive",
      });
      return;
    }

    generateTestMutation.mutate({
      subject,
      difficulty,
      questionType,
      questionCount: parseInt(questionCount),
      requirements,
    });
  };

  // Handle PDF file upload and conversion to images
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file PDF.",
        variant: "destructive",
      });
      return;
    }

    setMatrixFile(file);
    setIsProcessingPdf(true);

    try {
      // Load PDF.js if not already loaded
      if (!window.pdfjsLib) {
        await loadPdfJs();
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const imageUrls: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 2; // Higher resolution
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);

        await page.render({ canvasContext: context, viewport }).promise;
        
        // Convert canvas to blob and upload to ImgBB
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png', 0.8);
        });
        
        // Upload to ImgBB
        const base64 = await blobToBase64(blob);
        const uploadResponse = await apiRequest("POST", "/api/upload/image", { 
          image: base64 
        });
        const uploadResult = await uploadResponse.json();
        imageUrls.push(uploadResult.url);
      }

      setMatrixImages(imageUrls);
      toast({
        title: "PDF đã được xử lý",
        description: `Đã chuyển đổi ${imageUrls.length} trang thành ảnh.`,
      });
    } catch (error) {
      console.error('PDF processing error:', error);
      toast({
        title: "Lỗi xử lý PDF",
        description: "Không thể chuyển đổi PDF. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleGenerateFromMatrix = () => {
    if (!matrixSubject || matrixImages.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn môn học và upload file ma trận PDF.",
        variant: "destructive",
      });
      return;
    }

    generateMatrixTestMutation.mutate({
      subject: matrixSubject,
      matrixImages,
    });
  };

  // Helper functions
  const loadPdfJs = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/png;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const toggleMatrixAnswers = () => {
    setShowMatrixAnswers(!showMatrixAnswers);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sinh đề thi</h1>

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className={`grid w-full ${useGpt5 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="questions">Sinh câu hỏi</TabsTrigger>
          {useGpt5 && <TabsTrigger value="matrix">Sinh đề từ ma trận</TabsTrigger>}
        </TabsList>

        <TabsContent value="questions">
          <Card>
        <CardHeader>
          <CardTitle>Cấu hình sinh đề</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Subject Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Môn học</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger data-testid="select-subject">
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Mức độ</Label>
              <RadioGroup value={difficulty} onValueChange={setDifficulty}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className="text-sm text-gray-700">Dễ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="text-sm text-gray-700">Vừa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className="text-sm text-gray-700">Khó</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Question Type */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Loại câu hỏi</Label>
              <RadioGroup value={questionType} onValueChange={setQuestionType}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple-choice" id="multiple-choice" />
                    <Label htmlFor="multiple-choice" className="text-sm text-gray-700">
                      Trắc nghiệm A,B,C,D
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true-false" id="true-false" />
                    <Label htmlFor="true-false" className="text-sm text-gray-700">
                      Đúng/Sai (1 câu - 4 mệnh đề)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short-answer" id="short-answer" />
                    <Label htmlFor="short-answer" className="text-sm text-gray-700">
                      Trả lời ngắn (tự luận)
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Số câu hỏi</Label>
              <Input
                type="number"
                placeholder="10"
                min="1"
                max="50"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                data-testid="input-question-count"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Yêu cầu đặc biệt</Label>
              <Input
                type="text"
                placeholder="Ví dụ: Tập trung vào hình học"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                data-testid="input-requirements"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleGenerate}
              disabled={generateTestMutation.isPending}
              data-testid="button-generate-test"
            >
              <i className="fas fa-magic mr-2"></i>
              {generateTestMutation.isPending ? "Đang sinh đề..." : "Sinh đề"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Test */}
      {generatedTest && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions Column */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Câu hỏi</CardTitle>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {subject} - Mức độ {difficulty}
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {generatedTest.questions.map((question: any, index: number) => (
                  <div key={question.id} className="border-b border-gray-200 pb-4">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-sm font-medium rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">{question.question}</p>
                        {questionType === "multiple-choice" ? (
                          <div className="space-y-1">
                            {question.options?.map((option: string, optIndex: number) => (
                              <label key={optIndex} className="flex items-center text-sm">
                                <input
                                  type="radio"
                                  name={`q${question.id}`}
                                  value={String.fromCharCode(65 + optIndex)}
                                  className="text-primary focus:ring-primary mr-2"
                                />
                                <span>{String.fromCharCode(65 + optIndex)}. {option}</span>
                              </label>
                            ))}
                          </div>
                        ) : questionType === "true-false" ? (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-3">Các mệnh đề sau đúng hay sai?</p>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="text-left p-3 font-medium text-gray-700">Mệnh đề</th>
                                    <th className="text-center p-3 font-medium text-gray-700 w-20">Đúng</th>
                                    <th className="text-center p-3 font-medium text-gray-700 w-20">Sai</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {question.statements?.map((statement: any, stIndex: number) => (
                                    <tr key={stIndex} className="border-t border-gray-200">
                                      <td className="p-3">
                                        <span className="font-medium">{statement.label || String.fromCharCode(97 + stIndex)})</span> {statement.text}
                                      </td>
                                      <td className="text-center p-3">
                                        <input
                                          type="radio"
                                          name={`q${question.id}_s${stIndex}`}
                                          value="true"
                                          className="text-green-500 focus:ring-green-500"
                                        />
                                      </td>
                                      <td className="text-center p-3">
                                        <input
                                          type="radio"
                                          name={`q${question.id}_s${stIndex}`}
                                          value="false"
                                          className="text-red-500 focus:ring-red-500"
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {question.statements?.map((statement: any, stIndex: number) => (
                              <label key={stIndex} className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="text-primary focus:ring-primary mr-2"
                                />
                                <span>{statement.text}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Answers Column */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Đáp án</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAnswers}
                data-testid="button-toggle-answers"
              >
                <i className={`fas ${showAnswers ? "fa-eye-slash" : "fa-eye"} mr-1`}></i>
                <span>{showAnswers ? "Ẩn đáp án" : "Hiện đáp án"}</span>
              </Button>
            </CardHeader>
            <CardContent>
              {showAnswers ? (
                <div className="space-y-6">
                  {generatedTest.answers.map((answer: any, index: number) => {
                    const correspondingQuestion = generatedTest.questions[index];
                    return (
                      <div
                        key={answer.id}
                        className="border border-gray-200 rounded-lg bg-white shadow-sm"
                      >
                        {/* Header */}
                        <div className="flex items-center p-4 bg-blue-50 border-b border-blue-100">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3">
                            {index + 1}
                          </span>
                          <h4 className="font-semibold text-blue-900">Câu {index + 1}</h4>
                        </div>
                        
                        {/* Answer Content */}
                        <div className="p-4 space-y-4">
                          {/* Short Answer Display */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-green-800 font-semibold text-sm uppercase tracking-wide mb-1">Đáp án:</p>
                            <p className="text-green-900 font-bold text-lg">{answer.answer}</p>
                          </div>
                          
                          {/* Detailed Explanation */}
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-700 font-medium mb-2 text-sm uppercase tracking-wide">Giải thích chi tiết:</p>
                            <div className="text-gray-800 leading-relaxed">
                              <LatexRenderer content={answer.explanation || ""} />
                            </div>
                          </div>
                          
                          {/* For True/False questions, show detailed breakdown */}
                          {correspondingQuestion?.statements && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-yellow-800 font-medium mb-3 text-sm uppercase tracking-wide">Chi tiết từng mệnh đề:</p>
                              <div className="space-y-2">
                                {correspondingQuestion.statements.map((stmt: any, stmtIndex: number) => (
                                  <div key={stmtIndex} className="flex items-start space-x-3">
                                    <span className="font-bold text-yellow-800 mt-0.5">
                                      {stmt.label || String.fromCharCode(97 + stmtIndex)})
                                    </span>
                                    <div className="flex-1">
                                      <div className="text-yellow-900 inline">
                                        <LatexRenderer content={stmt.text || ""} />
                                      </div>
                                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                        stmt.isCorrect 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {stmt.isCorrect ? 'ĐÚNG' : 'SAI'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <i className="fas fa-eye-slash text-3xl mb-3"></i>
                  <p>Đáp án đã được ẩn</p>
                  <p className="text-sm mt-1">Nhấn "Hiện đáp án" để xem kết quả</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
        </TabsContent>

        {useGpt5 && (
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Sinh đề từ ma trận PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Matrix Generation Notice */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fas fa-info-circle text-blue-400"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Lưu ý:</strong> Tính năng sinh ma trận từ tệp hiện vẫn trong giai đoạn thử nghiệm. Khi trải nghiệm, bạn vui lòng giới hạn số lượng tối đa 8 câu hỏi trong ma trận. Hệ thống hiện chỉ hỗ trợ tệp PDF; đối với tệp Word, hãy chuyển đổi sang định dạng PDF trước khi sử dụng. Để có được các câu hỏi chất lượng hơn, chúng tôi khuyến khích bạn nên sử dụng tính năng SINH CÂU HỎI trước.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Subject Selection for Matrix */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Môn học</Label>
                  <Select value={matrixSubject} onValueChange={setMatrixSubject}>
                    <SelectTrigger data-testid="select-matrix-subject">
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((subj) => (
                        <SelectItem key={subj} value={subj}>
                          {subj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* PDF Upload */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Upload file ma trận PDF
                  </Label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePdfUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingPdf}
                      data-testid="button-upload-pdf"
                    >
                      {isProcessingPdf ? "Đang xử lý PDF..." : "Chọn file PDF"}
                    </Button>
                    
                    {matrixFile && (
                      <div className="text-sm text-gray-600">
                        File đã chọn: {matrixFile.name}
                      </div>
                    )}
                    
                    {matrixImages.length > 0 && (
                      <div className="text-sm text-green-600">
                        ✓ Đã chuyển đổi {matrixImages.length} trang thành ảnh
                      </div>
                    )}
                  </div>
                </div>

                {/* Matrix Images Preview */}
                {matrixImages.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Xem trước ma trận đã upload
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {matrixImages.map((imageUrl, index) => (
                        <div key={index} className="border rounded-lg p-2">
                          <img
                            src={imageUrl}
                            alt={`Trang ${index + 1}`}
                            className="w-full h-auto max-h-48 object-contain"
                          />
                          <p className="text-xs text-gray-500 text-center mt-1">
                            Trang {index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleGenerateFromMatrix}
                    disabled={generateMatrixTestMutation.isPending || !matrixSubject || matrixImages.length === 0}
                    className="w-full"
                    data-testid="button-generate-matrix-test"
                  >
                    {generateMatrixTestMutation.isPending ? "Đang sinh đề từ ma trận..." : "Sinh đề từ ma trận"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matrix Test Results */}
          {matrixTest && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Đề thi từ ma trận - {matrixSubject}</CardTitle>
                  <Button
                    onClick={() => setShowMatrixAnswers(!showMatrixAnswers)}
                    variant="outline"
                    data-testid="button-toggle-matrix-answers"
                  >
                    {showMatrixAnswers ? "Ẩn đáp án" : "Hiện đáp án"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {matrixTest.questions?.map((question: any, index: number) => (
                      <div key={index} className="border-b pb-6">
                        <div className="mb-4">
                          <strong className="text-blue-700">Câu {index + 1}: </strong>
                          <div className="text-gray-800 inline">
                            <LatexRenderer content={question.question || ""} />
                          </div>
                        </div>

                        {question.type === "multiple-choice" && (
                          <div className="space-y-2 ml-4">
                            {question.options?.map((option: any, optIndex: number) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded ${
                                  showMatrixAnswers && option.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                }`}
                              >
                                <strong>{String.fromCharCode(65 + optIndex)}. </strong>
                                <div className="text-gray-700 inline">
                                  <LatexRenderer content={option.text || ""} />
                                </div>
                                {showMatrixAnswers && option.isCorrect && (
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                    ĐÚNG
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === "true-false" && (
                          <div className="ml-4">
                            <div className="space-y-3">
                              {question.statements?.map((stmt: any, stmtIndex: number) => (
                                <div key={stmtIndex} className="flex items-center">
                                  <div className="w-6 text-center font-medium text-gray-600 mr-3">
                                    {stmtIndex + 1}.
                                  </div>
                                  <div className="flex-1 flex items-center">
                                    <div className="text-yellow-900 inline">
                                      <LatexRenderer content={stmt.text || ""} />
                                    </div>
                                    {showMatrixAnswers && (
                                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                        stmt.isCorrect 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {stmt.isCorrect ? 'ĐÚNG' : 'SAI'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.type === "short-answer" && showMatrixAnswers && (
                          <div className="ml-4 bg-blue-50 border-l-4 border-blue-200 p-4 rounded">
                            <div className="text-sm text-blue-700 font-medium mb-2">
                              Đáp án mẫu:
                            </div>
                            <div className="text-blue-800">
                              <LatexRenderer content={question.answer || ""} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

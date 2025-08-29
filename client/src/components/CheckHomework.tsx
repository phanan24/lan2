import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvailableSubjects, supportsImageUpload } from "@shared/subjects";
import { LatexRenderer } from "@/components/LatexRenderer";

const subjectIcons = {
  "Toán": "fas fa-calculator",
  "Ngữ văn": "fas fa-book",
  "Địa lí": "fas fa-globe",
  "Giáo dục Kinh tế và Pháp luật": "fas fa-balance-scale",
  "Vật lí": "fas fa-atom",
  "Hóa học": "fas fa-flask",
  "Sinh học": "fas fa-dna",
  "Công nghệ": "fas fa-cogs",
  "Tin học": "fas fa-computer"
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = error => reject(error);
  });
};

const compressImage = (file: File, quality: number = 0.8, maxWidth: number = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export default function CheckHomework() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [followupResponse, setFollowupResponse] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch admin settings to determine AI model and available subjects
  const { data: adminSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  // Determine current AI model and available features
  const useGpt5 = (adminSettings as any)?.gpt5Enabled && !(adminSettings as any)?.deepseekEnabled;
  const availableSubjects = getAvailableSubjects(useGpt5);
  const imageUploadEnabled = supportsImageUpload(useGpt5);

  // Reset selected subject if it's not available for current AI model
  useEffect(() => {
    if (selectedSubject && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject("");
    }
  }, [availableSubjects, selectedSubject]);

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      // Compress image before uploading to prevent payload too large error
      const compressedBase64 = await compressImage(file, 0.8, 1024);
      const response = await apiRequest("POST", "/api/upload/image", { image: compressedBase64 });
      return response.json();
    },
  });

  const submitHomeworkMutation = useMutation({
    mutationFn: async (data: { subject: string; content: string; imageUrl?: string }) => {
      const response = await apiRequest("POST", "/api/homework/submit", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      setSubmissionId(data.id);
      // Reset chat when new homework is submitted
      setFollowupResponse("");
      setLastQuestion("");
      setFollowupQuestion("");
      toast({
        title: "Phân tích hoàn tất",
        description: "Bài làm của bạn đã được phân tích xong.",
      });
    },
    onError: (error) => {
      console.error("Submit error:", error);
      let errorMessage = "Không thể phân tích bài làm. Vui lòng thử lại.";
      
      // Check for specific error types
      if (error.message.includes("429") || error.message.includes("Rate limit")) {
        errorMessage = "Đã hết quota API miễn phí trong ngày. Vui lòng thử lại sau hoặc nạp thêm credits vào OpenRouter.";
      } else if (error.message.includes("401") || error.message.includes("API key")) {
        errorMessage = "API key không hợp lệ. Vui lòng kiểm tra cấu hình trong admin panel.";
      } else if (error.message.includes("OpenRouter API key chưa được cấu hình")) {
        errorMessage = "Chưa cấu hình OpenRouter API key. Vui lòng vào admin panel để cấu hình.";
      }
      
      toast({
        title: "Lỗi phân tích bài làm",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const followupMutation = useMutation({
    mutationFn: async ({ id, question }: { id: string; question: string }) => {
      const response = await apiRequest("POST", `/api/homework/${id}/followup`, { question });
      return response.json();
    },
    onSuccess: (data) => {
      setFollowupResponse(data.response);
      toast({
        title: "Trả lời",
        description: "Đã nhận được câu trả lời.",
      });
    },
    onError: (error) => {
      console.error("Followup error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể nhận câu trả lời. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    },
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !content) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn môn học và nhập nội dung bài làm.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl;
      if (imageFile) {
        const uploadResult = await uploadImageMutation.mutateAsync(imageFile);
        imageUrl = uploadResult.url;
      }

      await submitHomeworkMutation.mutateAsync({
        subject: selectedSubject,
        content,
        imageUrl,
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleFollowup = () => {
    if (!submissionId || !followupQuestion) return;
    
    // Save the question before sending
    const questionToSend = followupQuestion;
    setLastQuestion(questionToSend);
    setFollowupQuestion("");
    
    followupMutation.mutate({ id: submissionId, question: questionToSend });
  };

  return (
    <div className="space-y-6">
      {/* AI Model Status Banner */}
      {adminSettings && (
        <div className={`p-3 rounded-lg border ${useGpt5 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <p className="text-sm font-medium">
            {useGpt5 ? (
              <>🤖 Hệ thống LimVA đang sử dụng mô hình AI cao cấp, hỗ trợ đầy đủ tất cả môn học và cho phép upload ảnh.</>
            ) : (
              <>🤖 Hệ thống LimVA đang vận hành trên mô hình AI thông dụng, chuyên sâu trong hỗ trợ tính toán.</>
            )}
          </p>
        </div>
      )}

      {/* Subject Selection - Hide after selecting */}
      {!selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle>Chọn môn học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-amber-600 mt-1 mr-3"></i>
                <div className="flex-1">
                  <p className="text-sm text-amber-800 font-medium">
                    <strong>Lưu ý:</strong> Bạn hãy chọn đúng môn học trước khi đặt câu hỏi nhé. Nếu chọn sai, AI sẽ không thể trả về kết quả cho bạn.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {availableSubjects.map((subject) => (
                <button
                  key={subject}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all duration-200 text-center group"
                  onClick={() => setSelectedSubject(subject)}
                  data-testid={`subject-${subject.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${(subjectIcons as any)[subject] || 'fas fa-book'} text-2xl mb-2 text-gray-400 group-hover:text-primary transition-colors duration-200`}></i>
                  <div className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors duration-200">
                    {subject}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Homework Input */}
      {selectedSubject && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nhập bài cần kiểm tra - {selectedSubject}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubject("")}
                data-testid="button-change-subject"
              >
                Đổi môn học
              </Button>
            </div>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Nội dung bài làm
              </label>
              <span className="text-xs text-gray-500">
                {content.length}/5000 ký tự
              </span>
            </div>
            <Textarea
              className="resize-none"
              rows={6}
              maxLength={5000}
              placeholder="Nhập nội dung bài làm của bạn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              data-testid="textarea-homework-content"
            />
          </div>

          {imageUploadEnabled && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors duration-200 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                data-testid="input-image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-3"></i>
                <p className="text-gray-600">
                  Kéo thả ảnh vào đây hoặc{" "}
                  <span className="text-primary font-medium">chọn file</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Hỗ trợ: JPG, PNG, GIF (tối đa 10MB)
                </p>
                {imageFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Đã chọn: {imageFile.name}
                  </p>
                )}
              </label>
            </div>
          )}



          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={submitHomeworkMutation.isPending || uploadImageMutation.isPending}
              data-testid="button-analyze-homework"
            >
              <i className="fas fa-magic mr-2"></i>
              {submitHomeworkMutation.isPending ? "Đang phân tích..." : "Kiểm tra bài làm"}
            </Button>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Analysis Result */}
      {analysis && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kết quả phân tích</CardTitle>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              analysis.hasErrors 
                ? "bg-red-100 text-red-700" 
                : "bg-green-100 text-green-700"
            }`}>
              {analysis.hasErrors ? "Có lỗi sai" : "Chính xác"}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.hasErrors && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-red-500 mt-1 mr-3"></i>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800 mb-2">Lỗi sai được phát hiện:</h4>
                    {analysis.errors.map((error: string, index: number) => (
                      <div key={index} className="mb-2">
                        <LatexRenderer content={error} className="text-red-700" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <i className="fas fa-lightbulb text-blue-500 mt-1 mr-3"></i>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-800 mb-2">Giải thích chi tiết:</h4>
                  {analysis.explanations.map((explanation: string, index: number) => (
                    <div key={index} className="mb-3">
                      <LatexRenderer content={explanation} className="text-blue-700" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Q&A */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Có câu hỏi thêm?</h4>
              
              {/* Followup Response */}
              {followupResponse && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg mb-4">
                  <div className="flex items-start">
                    <i className="fas fa-robot text-green-500 mt-1 mr-3"></i>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">Trả lời AI:</h5>
                      <LatexRenderer content={followupResponse} className="text-gray-700" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ví dụ: Tại sao công thức này lại sai?"
                  value={followupQuestion}
                  onChange={(e) => setFollowupQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !followupMutation.isPending && followupQuestion && handleFollowup()}
                  data-testid="input-followup-question"
                />
                <Button
                  onClick={handleFollowup}
                  disabled={followupMutation.isPending || !followupQuestion}
                  data-testid="button-ask-followup"
                >
                  {followupMutation.isPending ? (
                    <i className="fas fa-spinner animate-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

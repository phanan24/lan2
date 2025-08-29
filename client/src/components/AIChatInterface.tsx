import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

export default function AIChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch admin settings to check AI model
  const { data: adminSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  const useGpt5 = (adminSettings as any)?.gpt5Enabled && !(adminSettings as any)?.deepseekEnabled;

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; image?: File }) => {
      const formData = new FormData();
      formData.append('message', data.message);
      if (data.image) {
        formData.append('image', data.image);
      }
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Add AI response to messages
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "Phản hồi từ AI",
        description: "AI đã trả lời câu hỏi của bạn",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi chat với AI",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file ảnh (JPG, PNG, GIF...)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: "Vui lòng chọn ảnh nhỏ hơn 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && !selectedImage) {
      toast({
        title: "Tin nhắn trống",
        description: "Vui lòng nhập tin nhắn hoặc chọn ảnh",
        variant: "destructive",
      });
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      image: imagePreview || undefined,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    chatMutation.mutate({
      message: inputMessage,
      image: selectedImage || undefined
    });

    // Clear inputs
    setInputMessage("");
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Đã xóa lịch sử chat",
      description: "Cuộc trò chuyện đã được làm mới",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <i className="fas fa-robot mr-2 text-green-600"></i>
              Cô Giáo AI
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearChat}>
              <i className="fas fa-trash mr-1"></i>
              Xóa chat
            </Button>
          </div>
        </CardHeader>

        {/* Chat Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <i className="fas fa-robot text-4xl text-gray-300 mb-4"></i>
              <p>Bắt đầu cuộc trò chuyện với AI</p>
              <p className="text-sm">Bạn có thể gửi text hoặc upload ảnh để hỏi</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="rounded mb-2 max-w-full h-auto max-h-48 object-contain"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className={`text-xs ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                  <span>AI đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded border"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          )}

          {/* Input Controls */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="resize-none"
                rows={2}
                data-testid="textarea-ai-message"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                data-testid="input-ai-image"
              />
              {useGpt5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-ai-upload-image"
                >
                  <i className="fas fa-image"></i>
                </Button>
              )}
              <Button
                onClick={handleSendMessage}
                disabled={chatMutation.isPending || (!inputMessage.trim() && !selectedImage)}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-ai-send"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
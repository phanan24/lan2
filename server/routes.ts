import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { OpenRouterService } from "./services/openrouter";
import { ImgBBService } from "./services/imgbb";
import { insertHomeworkSubmissionSchema, insertGeneratedTestSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import XLSX from "xlsx";
import fs from "fs";
import envTestRouter from "./env-test";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin@limva.edu.vn";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "$2b$10$Tlkzct47Xv7AuudfpqBlO.OzZl13PLHy5OI.rl7CyFmfQF9Ez7aEe"; // "Vanan24042008"

// Configure multer for document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  }
});

// Configure multer specifically for AI chat image uploads
const chatUpload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for chat images
  },
  fileFilter: (req, file, cb) => {
    // Accept common image types for AI chat
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP)'));
    }
  }
});

// Configure multer for SQL file import
const sqlUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for SQL files
  },
  fileFilter: (req, file, cb) => {
    // Accept .sql files regardless of mimetype
    if (file.originalname.toLowerCase().endsWith('.sql')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ file .sql'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username !== ADMIN_USERNAME) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ success: true, message: "Đăng nhập thành công" });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Lỗi đăng nhập" });
    }
  });

  // Get admin settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getAdminSettings();
      if (!settings) {
        // Return default settings
        return res.json({
          deepseekEnabled: true,
          gpt5Enabled: false,
          openrouterApiKey: "",
          imgbbApiKey: "",
        });
      }
      
      res.json({
        deepseekEnabled: settings.deepseekEnabled,
        gpt5Enabled: settings.gpt5Enabled,
        openrouterApiKey: settings.openrouterApiKey ? "***" : "", // Don't expose actual key
        imgbbApiKey: settings.imgbbApiKey ? "***" : "", // Don't expose actual key
      });
    } catch (error) {
      console.error("Get admin settings error:", error);
      res.status(500).json({ message: "Lỗi tải cài đặt" });
    }
  });

  // Update admin settings
  app.post("/api/admin/settings", async (req, res) => {
    try {
      const { deepseekEnabled, gpt5Enabled, openrouterApiKey, imgbbApiKey } = req.body;
      
      // Ensure only one AI model is enabled at a time
      let finalDeepseekEnabled = deepseekEnabled;
      let finalGpt5Enabled = gpt5Enabled;
      
      if (deepseekEnabled && gpt5Enabled) {
        // If both are enabled, prioritize the last one changed
        finalDeepseekEnabled = true;
        finalGpt5Enabled = false;
      }
      
      const settings = await storage.updateAdminSettings({
        deepseekEnabled: finalDeepseekEnabled,
        gpt5Enabled: finalGpt5Enabled,
        openrouterApiKey,
        imgbbApiKey,
      });
      
      res.json({ 
        success: true, 
        message: "Cài đặt đã được lưu",
        settings: {
          deepseekEnabled: settings.deepseekEnabled,
          gpt5Enabled: settings.gpt5Enabled,
          openrouterApiKey: settings.openrouterApiKey ? "***" : "",
          imgbbApiKey: settings.imgbbApiKey ? "***" : "",
        }
      });
    } catch (error) {
      console.error("Update admin settings error:", error);
      res.status(500).json({ message: "Lỗi lưu cài đặt" });
    }
  });

  // Submit homework for checking
  app.post("/api/homework/submit", async (req, res) => {
    try {
      const validatedData = insertHomeworkSubmissionSchema.parse(req.body);
      
      const submission = await storage.createHomeworkSubmission(validatedData);
      
      // Get current AI settings
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      

      
      if (!apiKey) {
        return res.status(400).json({ message: "OpenRouter API key chưa được cấu hình" });
      }
      
      // Determine which AI model to use
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      const aiModel = useGpt5 ? "openai/gpt-5" : "deepseek/deepseek-r1:free";
      
      // Analyze homework
      const openRouter = new OpenRouterService(apiKey);
      const analysis = await openRouter.analyzeHomework(
        validatedData.content,
        validatedData.imageUrl || null,
        validatedData.subject,
        aiModel
      );
      
      // Update submission with analysis
      const updatedSubmission = await storage.updateHomeworkAnalysis(submission.id, analysis);
      
      // Create homework chat context for future Q&A
      await storage.createHomeworkChatContext({
        homeworkId: submission.id,
        subject: validatedData.subject,
        homeworkContent: validatedData.content,
        analysis: analysis,
        questions: []
      });
      
      res.json({
        id: updatedSubmission.id,
        analysis,
      });
    } catch (error) {
      console.error("Homework submission error:", error);
      
      // Check if it's a rate limit error
      if ((error as Error).message?.includes("Rate limit exceeded") || (error as Error).message?.includes("429")) {
        return res.status(429).json({ 
          message: "Đã hết quota API miễn phí trong ngày. Vui lòng thử lại sau hoặc nạp thêm credits vào OpenRouter.",
          isRateLimit: true
        });
      }
      
      // Check if it's an API key error
      if ((error as Error).message?.includes("Invalid API key") || (error as Error).message?.includes("401")) {
        return res.status(401).json({ 
          message: "API key không hợp lệ. Vui lòng kiểm tra cấu hình trong admin panel.",
          isApiKeyError: true
        });
      }
      
      res.status(500).json({ message: "Lỗi phân tích bài làm" });
    }
  });

  // Upload image
  app.post("/api/upload/image", async (req, res) => {
    try {
      const { image } = req.body; // base64 image
      
      if (!image) {
        return res.status(400).json({ message: "Không có ảnh được tải lên" });
      }
      
      // Get admin settings for ImgBB API key
      const settings = await storage.getAdminSettings();
      const imgbbApiKey = settings?.imgbbApiKey || process.env.IMGBB_API_KEY;
      
      if (!imgbbApiKey) {
        return res.status(400).json({ message: "ImgBB API key chưa được cấu hình" });
      }
      
      const imgbb = new ImgBBService(imgbbApiKey);
      const imageUrl = await imgbb.uploadImage(image);
      
      res.json({ url: imageUrl });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "Lỗi tải ảnh lên" });
    }
  });

  // Document text extraction
  app.post("/api/documents/extract", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có file được tải lên" });
      }

      const file = req.file;
      let extractedText = "";

      switch (file.mimetype) {
        case 'application/pdf':
          try {
            // Use dynamic import to avoid module loading issues
            const pdf = await import('pdf-parse');
            const pdfParser = pdf.default || pdf;
            const pdfData = await pdfParser(file.buffer);
            extractedText = pdfData.text;
          } catch (error) {
            console.error("PDF parsing error:", error);
            return res.status(400).json({ message: "Không thể đọc file PDF. File có thể bị lỗi hoặc được bảo vệ." });
          }
          break;

        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          try {
            const docData = await mammoth.extractRawText({ buffer: file.buffer });
            extractedText = docData.value;
          } catch (error) {
            console.error("Word document parsing error:", error);
            return res.status(400).json({ message: "Không thể đọc file Word. File có thể bị lỗi." });
          }
          break;

        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const allSheetTexts: string[] = [];
            
            workbook.SheetNames.forEach(sheetName => {
              const worksheet = workbook.Sheets[sheetName];
              const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              const sheetText = sheetData.map((row: any) => 
                Array.isArray(row) ? row.join('\t') : String(row)
              ).join('\n');
              if (sheetText.trim()) {
                allSheetTexts.push(`--- Sheet: ${sheetName} ---\n${sheetText}`);
              }
            });
            
            extractedText = allSheetTexts.join('\n\n');
          } catch (error) {
            console.error("Excel parsing error:", error);
            return res.status(400).json({ message: "Không thể đọc file Excel. File có thể bị lỗi." });
          }
          break;

        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          // PowerPoint text extraction is more complex and may require additional libraries
          // For now, return a message indicating limited support
          return res.status(400).json({ 
            message: "Hiện tại chưa hỗ trợ đọc file PowerPoint. Vui lòng chuyển đổi sang format khác." 
          });

        case 'text/plain':
          extractedText = file.buffer.toString('utf-8');
          break;

        default:
          return res.status(400).json({ message: "Định dạng file không được hỗ trợ" });
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ message: "Không thể trích xuất nội dung từ file hoặc file rỗng" });
      }

      res.json({ 
        content: extractedText.trim(),
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
      });

    } catch (error) {
      console.error("Document extraction error:", error);
      res.status(500).json({ message: "Lỗi xử lý file tài liệu" });
    }
  });

  // Generate test
  app.post("/api/test/generate", async (req, res) => {
    try {
      const { subject, difficulty, questionType, questionCount, requirements } = req.body;
      
      // Get current AI settings
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        return res.status(400).json({ message: "OpenRouter API key chưa được cấu hình" });
      }
      
      // Determine which AI model to use
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      const aiModel = useGpt5 ? "openai/gpt-5" : "deepseek/deepseek-r1:free";
      
      const openRouter = new OpenRouterService(apiKey);
      const testData = await openRouter.generateTest(
        subject,
        difficulty,
        questionType,
        questionCount,
        requirements,
        aiModel
      );
      
      // Save generated test
      const test = await storage.createGeneratedTest({
        subject,
        difficulty,
        questionType,
        questionCount,
        requirements,
        questions: testData.questions,
        answers: testData.answers,
      });
      
      res.json({
        id: test.id,
        ...testData,
      });
    } catch (error) {
      console.error("Test generation error:", error);
      res.status(500).json({ message: "Lỗi sinh đề" });
    }
  });

  // Generate test from matrix images
  app.post("/api/test/generate-from-matrix", async (req, res) => {
    try {
      console.log("Matrix test generation request received");
      const { subject, matrixImages } = req.body;
      console.log(`Subject: ${subject}, Matrix images count: ${matrixImages?.length || 0}`);
      
      if (!subject || !matrixImages || !Array.isArray(matrixImages) || matrixImages.length === 0) {
        console.log("Missing subject or matrix images");
        return res.status(400).json({ message: "Thiếu thông tin môn học hoặc ảnh ma trận" });
      }
      
      // Get current AI settings
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        console.log("No API key found");
        return res.status(400).json({ message: "OpenRouter API key chưa được cấu hình" });
      }
      
      // Determine which AI model to use - prioritize vision-capable models for matrix generation
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      // For matrix generation, always use a vision-capable model
      const aiModel = useGpt5 ? "openai/gpt-4o" : "google/gemini-flash-1.5";
      console.log(`Using AI model for matrix generation: ${aiModel}`);
      
      const openRouter = new OpenRouterService(apiKey);
      const testData = await openRouter.generateTestFromMatrix(
        subject,
        matrixImages,
        aiModel
      );
      
      console.log(`Test data generated with ${testData.questions?.length || 0} questions`);
      
      // Validate test data before saving
      if (!testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0) {
        console.error("Invalid test data - no questions generated");
        return res.status(400).json({ message: "Không thể tạo câu hỏi từ ma trận. Vui lòng kiểm tra lại hình ảnh." });
      }

      // Save generated test
      const test = await storage.createGeneratedTest({
        subject,
        difficulty: "matrix-based",
        questionType: "matrix-generated",
        questionCount: testData.questions.length,
        requirements: "Sinh từ ma trận PDF",
        questions: testData.questions,
        answers: testData.answers || [],
      });
      
      console.log(`Test saved with ID: ${test.id}`);
      
      const response = {
        id: test.id,
        ...testData,
      };
      
      console.log("Sending response to client");
      res.json(response);
    } catch (error) {
      console.error("Matrix test generation error:", error);
      res.status(500).json({ message: "Lỗi sinh đề từ ma trận" });
    }
  });

  // Chat with AI
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }
      
      // Get current AI settings
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        return res.status(400).json({ message: "OpenRouter API key chưa được cấu hình" });
      }
      
      // Determine which AI model to use
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      const aiModel = useGpt5 ? "openai/gpt-5" : "deepseek/deepseek-r1:free";
      
      const openRouter = new OpenRouterService(apiKey);
      const response = await openRouter.chatWithAI(messages, aiModel);
      
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Lỗi chat với AI" });
    }
  });

  // Ask followup question
  app.post("/api/homework/:id/followup", async (req, res) => {
    try {
      const { id } = req.params;
      const { question } = req.body;
      
      const submission = await storage.getHomeworkSubmission(id);
      if (!submission) {
        return res.status(404).json({ message: "Không tìm thấy bài làm" });
      }

      // Get homework chat context for better responses
      const context = await storage.getHomeworkChatContext(id);
      if (!context) {
        return res.status(404).json({ message: "Không tìm thấy context bài làm" });
      }
      
      // Get current AI settings
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        return res.status(400).json({ message: "OpenRouter API key chưa được cấu hình" });
      }
      
      // Determine which AI model to use
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      const aiModel = useGpt5 ? "openai/gpt-5" : "deepseek/deepseek-r1:free";
      
      // Build comprehensive context for AI
      const previousQuestions = Array.isArray(context.questions) ? context.questions : [];
      const contextMessage = `
THÔNG TIN BÀI TẬP:
Môn học: ${context.subject}
Nội dung bài làm: ${context.homeworkContent}

PHÂN TÍCH TRƯỚC ĐÓ:
${JSON.stringify(context.analysis, null, 2)}

CÁC CÂU HỎI ĐÃ HỎI TRƯỚC:
${previousQuestions.map((q: any, i: number) => `${i + 1}. Câu hỏi: ${q.question}\n   Trả lời: ${q.answer}`).join('\n\n')}

CÂU HỎI MỚI:
${question}

Hãy trả lời câu hỏi mới dựa trên toàn bộ thông tin trên. Sử dụng LaTeX cho công thức toán ($$...$$) và giải thích chi tiết.`;
      
      const openRouter = new OpenRouterService(apiKey);
      const response = await openRouter.chatWithAI([
        {
          role: "system",
          content: "Bạn là giáo viên chuyên nghiệp. Trả lời câu hỏi học sinh dựa trên context bài tập đã cho. Sử dụng LaTeX cho công thức và giải thích chi tiết, dễ hiểu."
        },
        {
          role: "user",
          content: contextMessage
        }
      ], aiModel);

      // Save this Q&A to context for future reference
      await storage.addQuestionToHomeworkContext(id, question, response);
      
      res.json({ response });
    } catch (error) {
      console.error("Followup question error:", error);
      res.status(500).json({ message: "Lỗi trả lời câu hỏi" });
    }
  });

  // AI Chat endpoint with image support
  app.post('/api/ai/chat', chatUpload.single('image'), async (req, res) => {
    try {
      const { message } = req.body;
      const imageFile = req.file;

      console.log('Chat request:', { message, hasImage: !!imageFile, body: req.body });

      // Allow empty message if image is provided
      if ((!message || message.trim() === '') && !imageFile) {
        return res.status(400).json({ error: 'Message or image is required' });
      }

      // Get admin settings for AI service
      const settings = await storage.getAdminSettings();
      if (!settings) {
        return res.status(500).json({ error: 'Admin settings not configured' });
      }

      const openRouterService = new OpenRouterService(
        settings.openrouterApiKey!,
        settings.deepseekEnabled,
        settings.gpt5Enabled
      );

      let response;
      if (imageFile) {
        // Upload image to ImgBB first
        const imgbbService = new ImgBBService(settings.imgbbApiKey!);
        const imageBuffer = fs.readFileSync(imageFile.path);
        const base64Image = imageBuffer.toString('base64');
        
        const imageUrl = await imgbbService.uploadImage(base64Image);
        
        // Send message with image URL to AI
        response = await openRouterService.chatWithImageUrl(message || "Hãy mô tả hình ảnh này", imageUrl);

        // Clean up uploaded file
        fs.unlinkSync(imageFile.path);
      } else {
        // Send text-only message to AI
        response = await openRouterService.chat(message);
      }

      res.json({ response });
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ error: 'Failed to chat with AI' });
    }
  });

  // Export database
  app.get("/api/admin/export-database", async (req, res) => {
    try {
      // Export toàn bộ dữ liệu database thành SQL
      const exportData = await storage.exportAllData();
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `limva_database_${timestamp}.sql`;
      
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);
    } catch (error) {
      console.error("Database export error:", error);
      res.status(500).json({ error: "Không thể xuất database" });
    }
  });

  // Import database
  app.post("/api/admin/import-database", sqlUpload.single('sqlFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Vui lòng chọn file SQL" });
      }

      const sqlContent = req.file.buffer.toString('utf-8');
      await storage.importSqlData(sqlContent);
      
      res.json({ success: true, message: "Import database thành công" });
    } catch (error) {
      console.error("Database import error:", error);
      res.status(500).json({ error: "Không thể import database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

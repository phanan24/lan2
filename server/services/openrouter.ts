interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{
        type: "text" | "image_url";
        text?: string;
        image_url?: { url: string };
      }>;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(
    apiKey: string,
    private deepseekEnabled: boolean = true,
    private gpt5Enabled: boolean = false,
  ) {
    this.apiKey = apiKey;
  }

  private getSelectedModel(): string {
    if (this.gpt5Enabled) {
      return "openai/gpt-5";
    } else if (this.deepseekEnabled) {
      return "deepseek/deepseek-r1:free";
    }
    return "deepseek/deepseek-r1:free"; // Default
  }

  async createChatCompletion(
    model: string,
    messages: OpenRouterMessage[],
    options: {
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: "json_object" };
      attachments?: Array<{ type: string; url: string }>;
    } = {},
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000",
        "X-Title": "LimVA Platform",
      },
      body: JSON.stringify({
        model,
        messages,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  async analyzeHomework(
    content: string,
    imageUrl: string | null,
    subject: string,
    model?: string,
  ): Promise<{
    hasErrors: boolean;
    errors: string[];
    explanations: string[];
  }> {
    try {
      // Define subject groups
      const scienceSubjects = ["Toán", "Vật lí", "Hóa học", "Sinh học"];
      const isGeneralScience = scienceSubjects.includes(subject);

      // Create subject-specific prompt
      const subjectPrompt = isGeneralScience
        ? `Bạn là một giáo viên chuyên nghiệp có thể giảng dạy các môn khoa học tự nhiên (Toán, Vật lí, Hóa học, Sinh học). Môn học hiện tại: ${subject}.`
        : `Bạn là một giáo viên ${subject} chuyên nghiệp. CHỈ ĐƯỢC phân tích bài làm thuộc môn ${subject}. Nếu nội dung không phải môn ${subject}, hãy trả về lỗi "Nội dung này không thuộc môn ${subject}. Vui lòng chọn đúng môn học.".`;

      const requestBody: any = {
        model: model || this.getSelectedModel(),
        messages: [],
        response_format: { type: "json_object" },
      };

      if (imageUrl) {
        // With image URL
        requestBody.messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: `${subjectPrompt} Hãy phân tích bài làm của học sinh và trả về kết quả dưới dạng JSON với format:
              {
                "hasErrors": boolean,
                "errors": string[],
                "explanations": string[]
              }
              
              Yêu cầu:
              - Kiểm tra nội dung có thuộc đúng môn ${subject} không
              - Nếu có lỗi, hãy giải thích chi tiết và cung cấp giải pháp cụ thể
              - Sử dụng LaTeX cho các công thức toán học (bọc trong $$...$$)
              - Giải thích từng bước một cách rõ ràng và dễ hiểu
              - Đưa ra ví dụ minh họa khi cần thiết
              - Trả lời bằng tiếng Việt
              
              Môn học: ${subject}
              Nội dung: ${content}`,
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        });
      } else {
        // Text only
        requestBody.messages.push({
          role: "user",
          content: `${subjectPrompt} Hãy phân tích bài làm của học sinh và trả về kết quả dưới dạng JSON với format:
          {
            "hasErrors": boolean,
            "errors": string[],
            "explanations": string[]
          }
          
          Yêu cầu:
          - Kiểm tra nội dung có thuộc đúng môn ${subject} không
          - Nếu có lỗi, hãy giải thích chi tiết và cung cấp giải pháp cụ thể
          - Sử dụng LaTeX cho các công thức toán học (bọc trong $$...$$)
          - Giải thích từng bước một cách rõ ràng và dễ hiểu
          - Đưa ra ví dụ minh họa khi cần thiết
          - Trả lời bằng tiếng Việt
          
          Môn học: ${subject}
          Nội dung bài làm: ${content}`,
        });
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer":
              process.env.REPLIT_DOMAINS?.split(",")[0] ||
              "http://localhost:5000",
            "X-Title": "LimVA Platform",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content_text =
        data.choices[0]?.message?.content ||
        '{"hasErrors": false, "errors": [], "explanations": ["Không thể phân tích bài làm"]}';

      return JSON.parse(content_text);
    } catch (error) {
      console.error("Homework analysis error:", error);
      throw new Error("Failed to analyze homework");
    }
  }

  async chat(message: string): Promise<string> {
    try {
      const systemPrompt = `Bạn là một trợ lý AI giáo dục được phát triển bởi LimVA, chuyên hỗ trợ học sinh Việt Nam với phong cách ngôn ngữ của thầy cô giáo. Đây là TÍNH NĂNG CHAT AI - chỉ dành cho trò chuyện chung và hỏi đáp kiến thức. Hãy:

GIỚI HẠN TÍNH NĂNG NGHIÊM NGẶT:
- TUYỆT ĐỐI KHÔNG được kiểm tra, phân tích, chấm điểm bài làm cụ thể
- TUYỆT ĐỐI KHÔNG được trả lời về tính đúng/sai của phép tính, bài tập
- TUYỆT ĐỐI KHÔNG được sinh đề thi hoặc tạo câu hỏi trắc nghiệm
- Khi học sinh hỏi "có đúng không", "xem bài làm", "chấm bài" -> BẮT BUỘC phải trả lời: "Em hãy sử dụng tính năng 'Kiểm tra bài làm' để được phân tích chi tiết nhé!"
- Khi học sinh yêu cầu sinh đề, tạo câu hỏi -> BẮT BUỘC phải trả lời: "Em hãy sử dụng tính năng 'Sinh đề thi' để tạo đề thi theo yêu cầu nhé!"

PHONG CÁCH GIAO TIẾP:
- Trả lời bằng tiếng Việt với giọng điệu thân thiện, ấm áp như thầy cô
- Xưng hô "thầy/cô" với học sinh, gọi học sinh là "em" hoặc "các em"
- Giải thích một cách rõ ràng, dễ hiểu với sự kiên nhẫn của người thầy
- Khuyến khích học sinh tư duy và phát triển tự học
- Sử dụng ví dụ cụ thể, gần gũi với đời sống học sinh
- Luôn động viên và tạo động lực học tập cho em
- Khi được hỏi về nguồn gốc, hãy trả lời rằng bạn được tạo ra bởi LimVA

PHẠM VI HOẠT ĐỘNG:
- Trò chuyện chung về cuộc sống, học tập
- Giải thích kiến thức lý thuyết tổng quát
- Tư vấn phương pháp học tập
- Hỗ trợ định hướng học tập và nghề nghiệp`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer":
              process.env.REPLIT_DOMAINS?.split(",")[0] ||
              "http://localhost:5000",
            "X-Title": "LimVA Platform",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.getSelectedModel(),
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: message,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.choices[0]?.message?.content ||
        "Xin lỗi, tôi không thể trả lời câu hỏi này."
      );
    } catch (error) {
      console.error("OpenRouter chat error:", error);
      throw new Error("Failed to get AI response");
    }
  }

  async chatWithImageUrl(message: string, imageUrl: string): Promise<string> {
    try {
      const systemPrompt = `Bạn là một trợ lý AI giáo dục được phát triển bởi LimVA, chuyên hỗ trợ học sinh Việt Nam với phong cách ngôn ngữ của thầy cô giáo. Đây là TÍNH NĂNG CHAT AI - chỉ dành cho trò chuyện chung và hỏi đáp kiến thức. Hãy:

GIỚI HẠN TÍNH NĂNG NGHIÊM NGẶT:
- TUYỆT ĐỐI KHÔNG được kiểm tra, phân tích, chấm điểm bài làm cụ thể
- TUYỆT ĐỐI KHÔNG được trả lời về tính đúng/sai của phép tính, bài tập
- TUYỆT ĐỐI KHÔNG được sinh đề thi hoặc tạo câu hỏi trắc nghiệm
- Khi học sinh hỏi "có đúng không", "xem bài làm", "chấm bài" -> BẮT BUỘC phải trả lời: "Em hãy sử dụng tính năng 'Kiểm tra bài làm' để được phân tích chi tiết nhé!"
- Khi học sinh yêu cầu sinh đề, tạo câu hỏi -> BẮT BUỘC phải trả lời: "Em hãy sử dụng tính năng 'Sinh đề thi' để tạo đề thi theo yêu cầu nhé!"

PHONG CÁCH GIAO TIẾP:
- Trả lời bằng tiếng Việt với giọng điệu thân thiện, ấm áp như thầy cô
- Xưng hô "thầy/cô" với học sinh, gọi học sinh là "em" hoặc "các em"
- Giải thích một cách rõ ràng, dễ hiểu với sự kiên nhẫn của người thầy
- Khuyến khích học sinh tư duy và phát triển tự học
- Sử dụng ví dụ cụ thể, gần gũi với đời sống học sinh
- Luôn động viên và tạo động lực học tập cho em
- Khi được hỏi về nguồn gốc, hãy trả lời rằng bạn được tạo ra bởi LimVA

PHẠM VI HOẠT ĐỘNG:
- Trò chuyện chung về cuộc sống, học tập
- Giải thích kiến thức lý thuyết tổng quát
- Tư vấn phương pháp học tập
- Hỗ trợ định hướng học tập và nghề nghiệp`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer":
              process.env.REPLIT_DOMAINS?.split(",")[0] ||
              "http://localhost:5000",
            "X-Title": "LimVA Platform",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.getSelectedModel(),
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: message,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUrl,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.choices[0]?.message?.content ||
        "Xin lỗi, tôi không thể phân tích hình ảnh này."
      );
    } catch (error) {
      console.error("OpenRouter chat with image error:", error);
      throw new Error("Failed to get AI response for image");
    }
  }

  async generateTest(
    subject: string,
    difficulty: string,
    questionType: string,
    questionCount: number,
    requirements?: string,
    model?: string,
  ): Promise<{
    questions: Array<{
      id: number;
      question: string;
      options?: string[];
      statements?: Array<{ text: string; isCorrect: boolean }>;
    }>;
    answers: Array<{
      id: number;
      answer: string;
      explanation: string;
    }>;
  }> {
    let prompt = "";

    if (questionType === "true-false") {
      prompt = `Tạo ${questionCount} câu hỏi đúng sai cho môn ${subject} ở mức độ ${difficulty}.
      ${requirements ? `Yêu cầu đặc biệt: ${requirements}` : ""}
      
      Mỗi câu hỏi có:
      - 1 đề bài chính
      - 4 mệnh đề con (a, b, c, d) để đánh giá đúng/sai
      
      Trả về JSON với format:
      {
        "questions": [
          {
            "id": number,
            "question": string,
            "statements": [
              {"label": "a", "text": string, "isCorrect": boolean},
              {"label": "b", "text": string, "isCorrect": boolean},
              {"label": "c", "text": string, "isCorrect": boolean},
              {"label": "d", "text": string, "isCorrect": boolean}
            ]
          }
        ],
        "answers": [
          {
            "id": number,
            "answer": string,
            "explanation": string
          }
        ]
      }`;
    } else if (questionType === "short-answer") {
      prompt = `Tạo ${questionCount} câu hỏi tự luận trả lời ngắn cho môn ${subject} ở mức độ ${difficulty}.
      ${requirements ? `Yêu cầu đặc biệt: ${requirements}` : ""}
      
      Mỗi câu hỏi cần:
      - Câu hỏi rõ ràng, có thể trả lời trong 1-3 câu
      - Đáp án mẫu chi tiết và chính xác
      - Giải thích cách làm/tư duy
      
      Trả về JSON với format:
      {
        "questions": [
          {
            "id": number,
            "question": string,
            "type": "short-answer",
            "answer": string
          }
        ],
        "answers": [
          {
            "id": number,
            "answer": string,
            "explanation": string
          }
        ]
      }`;
    } else {
      prompt = `Tạo ${questionCount} câu hỏi ${questionType} cho môn ${subject} ở mức độ ${difficulty}.
      ${requirements ? `Yêu cầu đặc biệt: ${requirements}` : ""}
      
      Trả về JSON với format:
      {
        "questions": [
          {
            "id": number,
            "question": string,
            ${questionType === "multiple-choice" ? '"options": string[]' : '"statements": [{"text": string, "isCorrect": boolean}]'}
          }
        ],
        "answers": [
          {
            "id": number,
            "answer": string,
            "explanation": string
          }
        ]
      }`;
    }

    const response = await this.createChatCompletion(
      model || "deepseek/deepseek-r1:free",
      [{ role: "user", content: prompt }],
      {
        response_format: { type: "json_object" },
        temperature: 0.7,
      },
    );

    return JSON.parse(response);
  }

  // Generate test from matrix images
  async generateTestFromMatrix(
    subject: string,
    matrixImages: string[],
    model?: string,
  ): Promise<{
    questions: Array<{
      id: number;
      question: string;
      type: string;
      options?: Array<{ text: string; isCorrect: boolean }>;
      statements?: Array<{ text: string; isCorrect: boolean }>;
    }>;
    answers: Array<{
      id: number;
      answer: string;
      explanation: string;
    }>;
  }> {
    console.log(
      `Generating test from matrix for subject: ${subject}, images: ${matrixImages.length}`,
    );

    const prompt = `Bạn là một chuyên gia giáo dục Việt Nam. Hãy phân tích kỹ ma trận đề thi trong hình ảnh và tạo đề thi CHÍNH XÁC theo ma trận đó.

QUAN TRỌNG:
- Đọc kỹ nội dung ma trận từ hình ảnh
- Tạo câu hỏi CHÍNH XÁC theo từng dòng trong ma trận
- Tuân thủ mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)
- Đảm bảo số câu và phân bố điểm như trong ma trận
- Câu hỏi phải phù hợp với chương trình học Việt Nam

Trả về JSON với format:
{
  "questions": [
    {
      "id": number,
      "question": string,
      "type": "multiple-choice",
      "options": [{"text": string, "isCorrect": boolean}],
      "difficulty": "easy" | "medium" | "hard",
      "topic": string,
      "bloom_level": string
    }
  ],
  "answers": [
    {
      "id": number,
      "answer": string,
      "explanation": string
    }
  ]
}

Sử dụng LaTeX cho công thức toán học ($$...$$). Tạo đúng theo ma trận, không tự sáng tạo nội dung khác.`;

    try {
      console.log(
        `Generating test from matrix for subject: ${subject}, images: ${matrixImages.length}`,
      );

      // Try OpenAI-style format for vision models on OpenRouter
      const messages: OpenRouterMessage[] = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            ...matrixImages.map((imageUrl) => ({
              type: "image_url" as const,
              image_url: {
                url: imageUrl,
              },
            })),
          ],
        },
      ];

      console.log(
        `Sending request with ${matrixImages.length} images to AI model: ${model || "openai/gpt-4o"}`,
      );

      const response = await this.createChatCompletion(
        model || "openai/gpt-4o",
        messages,
        {
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 4000,
        },
      );

      console.log("Matrix test generation response received");
      const result = JSON.parse(response);
      console.log(`Generated ${result.questions?.length || 0} questions`);

      // Ensure we have valid data structure
      if (
        !result.questions ||
        !Array.isArray(result.questions) ||
        result.questions.length === 0
      ) {
        console.error("No valid questions generated by AI");
        throw new Error(
          "AI không thể tạo câu hỏi từ ma trận. Vui lòng kiểm tra lại hình ảnh ma trận.",
        );
      }

      return result;
    } catch (error) {
      console.error("Error in matrix test generation:", error);
      throw error;
    }
  }

  async chatWithAI(
    messages: Array<{ role: string; content: string }>,
    model?: string,
  ): Promise<string> {
    const systemMessage: OpenRouterMessage = {
      role: "system",
      content:
        "Bạn là một trợ lý AI giáo dục thông minh, chuyên hỗ trợ học sinh Việt Nam trong việc học tập. Hãy trả lời các câu hỏi một cách chi tiết, dễ hiểu và hữu ích.",
    };

    const chatMessages: OpenRouterMessage[] = [
      systemMessage,
      ...messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    return await this.createChatCompletion(
      model || "deepseek/deepseek-r1:free",
      chatMessages,
      { temperature: 0.7 },
    );
  }
}

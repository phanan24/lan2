export class ImgBBService {
  private apiKey: string;

  constructor(apiKey: string = process.env.IMGBB_API_KEY || "fallback_key") {
    this.apiKey = apiKey;
  }

  async uploadImage(base64Image: string): Promise<string> {
    const formData = new FormData();
    formData.append("key", this.apiKey);
    formData.append("image", base64Image);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error("ImgBB upload failed: " + data.error?.message);
    }

    return data.data.url;
  }
}

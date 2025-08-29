import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SimpleDocumentReader() {
  useEffect(() => {
    // Set up PDF.js worker
    if ((window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const fileInput = document.getElementById("file") as HTMLInputElement;
    const viewer = document.getElementById("viewer") as HTMLDivElement;

    if (!fileInput || !viewer) return;

    const handleFileChange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      viewer.innerHTML = "<p class='text-center text-gray-500'>Đang xử lý file...</p>";

      const ext = file.name.split(".").pop()?.toLowerCase();

      try {
        if (ext === "pdf") {
          const buf = await file.arrayBuffer();
          const pdf = await (window as any).pdfjsLib.getDocument({ data: buf }).promise;
          viewer.innerHTML = "";
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.2 });
            const canvas = document.createElement("canvas");
            canvas.style.display = "block";
            canvas.style.margin = "10px auto";
            canvas.style.border = "1px solid #ccc";
            canvas.className = "max-w-full h-auto";
            viewer.appendChild(canvas);
            const ctx = canvas.getContext("2d");
            if (ctx) {
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({ canvasContext: ctx, viewport }).promise;
            }
          }
        } else if (ext === "docx") {
          const buf = await file.arrayBuffer();
          const result = await (window as any).mammoth.convertToHtml({ arrayBuffer: buf });
          viewer.innerHTML = `<div class="prose prose-sm max-w-none">${result.value}</div>`;
        } else if (ext === "txt") {
          const text = await file.text();
          viewer.innerHTML = `<pre class="bg-gray-100 p-4 rounded whitespace-pre-wrap">${text}</pre>`;
        } else {
          viewer.innerHTML = "<p class='text-red-500 text-center'>Định dạng không hỗ trợ!</p>";
        }
      } catch (error) {
        console.error("Error processing file:", error);
        viewer.innerHTML = "<p class='text-red-500 text-center'>Lỗi xử lý file. Vui lòng thử lại.</p>";
      }
    };

    fileInput.addEventListener("change", handleFileChange);

    return () => {
      fileInput.removeEventListener("change", handleFileChange);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-file-text mr-2 text-blue-600"></i>
          Trình đọc file PDF / DOCX / TXT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <input 
            type="file" 
            id="file" 
            accept=".pdf,.docx,.txt"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            data-testid="input-simple-file"
          />
          
          <div 
            id="viewer" 
            className="min-h-[400px] max-h-[600px] overflow-auto border rounded-lg p-4 bg-gray-50"
          >
            <p className="text-gray-500 text-center">Chọn file PDF, DOCX hoặc TXT để xem</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
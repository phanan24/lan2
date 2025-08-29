import { useState, useEffect } from "react";
import QRCode from "qrcode";
import zaloLogo from "@assets/image_1756289335487.png";

export default function AskQuestions() {
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const zaloGroupLink = "https://zalo.me/g/qqvvdq118"; // Link nhóm Zalo

  useEffect(() => {
    if (showQR) {
      QRCode.toDataURL(zaloGroupLink, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      }).then(url => {
        setQrCodeUrl(url);
      }).catch(err => {
        console.error("Error generating QR code:", err);
      });
    }
  }, [showQR]);

  const handleJoinZalo = () => {
    if (!showQR) {
      setShowQR(true);
    } else {
      window.open(zaloGroupLink, "_blank");
    }
  };

  const handleBackToMain = () => {
    setShowQR(false);
  };

  if (showQR) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <img src={zaloLogo} alt="Zalo" className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tham gia nhóm Zalo</h2>
        
        <div className="flex items-start justify-center gap-8 mb-8">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code tham gia nhóm Zalo" 
                  className="w-48 h-48"
                  data-testid="qr-code-image"
                />
              </div>
            )}
            <button
              onClick={handleJoinZalo}
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
              data-testid="button-join-link"
            >
              <img src={zaloLogo} alt="Zalo" className="w-5 h-5 mr-2" />
              Tham gia nhóm
            </button>
          </div>
          
          {/* Note */}
          <div className="flex flex-col justify-center text-left max-w-xs">
            <p className="text-gray-600 text-sm leading-relaxed">
              Có thể quét mã QR hoặc nhấn vào link để tham gia
            </p>
          </div>
        </div>

        <button
          onClick={handleBackToMain}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          data-testid="button-back"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <img src={zaloLogo} alt="Zalo" className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Hỏi bài trực tiếp</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Tham gia nhóm Zalo để được hỗ trợ giải đáp bài tập và kết nối với bạn bè trên toàn quốc
      </p>
      <button
        onClick={handleJoinZalo}
        className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
        data-testid="button-join-zalo"
      >
        <img src={zaloLogo} alt="Zalo" className="w-5 h-5 mr-2" />
        Tham gia nhóm Zalo
      </button>
    </div>
  );
}

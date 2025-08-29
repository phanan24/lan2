import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PeriodicTable3DProps {
  onBack: () => void;
}

export default function PeriodicTable3D({ onBack }: PeriodicTable3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create iframe to load the 3D periodic table
    const iframe = document.createElement('iframe');
    iframe.src = '/periodic-table-3d.html';
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    
    if (containerRef.current) {
      containerRef.current.appendChild(iframe);
    }

    return () => {
      if (containerRef.current && iframe.parentNode) {
        containerRef.current.removeChild(iframe);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="mr-4"
            data-testid="button-back-from-3d-table"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-white">
            Bảng Tuần Hoàn Hóa Học 3D
          </h1>
        </div>
        
        <div 
          ref={containerRef}
          className="w-full bg-black rounded-lg overflow-hidden shadow-2xl"
          style={{ height: 'calc(100vh - 140px)' }}
          data-testid="container-3d-table"
        />
      </div>
    </div>
  );
}
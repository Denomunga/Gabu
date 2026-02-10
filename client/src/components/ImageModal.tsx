import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, alt = "Full size image" }: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => prev + 90);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Close button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
        <Button
          onClick={handleZoomOut}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        
        <span className="text-white text-sm px-2 min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <Button
          onClick={handleZoomIn}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          disabled={scale >= 3}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        
        <div className="w-px h-6 bg-white/30 mx-1" />
        
        <Button
          onClick={handleRotate}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <RotateCw className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 text-xs px-2"
        >
          Reset
        </Button>
      </div>

      {/* Image container */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] overflow-hidden cursor-move"
        onDoubleClick={handleReset}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-full object-contain transition-transform duration-300 ease-in-out select-none"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
          draggable={false}
        />
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}

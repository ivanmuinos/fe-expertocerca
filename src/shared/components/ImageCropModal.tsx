"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/shared/components/ui/dialog";
import { Button } from "@/src/shared/components/ui/button";
import { Slider } from "@/src/shared/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface ImageCropModalProps {
  open: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number; // 1 para cuadrado (avatar)
}

export function ImageCropModal({
  open,
  onClose,
  imageFile,
  onCropComplete,
  aspectRatio = 1,
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [zoom, setZoom] = useState(0.8);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image when file changes
  useEffect(() => {
    if (imageFile && open) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        // Reset crop and zoom when new image loads
        setCrop({ x: 0, y: 0 });
        setZoom(0.8); // Start with zoom out for better initial view
        setRotation(0);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImageSrc("");
    }
  }, [imageFile, open]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCrop({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - crop.x, y: touch.clientY - crop.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setCrop({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const getCroppedImage = useCallback(async (): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!imageRef.current || !containerRef.current) {
        reject(new Error("Image not loaded"));
        return;
      }

      const image = imageRef.current;
      const container = containerRef.current;
      
      // Create canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Get dimensions
      const containerRect = container.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      
      // Crop circle size (80% of container)
      const cropSize = Math.min(containerRect.width, containerRect.height) * 0.8;
      
      // Scale factor between displayed image and natural image
      const scale = image.naturalWidth / imageRect.width;
      
      // Center of container
      const containerCenterX = containerRect.width / 2;
      const containerCenterY = containerRect.height / 2;
      
      // Center of crop circle in container coordinates
      const cropCenterX = containerCenterX;
      const cropCenterY = containerCenterY;
      
      // Image position in container (accounting for transform)
      const imageCenterX = containerCenterX + crop.x;
      const imageCenterY = containerCenterY + crop.y;
      
      // Distance from crop center to image center (in displayed pixels)
      const offsetX = cropCenterX - imageCenterX;
      const offsetY = cropCenterY - imageCenterY;
      
      // Convert to natural image coordinates
      const naturalOffsetX = (offsetX * scale) / zoom;
      const naturalOffsetY = (offsetY * scale) / zoom;
      
      // Crop size in natural image coordinates
      const naturalCropSize = (cropSize * scale) / zoom;
      
      // Crop position in natural image (center - half size)
      const naturalCropX = (image.naturalWidth / 2) + naturalOffsetX - (naturalCropSize / 2);
      const naturalCropY = (image.naturalHeight / 2) + naturalOffsetY - (naturalCropSize / 2);

      // Set canvas size (output size)
      const outputSize = 512;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Save context state
      ctx.save();

      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.translate(outputSize / 2, outputSize / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-outputSize / 2, -outputSize / 2);
      }

      // Draw cropped image
      ctx.drawImage(
        image,
        naturalCropX,
        naturalCropY,
        naturalCropSize,
        naturalCropSize,
        0,
        0,
        outputSize,
        outputSize
      );

      // Restore context
      ctx.restore();

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not create blob"));
            return;
          }

          const file = new File([blob], `avatar_${Date.now()}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve(file);
        },
        "image/jpeg",
        0.85 // Quality
      );
    });
  }, [crop, zoom, rotation]);

  const handleCrop = async () => {
    try {
      const croppedFile = await getCroppedImage();
      onCropComplete(croppedFile);
      onClose();
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajustar foto de perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Crop Area */}
          <div
            ref={containerRef}
            className="relative w-full aspect-square bg-black rounded-lg overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {imageSrc && (
              <>
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(calc(-50% + ${crop.x}px), calc(-50% + ${crop.y}px)) scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: "center",
                    maxWidth: "none",
                    maxHeight: "none",
                    width: "100%",
                    height: "auto",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                  draggable={false}
                />
                
                {/* Crop overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-black/50" />
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full"
                    style={{
                      width: "80%",
                      height: "80%",
                      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Zoom</label>
                <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Rotate */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Rotar</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                90°
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCrop}>
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

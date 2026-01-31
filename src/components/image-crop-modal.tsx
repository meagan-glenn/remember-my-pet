"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropModalProps {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

function getCroppedImg(
  image: HTMLImageElement,
  pixelCrop: PixelCrop
): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width * scaleX;
  canvas.height = pixelCrop.height * scaleY;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.95);
  });
}

export function ImageCropModal({
  imageSrc,
  open,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Default crop: full image
    setCrop({ unit: "px", x: 0, y: 0, width, height });
  }, []);

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    const blob = await getCroppedImg(imgRef.current, completedCrop);
    const file = new File([blob], "cropped-photo.jpg", { type: "image/jpeg" });
    onCropComplete(file);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col max-h-[95vh]">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>Crop photo</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-gray-100 p-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              style={{ maxHeight: "70vh", maxWidth: "100%" }}
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-2 p-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleConfirm}
          >
            Crop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

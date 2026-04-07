import React, { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { storage } from '../services/firebaseStorage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ImageUploadProps {
  onUploadSuccess: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSizeKB?: number;
  userId: string;
  context: 'product' | 'shop' | 'profile'; // Determines storage path
}

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  uploading?: boolean;
  error?: string;
}

/**
 * Image Upload Component
 * Handles product/shop image uploads with client-side compression and progress tracking
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
  maxSizeKB = 5000, // 5MB default
  userId,
  context,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  /**
   * Compress image client-side for bandwidth optimization (especially for Nigeria mobile users)
   */
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down if too large
          const maxDimension = 1200;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP for better compression (fallback to JPEG)
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to compress image'));
            },
            'image/webp',
            0.8
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  /**
   * Upload single image to Firebase Storage
   */
  const uploadImageToStorage = async (
    compressedBlob: Blob,
    originalFile: File,
    uploadedImageId: string
  ): Promise<string> => {
    const timestamp = Date.now();
    const filename = `${timestamp}_${originalFile.name}`;

    // Determine storage path based on context
    const storagePath = `${context}/${userId}/${filename}`;
    const fileRef = ref(storage, storagePath);

    // Upload compressed blob
    await uploadBytes(fileRef, compressedBlob, {
      contentType: 'image/webp',
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    });

    // Get download URL
    const downloadUrl = await getDownloadURL(fileRef);

    return downloadUrl;
  };

  /**
   * Handle file selection and upload
   */
  const handleFileSelect = async (files: File[]) => {
    setGlobalError(null);

    // Validate file count
    if (uploadedImages.length + files.length > maxFiles) {
      const error = `Maximum ${maxFiles} images allowed`;
      setGlobalError(error);
      onUploadError?.(error);
      return;
    }

    // Process each file
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const error = `${file.name} is not an image`;
        setGlobalError(error);
        onUploadError?.(error);
        continue;
      }

      // Validate file size
      if (file.size > maxSizeKB * 1024) {
        const error = `${file.name} exceeds ${maxSizeKB}KB limit`;
        setGlobalError(error);
        onUploadError?.(error);
        continue;
      }

      // Create upload record
      const uploadId = `${Date.now()}_${Math.random()}`;
      const newImage: UploadedImage = {
        id: uploadId,
        url: URL.createObjectURL(file),
        file,
        uploading: true,
      };

      setUploadedImages((prev) => [...prev, newImage]);

      // Upload in background
      try {
        const compressedBlob = await compressImage(file);
        const downloadUrl = await uploadImageToStorage(
          compressedBlob,
          file,
          uploadId
        );

        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === uploadId
              ? { ...img, url: downloadUrl, uploading: false, error: undefined }
              : img
          )
        );

        // Trigger callback if all images are uploaded
        const allImages = uploadedImages.filter((i) => i.id !== uploadId);
        const completedImages = allImages.filter((i) => !i.uploading && !i.error);
        if (allImages.length + 1 === completedImages.length + 1) {
          // All completed
          const urls = [
            ...completedImages.map((i) => i.url),
            downloadUrl,
          ];
          onUploadSuccess(urls);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        console.error('Upload error:', error);
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === uploadId
              ? { ...img, uploading: false, error: errorMessage }
              : img
          )
        );
        setGlobalError(errorMessage);
        onUploadError?.(errorMessage);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelect(files);
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const getRemainingSlots = () => maxFiles - uploadedImages.length;

  return (
    <div className="space-y-4">
      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {globalError}
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragging
              ? 'border-[#F44307] bg-[#F44307]/5'
              : 'border-gray-300 hover:border-[#F44307]'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <PhotoIcon className="w-12 h-12 text-gray-400" />
          <h3 className="font-semibold text-gray-700">
            {uploadedImages.length === 0
              ? 'Upload Product Images'
              : `${getRemainingSlots()} slot${getRemainingSlots() !== 1 ? 's' : ''} remaining`}
          </h3>
          <p className="text-sm text-gray-500">
            Drag & drop images here or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Max {maxFiles} images • Up to {maxSizeKB}KB each • JPG, PNG, WebP
          </p>
        </div>
      </div>

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden bg-gray-50 aspect-square"
            >
              <img
                src={image.url}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />

              {/* Upload Progress/Status */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {image.error && (
                <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center p-2">
                  <p className="text-white text-xs text-center">{image.error}</p>
                </div>
              )}

              {!image.uploading && !image.error && (
                <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-1 left-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <XMarkIcon className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <p className="text-xs text-gray-500">
        📱 Images are automatically optimized for mobile users in Nigeria
      </p>
    </div>
  );
};

export default ImageUpload;

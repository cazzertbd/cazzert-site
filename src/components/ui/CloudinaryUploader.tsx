import { useCallback, useState } from "react";
import { MdCloudUpload } from "react-icons/md";

interface CloudinaryUploaderProps {
  onUpload: (results: string[]) => void;
  onError?: (error: any) => void;
  maxFiles?: number;
  disabled?: boolean;
  folder?: string;
  tags?: string[];
}

export function CloudinaryUploader({
  onUpload,
  onError,
  maxFiles = 5,
  disabled = false,
  folder,
  tags = [],
}: CloudinaryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      const filesToUpload = files.slice(0, maxFiles);
      setIsUploading(true);
      setUploadProgress(new Array(filesToUpload.length).fill(0));

      try {
        const uploadPromises = filesToUpload.map(async (file, index) => {
          // Validate file
          if (!file.type.startsWith("image/")) {
            throw new Error("File must be an image");
          }

          if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size must be less than 5MB");
          }

          const formData = new FormData();
          formData.append("file", file);

          if (folder) {
            formData.append("folder", folder);
          }

          if (tags && tags.length > 0) {
            formData.append("tags", tags.join(","));
          }

          const response = await fetch("/api/cloudinary/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Upload failed");
          }

          const data = await response.json();

          // Update progress
          setUploadProgress((prev) => {
            const newProgress = [...prev];
            newProgress[index] = 100;
            return newProgress;
          });

          return data.secure_url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        onUpload(uploadedUrls);
      } catch (error) {
        console.error("Upload error:", error);
        onError?.(error);
      } finally {
        setIsUploading(false);
        setUploadProgress([]);
        event.target.value = "";
      }
    },
    [folder, tags, maxFiles, onUpload, onError],
  );

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-all duration-200 ${
          disabled || isUploading
            ? "border-border/20 bg-bg-alt/50 cursor-not-allowed opacity-50"
            : "border-border/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />

        <div className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <MdCloudUpload
              className={`text-text-muted h-12 w-12 ${
                isUploading ? "animate-pulse" : ""
              }`}
            />
            <div>
              <p className="text-text-base mb-1 font-medium">
                {disabled
                  ? "Upload disabled"
                  : isUploading
                    ? "Uploading..."
                    : "Upload Images"}
              </p>
              <p className="text-text-muted text-sm">
                {isUploading
                  ? "Processing images..."
                  : "Click to select files or drag and drop"}
              </p>
              <p className="text-text-subtle mt-2 text-xs">
                Max {maxFiles} images • Up to 5MB each • JPG, PNG, GIF, WebP
              </p>
              {folder && (
                <p className="text-text-subtle mt-1 text-xs">📁 {folder}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress.length > 0 && (
        <div className="space-y-2">
          <p className="text-text-base text-sm font-medium">
            Uploading {uploadProgress.length} file(s)...
          </p>
          {uploadProgress.map((progress, index) => (
            <div key={index} className="space-y-1">
              <div className="text-text-muted flex justify-between text-xs">
                <span>File {index + 1}</span>
                <span>{progress}%</span>
              </div>
              <div className="bg-bg-alt h-2 w-full rounded-full">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

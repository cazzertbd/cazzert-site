import { MdDelete, MdImage } from "react-icons/md";

interface ImageGalleryProps {
  images: string[];
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function ImageGallery({
  images,
  onRemoveImage,
  disabled = false,
  maxImages = 5,
}: ImageGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-text-muted text-xs">
        Current Images ({images.length}/{maxImages}):
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((imageUrl, index) => (
          <div key={index} className="group relative">
            <img
              src={imageUrl}
              alt={`Product ${index + 1}`}
              className="border-border/20 h-24 w-full rounded border object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              disabled={disabled}
              className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-red-700 disabled:opacity-50"
            >
              <MdDelete className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImageGalleryPlaceholder({ message }: { message: string }) {
  return (
    <div className="border-border/20 bg-bg-alt rounded-lg border p-4 text-center">
      <MdImage className="text-text-muted mx-auto mb-2 h-6 w-6" />
      <p className="text-text-muted text-sm">{message}</p>
    </div>
  );
}

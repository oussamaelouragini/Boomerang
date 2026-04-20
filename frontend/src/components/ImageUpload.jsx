import { useRef } from "react";

export default function ImageUpload({ images, onChange, maxImages = 3 }) {
  const inputRef = useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const total = [...images, ...files].slice(0, maxImages);
    onChange(total);
    inputRef.current.value = "";
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
            <img
              src={img instanceof File ? URL.createObjectURL(img) : `${import.meta.env.VITE_API_URL?.replace("/api", "")}${img}`}
              alt={`Upload ${i + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white"
            >
              x
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary"
          >
            <span className="text-2xl">+</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} className="hidden" />
      <p className="mt-1 text-xs text-muted">{images.length}/{maxImages} images (JPEG, PNG, WebP)</p>
    </div>
  );
}

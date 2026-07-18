"use client";
import { useRef, useState } from "react";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (base64: string | null) => void;
  size?: number;
}

export default function ImageUploader({ value, onChange, size = 140 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        <div style={{ position: "relative", width: size, height: size }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              borderRadius: 12, border: "1px solid #e2e8f0",
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: "absolute", top: -6, right: -6,
              width: 24, height: 24, borderRadius: "50%",
              background: "#dc2626", color: "#fff",
              border: "2px solid #fff",
              fontSize: 14, fontWeight: 700,
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            width: size, height: size,
            border: `2px dashed ${dragOver ? "#2563eb" : "#cbd5e1"}`,
            borderRadius: 12,
            background: dragOver ? "#eff6ff" : "#f8fafc",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", gap: 6,
            transition: "all 0.15s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#94a3b8" }}>
            add_a_photo
          </span>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textAlign: "center" }}>
            Arrastra o haz clic
          </span>
        </div>
      )}
    </div>
  );
}

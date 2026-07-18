"use client";
import { useState, useRef, useEffect } from "react";

interface ModalOverlayProps {
  open: boolean;
  title: string;
  placeholder: string;
  confirmLabel?: string;
  onConfirm: (value: string) => Promise<void>;
  onClose: () => void;
}

export default function ModalOverlay({ open, title, placeholder, confirmLabel = "Crear", onConfirm, onClose }: ModalOverlayProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("No puede estar vacío");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onConfirm(trimmed);
      onClose();
    } catch (e: any) {
      setError(e.message || "Error al crear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 14, padding: "28px 28px 22px",
          width: 380, maxWidth: "92vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.08)",
          animation: "modalIn 0.18s ease-out",
        }}
      >
        <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          {title}
        </h3>
        <input
          ref={inputRef}
          value={value}
          onChange={e => { setValue(e.target.value); setError(""); }}
          onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={placeholder}
          style={{
            width: "100%", border: "1px solid #e2e8f0", borderRadius: 10,
            padding: "10px 14px", fontSize: 14, color: "#0f172a",
            outline: "none", boxSizing: "border-box",
            borderColor: error ? "#ef4444" : undefined,
          }}
        />
        {error && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444" }}>{error}</p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0",
              background: "#fff", fontSize: 13, fontWeight: 600, color: "#334155",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none",
              background: loading ? "#93c5fd" : "#2563eb",
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}
          >
            {loading ? "Creando..." : confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

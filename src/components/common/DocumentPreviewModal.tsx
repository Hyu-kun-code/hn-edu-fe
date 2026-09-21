import { useEffect } from "react";
import "./DocumentPreviewModal.css";

interface DocumentPreviewModalProps {
  title: string;
  kind: "IMAGE" | "PDF";
  blobUrl: string;
  onClose: () => void;
}

export function DocumentPreviewModal({ title, kind, blobUrl, onClose }: DocumentPreviewModalProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="doc-preview-backdrop" onClick={onClose}>
      <div className="doc-preview-panel" onClick={(e) => e.stopPropagation()}>
        <div className="doc-preview-header">
          <span className="doc-preview-title">{title}</span>
          <button type="button" className="doc-preview-close" onClick={onClose} aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="doc-preview-body">
          {kind === "IMAGE" ? (
            <img src={blobUrl} alt={title} className="doc-preview-image" />
          ) : (
            <iframe src={blobUrl} title={title} className="doc-preview-pdf" />
          )}
        </div>
      </div>
    </div>
  );
}

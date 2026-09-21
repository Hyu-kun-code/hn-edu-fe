import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { documentService } from "../../services/documentService";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { LoadingIndicator } from "./LoadingIndicator";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import type { CourseDocument, DocumentFileType } from "../../types/document.types";
import { formatDateTime } from "../../utils/format";
import { toYoutubeEmbedUrl } from "../../utils/youtube";
import "./DocumentList.css";

interface DocumentListProps {
  classId?: number;
  scheduleId?: number;
  canManage: boolean;
}

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

const FILE_TYPE_LABEL: Record<DocumentFileType, string> = {
  PDF: "PDF",
  IMAGE: "Ảnh",
  MP3: "Audio",
  VIDEO_LINK: "Video",
};

function AudioPlayerItem({ id }: { id: number }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    documentService
      .downloadBlob(id)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được file âm thanh.");
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  if (error) return <p className="form-error">{error}</p>;
  if (!blobUrl) return <LoadingIndicator label="Đang tải âm thanh..." />;
  return <audio controls className="doc-audio-player" src={blobUrl} />;
}

export function DocumentList({ classId, scheduleId, canManage }: DocumentListProps) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [documents, setDocuments] = useState<CourseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [linkForm, setLinkForm] = useState({ fileName: "", url: "" });
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [preview, setPreview] = useState<{ title: string; kind: "IMAGE" | "PDF"; blobUrl: string } | null>(
    null,
  );
  const [previewLoadingId, setPreviewLoadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const data =
        classId !== undefined
          ? await documentService.getByClass(classId)
          : await documentService.getBySchedule(scheduleId as number);
      setDocuments(data);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được học liệu. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  }, [classId, scheduleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setActionError(null);
    setIsUploading(true);
    try {
      if (classId !== undefined) await documentService.uploadForClass(classId, file);
      else await documentService.uploadForSchedule(scheduleId as number, file);
      await loadData();
      showToast("Đã tải học liệu lên thành công.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Tải học liệu lên thất bại. Vui lòng thử lại."));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAddLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionError(null);
    setIsAddingLink(true);
    try {
      const payload = { fileName: linkForm.fileName, url: linkForm.url };
      if (classId !== undefined) await documentService.addVideoLinkForClass(classId, payload);
      else await documentService.addVideoLinkForSchedule(scheduleId as number, payload);
      setLinkForm({ fileName: "", url: "" });
      await loadData();
      showToast("Đã thêm link video.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Thêm link video thất bại. Vui lòng thử lại."));
    } finally {
      setIsAddingLink(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      message: "Xoá học liệu này? Hành động không thể hoàn tác.",
      confirmText: "Xoá",
      danger: true,
    });
    if (!ok) return;
    setActionError(null);
    setPendingDeleteId(id);
    try {
      await documentService.deleteDocument(id);
      await loadData();
      showToast("Đã xoá học liệu.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Xoá học liệu thất bại. Vui lòng thử lại."));
    } finally {
      setPendingDeleteId(null);
    }
  }

  async function openPreview(doc: CourseDocument) {
    setActionError(null);
    setPreviewLoadingId(doc.id);
    try {
      const blob = await documentService.downloadBlob(doc.id);
      const blobUrl = URL.createObjectURL(blob);
      setPreview({ title: doc.fileName, kind: doc.fileType === "PDF" ? "PDF" : "IMAGE", blobUrl });
    } catch (err) {
      setActionError(getErrorMessage(err, "Không mở được học liệu. Vui lòng thử lại."));
    } finally {
      setPreviewLoadingId(null);
    }
  }

  function closePreview() {
    if (preview) URL.revokeObjectURL(preview.blobUrl);
    setPreview(null);
  }

  if (isLoading) return <LoadingIndicator />;

  return (
    <div className="doc-list">
      {loadError && (
        <div className="form-error" role="alert">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="form-error" role="alert">
          {actionError}
        </div>
      )}

      {canManage && (
        <div className="doc-list-manage">
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? "Đang tải lên..." : "+ Tải file (PDF/Ảnh/MP3)"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*,audio/mpeg,.mp3"
              hidden
              onChange={handleFileChange}
            />
          </div>
          <form className="doc-link-form" onSubmit={handleAddLink}>
            <input
              type="text"
              placeholder="Tên hiển thị (VD: Video luyện nghe Unit 5)"
              value={linkForm.fileName}
              onChange={(e) => setLinkForm((f) => ({ ...f, fileName: e.target.value }))}
              required
            />
            <input
              type="url"
              placeholder="Link Youtube"
              value={linkForm.url}
              onChange={(e) => setLinkForm((f) => ({ ...f, url: e.target.value }))}
              required
            />
            <button type="submit" className="admin-btn admin-btn--neutral" disabled={isAddingLink}>
              {isAddingLink ? "Đang thêm..." : "+ Thêm video"}
            </button>
          </form>
        </div>
      )}

      {documents.length === 0 ? (
        <p className="admin-hint">Chưa có học liệu nào.</p>
      ) : (
        <div className="doc-list-items">
          {documents.map((doc) => {
            const embedUrl = doc.fileType === "VIDEO_LINK" ? toYoutubeEmbedUrl(doc.url) : null;
            return (
              <div className="doc-item" key={doc.id}>
                <div className="doc-item-header">
                  <span className="doc-item-name">{doc.fileName}</span>
                  <span className="admin-hint">
                    {FILE_TYPE_LABEL[doc.fileType]} · {doc.uploaderName} · {formatDateTime(doc.uploadedAt)}
                  </span>
                </div>

                {doc.fileType === "MP3" && <AudioPlayerItem id={doc.id} />}

                {(doc.fileType === "PDF" || doc.fileType === "IMAGE") && (
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--neutral"
                      disabled={previewLoadingId === doc.id}
                      onClick={() => openPreview(doc)}
                    >
                      {previewLoadingId === doc.id ? "Đang mở..." : "Xem"}
                    </button>
                  </div>
                )}

                {doc.fileType === "VIDEO_LINK" &&
                  (embedUrl ? (
                    <div className="doc-video-embed">
                      <iframe src={embedUrl} title={doc.fileName} allowFullScreen />
                    </div>
                  ) : (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="admin-btn admin-btn--neutral">
                      Mở video
                    </a>
                  ))}

                {canManage && (
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      disabled={pendingDeleteId === doc.id}
                      onClick={() => handleDelete(doc.id)}
                    >
                      Xoá
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <DocumentPreviewModal
          title={preview.title}
          kind={preview.kind}
          blobUrl={preview.blobUrl}
          onClose={closePreview}
        />
      )}
    </div>
  );
}

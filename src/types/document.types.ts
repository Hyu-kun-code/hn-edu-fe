export type DocumentFileType = "PDF" | "IMAGE" | "MP3" | "VIDEO_LINK";

export interface CourseDocument {
  id: number;
  classId?: number;
  scheduleId?: number;
  uploadedBy: number;
  uploaderName: string;
  fileName: string;
  fileType: DocumentFileType;
  url: string;
  uploadedAt: string;
}

export interface AddVideoLinkPayload {
  fileName: string;
  url: string;
}

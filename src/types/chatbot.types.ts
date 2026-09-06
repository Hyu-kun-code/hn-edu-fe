export type ChatRole = "USER" | "ASSISTANT";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

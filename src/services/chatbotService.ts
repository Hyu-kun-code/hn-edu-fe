import { api } from "./api";
import type { ChatMessage } from "../types/chatbot.types";

export const chatbotService = {
  getHistory: () => api.get<ChatMessage[]>("/chatbot/messages").then((res) => res.data),

  sendMessage: (content: string) =>
    api.post<ChatMessage>("/chatbot/messages", { content }).then((res) => res.data),
};

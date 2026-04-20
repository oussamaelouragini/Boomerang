import api from "./api";

export const getConversations = () => api.get("/conversations").then((r) => r.data);
export const createConversation = (postId) => api.post("/conversations", { postId }).then((r) => r.data);
export const getMessages = (conversationId) => api.get(`/conversations/${conversationId}/messages`).then((r) => r.data);
export const sendMessage = (conversationId, content) => api.post(`/conversations/${conversationId}/messages`, { content }).then((r) => r.data);

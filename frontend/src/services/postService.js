import api from "./api";

export const getPosts = (params) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== "" && v != null));
  return api.get("/posts", { params: clean }).then((r) => r.data);
};
export const getPost = (id) => api.get(`/posts/${id}`).then((r) => r.data);
export const createPost = (formData) => api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updatePost = (id, formData) => api.put(`/posts/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const resolvePost = (id) => api.patch(`/posts/${id}/resolve`);

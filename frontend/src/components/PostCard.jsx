import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { deletePost } from "../services/postService";
import ConfirmDialog from "./ConfirmDialog";
import { toast } from "sonner";

const categoryLabels = {
  electronics: "Electronics",
  books: "Books",
  clothing: "Clothing",
  keys: "Keys",
  "id-cards": "ID Cards",
  other: "Other",
};

function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return d.toLocaleDateString();
}

export default function PostCard({ post }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete post");
    },
  });

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setConfirmOpen(false);
  };

  const isOwner = user && post.author?._id === user.id;

  const imageUrl = post.images?.[0]
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${post.images[0]}`
    : null;

  return (
    <div className="group relative block">
      <Link to={`/posts/${post._id}`} className="block">
        <div className="overflow-hidden rounded-xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
          <div className="relative aspect-[2/1] overflow-hidden bg-primary-light">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
              <svg className="h-10 w-10 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-xs">No image</span>
            </div>
          )}

          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm ${
              post.type === "lost" ? "bg-warning" : "bg-success"
            }`}
          >
            {post.type === "lost" ? "Lost" : "Found"}
          </span>

          {post.status === "resolved" && (
            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-success backdrop-blur-sm">
              Resolved
            </span>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-danger opacity-0 backdrop-blur-sm transition-all hover:bg-danger hover:text-white group-hover:opacity-100"
              title="Delete post"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-4">
          <h3 className="truncate text-base font-bold text-dark transition-colors group-hover:text-primary" title={post.title}>
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted" title={post.description}>{post.description}</p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
              {categoryLabels[post.category] || post.category}
            </span>
            {post.location?.building && (
              <span className="flex min-w-0 items-center gap-1 text-xs text-muted">
                <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="truncate">{post.location.building}</span>
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
            <span className="font-medium">{post.author?.name}</span>
            <span className="rounded-full bg-background px-2 py-0.5 font-medium">
              {timeAgo(post.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
    </div>

    <ConfirmDialog
      open={confirmOpen}
      title="Delete post?"
      description="This will permanently delete this post and all its conversations."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="danger"
      onConfirm={confirmDelete}
      onCancel={() => setConfirmOpen(false)}
    />
  );
}

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, deletePost, resolvePost } from "../services/postService";
import { getConversations } from "../services/chatService";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";
import Avatar from "../components/Avatar";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

const categoryLabels = {
  electronics: "Electronics", books: "Books", clothing: "Clothing",
  keys: "Keys", "id-cards": "ID Cards", other: "Other",
};

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-dark">{value}</p>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
      navigate("/");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolvePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Marked as resolved!");
    },
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = user?.id === post?.author?._id;

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: !!user && isOwner,
  });

  const postConversations = [];
  const seenUsers = new Set();
  (conversations || []).filter((c) => c.post?._id === id).forEach((c) => {
    const otherId = c.participants?.find((p) => p._id !== user?.id)?._id;
    if (otherId && !seenUsers.has(otherId)) {
      seenUsers.add(otherId);
      postConversations.push(c);
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (!post) return <div className="py-12 text-center text-muted">Post not found</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to browse
      </Link>

      {post.images?.length > 0 && (
        <div className={`mb-6 grid gap-2 ${post.images.length > 1 ? "sm:grid-cols-3" : ""}`}>
          {post.images.map((img, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-xl bg-primary-light ${
                post.images.length === 1 ? "max-h-72" : i === 0 ? "aspect-[2/1] sm:col-span-2 sm:row-span-2" : "aspect-[3/2]"
              }`}
            >
              <img
                src={`${API_BASE}${img}`}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white ${
                  post.type === "lost" ? "bg-warning" : "bg-success"
                }`}
              >
                {post.type === "lost" ? (
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {post.type === "lost" ? "Lost" : "Found"}
              </span>
              {post.status === "resolved" && (
                <span className="rounded-full bg-success-light px-3 py-1 text-xs font-bold text-success">
                  Resolved
                </span>
              )}
              <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                {categoryLabels[post.category]}
              </span>
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-dark sm:text-3xl">{post.title}</h1>
              <button
                onClick={async () => {
                  const url = window.location.href;
                  const text = `${post.type === "lost" ? "Lost" : "Found"}: ${post.title}`;
                  if (navigator.share) {
                    try { await navigator.share({ title: text, url }); } catch {}
                  } else {
                    await navigator.clipboard.writeText(url);
                    toast.success("Link copied!");
                  }
                }}
                className="mt-1 flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-primary-light hover:text-dark"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share
              </button>
            </div>
          </div>

          {isOwner && post.status === "active" && (
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/posts/${id}/edit`}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-primary-light"
              >
                Edit
              </Link>
              <button
                onClick={() => resolveMutation.mutate()}
                className="flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Mark Resolved
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-dark">{post.description}</p>

        <div className="mt-6 grid gap-4 rounded-xl bg-background p-5 sm:grid-cols-2">
          <InfoRow
            label="Location"
            value={`${post.location?.building} — ${post.location?.area}`}
            icon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            }
          />
          <InfoRow
            label={`Date ${post.type === "lost" ? "lost" : "found"}`}
            value={new Date(post.dateLostFound).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            icon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            }
          />
          <InfoRow
            label="Posted by"
            value={
              <Link to={`/users/${post.author?._id}`} className="text-primary hover:underline">
                {post.author?.name}
              </Link>
            }
            icon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            }
          />
          <InfoRow
            label="Contact"
            value={post.contactPreference === "chat" ? "In-app chat" : post.contactPreference === "phone" ? "Phone number" : post.author?.email}
            icon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            }
          />
        </div>

        {user && !isOwner && post.contactPreference === "chat" && post.status === "active" && (
          <Link
            to={`/messages?postId=${post._id}`}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Send a Message
          </Link>
        )}

        {isOwner && postConversations.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Messages ({postConversations.length})
            </p>
            <div className="space-y-2">
              {postConversations.map((conv) => {
                const other = conv.participants?.find((p) => p._id !== user?.id);
                return (
                  <Link
                    key={conv._id}
                    to={`/messages/${conv._id}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-primary-light"
                  >
                    <Avatar name={other?.name} src={other?.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-dark">{other?.name || "User"}</p>
                      {conv.lastMessage?.content && (
                        <p className="truncate text-xs text-muted">{conv.lastMessage.content}</p>
                      )}
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete this post?"
        description="This action cannot be undone. The post and all related conversations will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowDeleteDialog(false);
          deleteMutation.mutate();
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

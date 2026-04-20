import { useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getConversations, createConversation } from "../services/chatService";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

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
  return d.toLocaleDateString();
}

export default function ConversationsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const postId = searchParams.get("postId");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  const creatingRef = useRef(false);

  const createMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (conv) => navigate(`/messages/${conv._id}`, { replace: true }),
    onError: (err) => {
      toast.error(err.response?.data?.message || "Could not start conversation");
    },
    onSettled: () => { creatingRef.current = false; },
  });

  useEffect(() => {
    if (postId && !creatingRef.current) {
      creatingRef.current = true;
      createMutation.mutate(postId);
    }
    return () => { creatingRef.current = false; };
  }, [postId]);

  if (isLoading || createMutation.isPending) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">Messages</h1>
        {conversations?.length > 0 && (
          <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {!conversations?.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-white py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-dark">No conversations yet</h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted">
            Start a conversation by messaging the poster of a lost or found item.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Browse items
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.participants?.find((p) => p._id !== user?.id);
            const hasUnread = false;

            return (
              <Link
                key={conv._id}
                to={`/messages/${conv._id}`}
                className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-primary-light">
                  {conv.post?.images?.[0] ? (
                    <img src={`${API_BASE}${conv.post.images[0]}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-primary">
                      {other?.name?.[0] || "?"}
                    </div>
                  )}
                  {hasUnread && (
                    <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-sm font-bold ${hasUnread ? "text-dark" : "text-dark"}`}>
                      {other?.name || "User"}
                    </p>
                    {conv.lastMessage?.timestamp && (
                      <span className="flex-shrink-0 text-xs text-muted">
                        {timeAgo(conv.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs font-medium text-primary">{conv.post?.title}</p>
                  {conv.lastMessage?.content && (
                    <p className="mt-0.5 truncate text-sm text-muted">{conv.lastMessage.content}</p>
                  )}
                </div>

                <svg className="h-4 w-4 flex-shrink-0 text-muted" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

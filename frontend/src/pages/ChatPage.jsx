import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessages, sendMessage, getConversations } from "../services/chatService";
import { resolvePost } from "../services/postService";
import { useAuth } from "../hooks/useAuth";
import Avatar from "../components/Avatar";
import ChatBubble from "../components/ChatBubble";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";
import { toast } from "sonner";

function DateSeparator({ date }) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label;
  if (d.toDateString() === today.toDateString()) {
    label = "Today";
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = "Yesterday";
  } else {
    label = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-medium text-muted">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function shouldShowDate(messages, index) {
  if (index === 0) return true;
  const curr = new Date(messages[index].createdAt).toDateString();
  const prev = new Date(messages[index - 1].createdAt).toDateString();
  return curr !== prev;
}

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const bottomRef = useRef(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => getMessages(id),
    refetchInterval: 5000,
  });

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    refetchOnMount: "always",
  });

  const conversation = conversations?.find((c) => c._id === id);
  const other = conversation?.participants?.find((p) => p._id !== user?.id);
  const post = conversation?.post;
  const isPostOwner = post?.author === user?.id || post?.author?._id === user?.id;
  const isActive = conversation ? (!post || post.status === "active") : true;

  const sendMutation = useMutation({
    mutationFn: (content) => sendMessage(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setInput("");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolvePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
      setShowResolve(false);
      toast.success("Item marked as resolved!");
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMutation.mutate(trimmed);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col" style={{ height: "calc(100dvh - 112px)" }}>
      {/* Header */}
      <div className="rounded-xl bg-white shadow-card">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/messages"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-light hover:text-primary"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>

          <Avatar name={other?.name} src={other?.avatar} size="md" href={other?._id ? `/users/${other._id}` : undefined} />

          <div className="min-w-0 flex-1">
            <Link to={`/users/${other?._id}`} className="truncate text-sm font-bold text-dark hover:text-primary">
              {other?.name || "User"}
            </Link>
            {post && (
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${post.type === "lost" ? "bg-warning" : "bg-success"}`} />
                <Link
                  to={`/posts/${post._id}`}
                  className="truncate text-xs text-muted hover:text-primary hover:underline"
                >
                  {post.type === "lost" ? "Lost" : "Found"}: {post.title}
                </Link>
              </div>
            )}
          </div>

          {isPostOwner && isActive && (
            <button
              onClick={() => setShowResolve(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success hover:text-white"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Resolve
            </button>
          )}

          {post && !isActive && (
            <span className="shrink-0 rounded-full bg-success-light px-2.5 py-1 text-[11px] font-bold text-success">
              Resolved
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-dark">Start the conversation</p>
            <p className="mt-1 text-xs text-muted">Send a message about this item</p>
          </div>
        )}
        {messages?.map((msg, i) => (
          <div key={msg._id}>
            {shouldShowDate(messages, i) && <DateSeparator date={msg.createdAt} />}
            <ChatBubble message={msg} isOwn={msg.sender?._id === user?.id} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 rounded-xl bg-white p-3 shadow-card">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isActive ? "Type a message..." : "This item has been resolved"}
          disabled={!isActive}
          className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-background disabled:text-muted"
        />
        <button
          type="submit"
          disabled={sendMutation.isPending || !input.trim() || !isActive}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          Send
        </button>
      </form>

      <ConfirmDialog
        open={showResolve}
        title="Mark as resolved?"
        description="This will mark the item as found/returned. The conversation will remain but you won't be able to send new messages."
        confirmLabel="Yes, resolve it"
        cancelLabel="Not yet"
        variant="success"
        onConfirm={() => resolveMutation.mutate()}
        onCancel={() => setShowResolve(false)}
      />
    </div>
  );
}

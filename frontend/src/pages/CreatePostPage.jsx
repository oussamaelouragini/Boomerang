import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../services/postService";
import PostForm from "../components/PostForm";
import { toast } from "sonner";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created!");
      navigate(`/posts/${res.data._id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create post");
    },
  });

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to browse
      </Link>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-dark">Report an Item</h1>
        <p className="mt-1 text-sm text-muted">Help your campus community by reporting lost or found items</p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <PostForm onSubmit={(data) => mutation.mutate(data)} submitting={mutation.isPending} />
      </div>
    </div>
  );
}

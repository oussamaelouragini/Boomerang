import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, updatePost } from "../services/postService";
import PostForm from "../components/PostForm";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
  });

  const mutation = useMutation({
    mutationFn: (formData) => updatePost(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post updated!");
      navigate(`/posts/${id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update");
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!post) return <div className="py-12 text-center text-muted">Post not found</div>;

  const initialData = {
    type: post.type,
    title: post.title,
    description: post.description,
    category: post.category,
    location: post.location,
    dateLostFound: new Date(post.dateLostFound).toISOString().split("T")[0],
    contactPreference: post.contactPreference,
    images: post.images || [],
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/posts/${id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to post
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-dark">Edit Post</h1>
      <div className="rounded-xl bg-white p-6 shadow-card sm:p-8">
        <PostForm initialData={initialData} onSubmit={(data) => mutation.mutate(data)} submitting={mutation.isPending} />
      </div>
    </div>
  );
}

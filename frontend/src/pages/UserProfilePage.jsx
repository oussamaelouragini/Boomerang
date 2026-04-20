import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { getPosts } from "../services/postService";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

function SocialLink({ href, icon, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-primary-light hover:text-dark"
    >
      {icon}
      {label}
    </a>
  );
}

export default function UserProfilePage() {
  const { id } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api.get(`/auth/users/${id}`).then((r) => r.data),
  });

  const { data: postsData } = useQuery({
    queryKey: ["userPosts", id],
    queryFn: () => getPosts({ author: id, limit: 50 }),
    enabled: !!id,
  });

  const posts = postsData?.posts || [];
  const activePosts = posts.filter((p) => p.status === "active");

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <div className="py-12 text-center text-muted">User not found</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar name={profile.name} src={profile.avatar} size="xl" className="rounded-2xl ring-4 ring-primary-light" />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-dark">{profile.name}</h1>
            {profile.studyProgram && <p className="mt-0.5 text-sm text-muted">{profile.studyProgram}</p>}
            {profile.bio && <p className="mt-2 text-sm text-dark">{profile.bio}</p>}

            {(profile.phone || profile.links?.linkedin || profile.links?.facebook || profile.links?.website) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <SocialLink
                  href={profile.phone ? `tel:${profile.phone}` : null}
                  label={profile.phone}
                  icon={
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  }
                />
                <SocialLink
                  href={profile.links?.linkedin}
                  label="LinkedIn"
                  icon={
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  }
                />
                <SocialLink
                  href={profile.links?.facebook}
                  label="Facebook"
                  icon={
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
                    </svg>
                  }
                />
                <SocialLink
                  href={profile.links?.website}
                  label="Website"
                  icon={
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-background p-4 text-center">
            <p className="text-2xl font-bold text-primary">{profile.postsCount}</p>
            <p className="text-xs font-medium text-muted">Posts</p>
          </div>
          <div className="rounded-xl bg-background p-4 text-center">
            <p className="text-2xl font-bold text-success">{profile.returnsCount}</p>
            <p className="text-xs font-medium text-muted">Resolved</p>
          </div>
        </div>
      </div>

      {activePosts.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold text-dark">Active posts</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activePosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </div>
      )}

      {activePosts.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No active posts" description="This user has no active listings" />
        </div>
      )}
    </div>
  );
}

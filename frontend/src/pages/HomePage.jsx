import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../services/postService";
import PostCard from "../components/PostCard";
import FilterBar from "../components/FilterBar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    building: "",
    search: "",
    sort: "newest",
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["posts", filters],
    queryFn: () => getPosts(filters),
    placeholderData: (prev) => prev,
  });

  const { data: allData} = useQuery({
    queryKey: ["posts", { sort: "newest", page: 1 }],
    queryFn: () => getPosts({ sort: "newest", page: 1 }),
    keepPreviousData: true,
  });

  const totalPosts = allData?.total ?? null;

  return (
    <div>
      <div className="mb-10 overflow-hidden rounded-2xl bg-primary px-8 py-10 text-white sm:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
              Campus Lost & Found
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Lost something?
              <br />
              <span className="text-white/80">We'll help you find it.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Post a report, browse items found on campus, and reconnect with your belongings.
            </p>
            {totalPosts !== null && (
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {totalPosts} item{totalPosts !== 1 ? "s" : ""} reported
              </p>
            )}
          </div>
          <Link
            to={user ? "/posts/new" : "/login"}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary-light hover:shadow-lg sm:self-auto"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Report an Item
          </Link>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.posts?.length === 0 ? (
        <EmptyState
          title="No items found"
          description="Try adjusting your filters or search terms"
          action={
            <Link to="/posts/new" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
              Report an item
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {data?.posts?.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {data?.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setFilters({ ...filters, page })}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                    page === data.page
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-dark hover:bg-primary-light"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

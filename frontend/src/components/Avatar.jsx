import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Avatar({ name, src, size = "md", href, className = "" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
  };

  const imageUrl = src && src !== "/default-avatar.png"
    ? src.startsWith("http") ? src : `${API_BASE}${src}`
    : null;

  const content = imageUrl ? (
    <img src={imageUrl} alt={name || "User avatar"} className="h-full w-full object-cover" />
  ) : (
    getInitials(name)
  );

  const baseClass = `flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-bold text-white ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link to={href} className={`${baseClass} transition-opacity hover:opacity-80`} aria-label={name || "User avatar"}>
        {content}
      </Link>
    );
  }

  return (
    <div role="img" aria-label={name || "User avatar"} className={baseClass}>
      {content}
    </div>
  );
}

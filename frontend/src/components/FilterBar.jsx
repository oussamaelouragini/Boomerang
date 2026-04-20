import { useState, useEffect, useRef } from "react";
import { CATEGORIES } from "@shared/constants/categories.js";
import { LOCATIONS } from "@shared/constants/locations.js";
import Select from "./Select";

const categoryOptions = [
  { value: "", label: "All categories" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books" },
  { value: "clothing", label: "Clothing" },
  { value: "keys", label: "Keys" },
  { value: "id-cards", label: "ID Cards" },
  { value: "other", label: "Other" },
];

const locationOptions = [
  { value: "", label: "All locations" },
  ...LOCATIONS.map((loc) => ({ value: loc.building, label: loc.building })),
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const typeConfig = [
  {
    key: "",
    label: "All",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: "lost",
    label: "Lost",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: "found",
    label: "Found",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function FilterBar({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || "");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (search !== filters.search) {
        onChange({ ...filters, search, page: 1 });
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onChange({ ...filters, search, page: 1 });
  };

  const handleFilter = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const activeSortOptions = sortOptions;

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg className="h-4 w-4 text-muted" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lost & found items..."
            className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Search
        </button>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <div className="flex w-full rounded-lg border border-border bg-white p-1 shadow-sm sm:w-auto">
          {typeConfig.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleFilter("type", key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${
                (filters.type || "") === key
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-dark"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="hidden h-5 w-px bg-border sm:block" />

        <Select
          value={filters.category || ""}
          onChange={(val) => handleFilter("category", val)}
          options={categoryOptions}
          placeholder="All categories"
          className="w-full sm:w-auto"
        />

        <Select
          value={filters.building || ""}
          onChange={(val) => handleFilter("building", val)}
          options={locationOptions}
          placeholder="All locations"
          className="w-full sm:w-auto"
        />

        <Select
          value={filters.sort || "newest"}
          onChange={(val) => handleFilter("sort", val)}
          options={activeSortOptions}
          placeholder="Sort by"
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
}

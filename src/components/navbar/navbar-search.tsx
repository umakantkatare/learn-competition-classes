"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NavbarSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);

    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative flex items-center">
      {/* Search Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close search" : "Open search"}
        aria-expanded={isOpen}
        className="flex h-14 w-14 shrink-0 items-center
          justify-center rounded-full bg-[#FFFAEB]
          text-[#171717] transition-colors
          hover:bg-amber-100"
      >
        {isOpen ? (
          <X size={27} strokeWidth={2} />
        ) : (
          <Search size={27} strokeWidth={2} />
        )}
      </button>

      {/* Search Input */}
      {isOpen && (
        <form
          onSubmit={handleSearch}
          className="absolute right-0 top-full z-50 mt-4
            flex w-[320px] items-center gap-2
            rounded-xl border border-gray-200
            bg-white p-3 shadow-xl"
        >
          <Search size={20} className="shrink-0 text-gray-500" />

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, tests..."
            autoFocus
            className="min-w-0 flex-1 bg-transparent
              text-sm text-gray-900 outline-none
              placeholder:text-gray-400"
          />

          <button
            type="submit"
            disabled={!query.trim()}
            className="rounded-lg bg-[#F5A800]
              px-3 py-2 text-sm font-semibold
              text-black transition-colors
              hover:bg-amber-500
              disabled:cursor-not-allowed
              disabled:opacity-50"
          >
            Search
          </button>
        </form>
      )}
    </div>
  );
}

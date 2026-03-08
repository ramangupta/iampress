"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Auto-generate cover colors based on genre
const genreStyles: Record<string, { bg: string; accent: string; emoji: string }> = {
  Technology:   { bg: "from-blue-900 to-blue-700",    accent: "bg-blue-500",  emoji: "⚡" },
  Programming:  { bg: "from-violet-900 to-violet-700", accent: "bg-violet-500", emoji: "💻" },
  DevOps:       { bg: "from-orange-900 to-orange-700", accent: "bg-orange-500", emoji: "🚀" },
  Science:      { bg: "from-teal-900 to-teal-700",    accent: "bg-teal-500",  emoji: "🔬" },
  Business:     { bg: "from-emerald-900 to-emerald-700", accent: "bg-emerald-500", emoji: "📈" },
  "Self Help":  { bg: "from-yellow-900 to-yellow-700", accent: "bg-yellow-500", emoji: "✨" },
  Fiction:      { bg: "from-rose-900 to-rose-700",    accent: "bg-rose-500",  emoji: "📖" },
  "Non Fiction":{ bg: "from-slate-900 to-slate-700",  accent: "bg-slate-500", emoji: "📝" },
  History:      { bg: "from-amber-900 to-amber-700",  accent: "bg-amber-500", emoji: "🏛️" },
  Biography:    { bg: "from-cyan-900 to-cyan-700",    accent: "bg-cyan-500",  emoji: "👤" },
  Other:        { bg: "from-gray-900 to-gray-700",    accent: "bg-gray-500",  emoji: "📚" },
};

function BookCover({ book }: { book: any }) {
  const style = genreStyles[book.genre] || genreStyles["Other"];

  if (book.cover_url) {
    return (
      <img
        src={book.cover_url}
        alt={book.title}
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-b ${style.bg} flex flex-col items-center justify-between p-4`}>
      {/* Top accent bar */}
      <div className={`w-full h-1 ${style.accent} rounded-full opacity-80`} />

      {/* Emoji */}
      <div className="text-5xl">{style.emoji}</div>

      {/* Title */}
      <div className="text-center">
        <p className="text-white font-bold text-sm leading-tight text-center line-clamp-3">
          {book.title}
        </p>
        <p className="text-white/60 text-xs mt-2">{book.genre}</p>
      </div>

      {/* Bottom accent bar */}
      <div className={`w-full h-1 ${style.accent} rounded-full opacity-80`} />
    </div>
  );
}

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

  const genres = ["All", "Technology", "Programming", "DevOps", "Science",
    "Business", "Self Help", "Fiction", "Non Fiction", "History", "Biography", "Other"];

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const { data: books } = await supabase
      .from("books")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    setBooks(books || []);

    // Load author names
    if (books && books.length > 0) {
      const authorIds = [...new Set(books.map((b) => b.author_id))];
      const { data: users } = await supabase
        .from("users")
        .select("id, name")
        .in("id", authorIds);

      const authorMap: Record<string, string> = {};
      users?.forEach((u) => { authorMap[u.id] = u.name; });
      setAuthors(authorMap);
    }

    setLoading(false);
  };

  const filtered = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navigation */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 bg-gray-950/90 backdrop-blur-sm z-10">
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-teal-400">IAM Press</span>
          <span className="text-xl">♾️</span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/signin" className="text-sm text-white/60 hover:text-white transition-colors">Sign In</a>
          <a href="/signup" className="text-sm bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-500 transition-colors">Get Started</a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Bookstore</h1>
          <p className="text-white/50">Every book free to read. Forever.</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === genre
                  ? "bg-teal-600 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="text-teal-400 text-lg">Loading books...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="text-6xl">📚</div>
            <p className="text-white/50 text-lg">No books found</p>
            <a href="/signup" className="text-teal-400 text-sm hover:underline">
              Be the first to publish →
            </a>
          </div>
        )}

        {/* Books Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filtered.map((book) => (
              
                <a key={book.id} href={`/books/${book.id}`} className="group flex flex-col gap-3 cursor-pointer" onMouseEnter={() => setHoveredBook(book.id)} onMouseLeave={() => setHoveredBook(null)}>
                {/* Book Cover */}
                <div
                  className={`relative w-full rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
                    hoveredBook === book.id
                      ? "shadow-teal-500/30 shadow-2xl -translate-y-2"
                      : ""
                  }`}
                  style={{ aspectRatio: "2/3" }}
                >
                  <BookCover book={book} />

                  {/* Hover overlay */}
                  {hoveredBook === book.id && (
                    <div className="absolute inset-0 bg-teal-500/10 flex items-center justify-center">
                      <span className="bg-teal-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                        Read Free
                      </span>
                    </div>
                  )}

                  {/* Book spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/30" />
                </div>

                {/* Book Info */}
                <div>
                  <p className="text-white text-sm font-medium leading-tight line-clamp-2 group-hover:text-teal-400 transition-colors">
                    {book.title}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {authors[book.author_id] || "Unknown Author"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

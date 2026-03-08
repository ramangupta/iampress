"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function BookReader({ params }: { params: Promise<{ id: string }> }) {
  const [book, setBook] = useState<any>(null);
  const [author, setAuthor] = useState<string>("");
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    params.then((p) => loadBook(p.id));
  }, []);

  const loadBook = async (id: string) => {
    const { data: book } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();

    if (!book) { window.location.href = "/books"; return; }
    setBook(book);

    // Load author
    const { data: user } = await supabase
      .from("users")
      .select("name")
      .eq("id", book.author_id)
      .single();

    setAuthor(user?.name || "Unknown Author");

    // Load chapters
    const { data: chapters } = await supabase
      .from("chapters")
      .select("*")
      .eq("book_id", id)

    setChapters(chapters || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-teal-400 text-lg">Loading book...</div>
      </div>
    );
  }

  const bg = darkMode ? "bg-gray-950" : "bg-gray-50";
  const text = darkMode ? "text-gray-100" : "text-gray-900";
  const subtext = darkMode ? "text-gray-400" : "text-gray-500";
  const sidebar = darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const chapterBg = darkMode ? "bg-gray-950" : "bg-white";

  return (
    <div className={`min-h-screen ${bg} flex flex-col`}>

      {/* Top Bar */}
      <nav className={`${sidebar} border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`text-sm ${subtext} hover:text-teal-500 transition-colors`}>
            {sidebarOpen ? "◀ Hide" : "▶ Show"}
          </button>
          <a href="/books" className={`text-sm ${subtext} hover:text-teal-500 transition-colors`}>
            ← Bookstore
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-teal-600 font-bold text-sm">IAM Press</span>
          <span>♾️</span>
        </div>

        {/* Dark/Light toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            darkMode
              ? "border-gray-700 text-gray-300 hover:border-teal-500"
              : "border-gray-200 text-gray-600 hover:border-teal-500"
          }`}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — Chapter List */}
        {sidebarOpen && (
          <aside className={`w-72 ${sidebar} border-r flex flex-col overflow-hidden shrink-0`}>

            {/* Book Info */}
            <div className="p-6 border-b border-inherit">
              {book.cover_url
                ? <img src={book.cover_url} alt={book.title} className="w-20 h-28 object-cover rounded-lg mb-4 shadow-lg" />
                : <div className="w-20 h-28 bg-gradient-to-b from-blue-900 to-blue-700 rounded-lg mb-4 flex items-center justify-center text-3xl shadow-lg">⚡</div>
              }
              <h2 className={`font-bold text-sm ${text} leading-tight`}>{book.title}</h2>
              <p className={`text-xs ${subtext} mt-1`}>{author}</p>
              <p className={`text-xs ${subtext} mt-1`}>{chapters.length} chapters</p>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto py-2">
              {chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(i)}
                  className={`w-full text-left px-6 py-3 text-xs transition-colors ${
                    activeChapter === i
                      ? "bg-teal-600/20 text-teal-500 font-medium border-r-2 border-teal-500"
                      : `${subtext} hover:bg-white/5`
                  }`}
                >
                  <span className="block text-xs opacity-50 mb-0.5">Chapter {ch.chapter_number}</span>
                  <span className="line-clamp-2">{ch.title}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Main Reading Area */}
        <main className="flex-1 overflow-y-auto">
          {chapters.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className={`${subtext} text-sm`}>No chapters available yet.</p>
              </div>
            </div>
          ) : (
            <div className={`max-w-2xl mx-auto px-8 py-12`}>

              {/* Chapter Header */}
              <div className="mb-10">
                <p className={`text-xs ${subtext} mb-2 uppercase tracking-widest`}>
                  Chapter {chapters[activeChapter]?.chapter_number}
                </p>
                <h1 className={`text-3xl font-bold ${text} leading-tight`}>
                  {chapters[activeChapter]?.title}
                </h1>
              </div>

              {/* Chapter Content */}
              <div
                className={`${text} text-base leading-8 max-w-none reader-content
                  ${darkMode ? "dark-reader" : "light-reader"}
                `}
                dangerouslySetInnerHTML={{ __html: chapters[activeChapter]?.content || "" }}
              />

              {/* Chapter Navigation */}
              <div className="flex justify-between mt-16 pt-8 border-t border-inherit">
                <button
                  onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
                  disabled={activeChapter === 0}
                  className={`text-sm px-6 py-2.5 rounded-xl border transition-colors disabled:opacity-30 ${
                    darkMode
                      ? "border-gray-700 text-gray-300 hover:border-teal-500"
                      : "border-gray-200 text-gray-600 hover:border-teal-500"
                  }`}
                >
                  ← Previous
                </button>
                <span className={`text-xs ${subtext} self-center`}>
                  {activeChapter + 1} / {chapters.length}
                </span>
                <button
                  onClick={() => setActiveChapter(Math.min(chapters.length - 1, activeChapter + 1))}
                  disabled={activeChapter === chapters.length - 1}
                  className={`text-sm px-6 py-2.5 rounded-xl border transition-colors disabled:opacity-30 ${
                    darkMode
                      ? "border-gray-700 text-gray-300 hover:border-teal-500"
                      : "border-gray-200 text-gray-600 hover:border-teal-500"
                  }`}
                >
                  Next →
                </button>
              </div>

            </div>
          )}
        </main>

      </div>
    </div>
  );
}
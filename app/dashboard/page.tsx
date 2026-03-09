"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/signin"; return; }
    setUser(user);

    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
    setProfile(profile);

    const { data: books } = await supabase.from("books").select("*").eq("author_id", user.id).order("created_at", { ascending: false });
    setBooks(books || []);

    const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });
    const { count: bookCount } = await supabase.from("books").select("*", { count: "exact", head: true });

    setTotalUsers(userCount || 0);
    setTotalBooks(bookCount || 0);
    setLoading(false);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    await supabase.from("chapters").delete().eq("book_id", bookId);
    await supabase.from("books").delete().eq("id", bookId);
    setBooks(books.filter((b) => b.id !== bookId));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-teal-400 text-lg animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Top Navigation */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 bg-gray-950/90 backdrop-blur-sm z-10">
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-teal-400">IAM Press</span>
          <span className="text-xl">♾️</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="/books" className="text-sm text-white/50 hover:text-teal-400 transition-colors">Bookstore</a>
          <a href="/" className="text-sm text-white/50 hover:text-teal-400 transition-colors">Home</a>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-white/70">{profile?.name}</span>
          </div>
          <button onClick={handleSignOut} className="text-sm text-white/40 hover:text-red-400 transition-colors">Sign Out</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-900/50 to-teal-700/20 border border-teal-700/30 rounded-2xl p-8 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {profile?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-teal-300/70 text-sm">
              {profile?.role === 'author'
                ? "Share your knowledge with the world."
                : "Explore free books from amazing authors."}
            </p>
          </div>
          <div className="text-5xl">
            {profile?.role === 'author' ? '✍️' : '📖'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold text-teal-400">{totalUsers}</div>
            <div className="text-sm text-white/40 mt-1">Total Members</div>
            <div className="text-xs text-teal-400/60 mt-1">↑ Growing!</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold text-teal-400">{totalBooks}</div>
            <div className="text-sm text-white/40 mt-1">Books Published</div>
            <div className="text-xs text-teal-400/60 mt-1">Free forever</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold text-teal-400">{books.length}</div>
            <div className="text-sm text-white/40 mt-1">My Books</div>
            <div className="text-xs text-teal-400/60 mt-1">Your library</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold text-teal-400 capitalize">{profile?.role === 'author' ? '✍️' : '📖'}</div>
            <div className="text-sm text-white/40 mt-1 capitalize">{profile?.role}</div>
            <div className="text-xs text-teal-400/60 mt-1">Your role</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* My Books */}
          {profile?.role === 'author' && (
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">My Books</h2>
                <a href="/dashboard/newbook" className="bg-teal-600 hover:bg-teal-500 text-white text-sm px-4 py-2 rounded-full transition-colors">
                  New Book
                </a>
              </div>

              {books.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-white/40 text-sm mb-4">No books published yet.</p>
                  <a href="/dashboard/newbook" className="text-teal-400 text-sm hover:underline">Publish your first book →</a>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {books.map((book) => (
                    <div key={book.id} className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl p-4 hover:border-teal-700/50 transition-colors">
                      {/* Mini Cover */}
                      <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center">
                        {book.cover_url
                          ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                          : <span className="text-lg">⚡</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{book.title}</p>
                        <p className="text-white/40 text-xs mt-0.5">{book.genre}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs bg-teal-900/50 text-teal-400 border border-teal-700/30 px-2 py-1 rounded-full">
                          {book.status}
                        </span>
                        <a href={`/books/${book.id}`} className="text-xs text-white/30 hover:text-teal-400 transition-colors px-2 py-1">
                          View
                        </a>
                        <button onClick={() => handleDeleteBook(book.id)} className="text-xs text-white/30 hover:text-red-400 transition-colors px-2 py-1">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">My Profile</h2>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-2xl font-bold text-white mb-3">
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-white">{profile?.name}</p>
              <p className="text-white/40 text-xs mt-1 capitalize">{profile?.role}</p>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-white/30 mb-1">Email</p>
                <p className="text-sm text-white/70 truncate">{profile?.email}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 mb-1">Member Since</p>
                <p className="text-sm text-white/70">
                  {new Date(profile?.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/30 mb-1">Books Published</p>
                <p className="text-sm text-white/70">{books.length}</p>
              </div>
            </div>

            <a href="/books" className="mt-6 w-full border border-teal-700/50 text-teal-400 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-900/30 transition-colors text-center block">
              Browse Bookstore
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
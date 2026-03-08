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

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    // Delete chapters first
    await supabase.from("chapters").delete().eq("book_id", bookId);

    // Then delete the book
    await supabase.from("books").delete().eq("id", bookId);

    // Refresh the list
    setBooks(books.filter((b) => b.id !== bookId));
  };
  
  const loadDashboard = async () => {
    // Get logged in user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/signin";
      return;
    }

    setUser(user);

    // Get profile from users table
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profile);

    // Get this author's books
    const { data: books } = await supabase
      .from("books")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    setBooks(books || []);

    // Get platform stats
    const { count: userCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: bookCount } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true });

    setTotalUsers(userCount || 0);
    setTotalBooks(bookCount || 0);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-teal-700 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-teal-700">IAM Press</span>
          <span className="text-xl">♾️</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/books" className="text-sm text-gray-500 hover:text-teal-700 transition-colors">Bookstore</a>
          <a href="/" className="text-sm text-gray-500 hover:text-teal-700 transition-colors">Home</a>
          <span className="text-sm text-gray-600">
            Welcome, <span className="font-medium text-gray-900">{profile?.name}</span>
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Platform Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-teal-700">{totalUsers}</div>
            <div className="text-sm text-gray-500 mt-1">Total Members</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-teal-700">{totalBooks}</div>
            <div className="text-sm text-gray-500 mt-1">Books Published</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-teal-700">
              {profile?.role === "author" ? "✍️" : "📖"}
            </div>
            <div className="text-sm text-gray-500 mt-1 capitalize">{profile?.role}</div>
          </div>
        </div>

        {/* Author Section */}
        {profile?.role === "author" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">My Books</h2>
              <a href="/dashboard/newbook" className="bg-teal-700 text-white text-sm px-5 py-2.5 rounded-full hover:bg-teal-800 transition-colors">New Book</a>
            </div>

            {books.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📚</div>
                <p className="text-gray-500 text-sm">You have not published any books yet.</p>
                <a href="/dashboard/newbook" className="inline-block mt-4 text-teal-700 text-sm font-medium hover:underline">Publish your first book</a>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between border border-gray-100 rounded-xl px-6 py-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{book.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{book.genre}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          book.status === "published"
                            ? "bg-teal-50 text-teal-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {book.status}
                      </span>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors px-3 py-1 rounded-full hover:bg-red-50"
                      >
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
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">My Profile</h2>
          <div className="flex flex-col gap-3">
            <div className="flex gap-4 text-sm">
              <span className="text-gray-500 w-24">Name</span>
              <span className="text-gray-900 font-medium">{profile?.name}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-500 w-24">Email</span>
              <span className="text-gray-900">{profile?.email}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-500 w-24">Role</span>
              <span className="text-gray-900 capitalize">{profile?.role}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-500 w-24">Joined</span>
              <span className="text-gray-900">
                {new Date(profile?.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

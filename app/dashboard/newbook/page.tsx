"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewBook() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const genres = [
    "Technology", "Programming", "DevOps", "Science",
    "Business", "Self Help", "Fiction", "Non Fiction",
    "History", "Biography", "Other"
  ];

  const handlePublish = async () => {
    setLoading(true);
    setError("");

    if (!title || !description || !genre) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/signin";
      return;
    }

    // Insert book into database
    const { error: dbError } = await supabase.from("books").insert({
      title,
      description,
      genre,
      author_id: user.id,
      status: "published",
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Published!</h1>
          <p className="text-gray-500 text-sm mb-8">Your book is now live on IAM Press for everyone to read — for free.</p>
          <div className="flex flex-col gap-3">
            <a href="/dashboard" className="w-full bg-teal-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors text-center">Back to Dashboard</a>
            <a href="/dashboard/newbook" className="w-full border border-teal-700 text-teal-700 py-3 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors text-center">Publish Another Book</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-teal-700">IAM Press</span>
          <span className="text-xl">♾️</span>
        </div>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-teal-700 transition-colors">
          Back to Dashboard
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-10">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Publish a New Book</h1>
            <p className="text-gray-500 text-sm mt-2">
              Share your knowledge with the world — completely free.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6">

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Book Title
              </label>
              <input
                type="text"
                placeholder="e.g. Mastering Git & GitHub"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Description
              </label>
              <textarea
                placeholder="What is your book about? Who is it for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white"
              >
                <option value="">Select a genre</option>
                {genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handlePublish}
              disabled={loading}
              className="w-full bg-teal-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Publishing..." : "Publish Book"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

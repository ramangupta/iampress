"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reader");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    // Basic validation
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    // Create auth user in Supabase
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Save extra info to users table
    if (data.user) {
      const { error: dbError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        role,
      });

      if (dbError) {
        setError(dbError.message);
        setLoading(false);
        return;
      }
    }

    setMessage(
      "Account created! Please check your email to confirm your account."
    );
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">♾️</div>
          <h1 className="text-2xl font-bold text-gray-900">Join IAM Press</h1>
          <p className="text-gray-500 text-sm mt-2">
            Free forever. No credit card needed.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
          <button
            onClick={() => setRole("reader")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              role === "reader"
                ? "bg-teal-700 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            📖 I want to Read
          </button>
          <button
            onClick={() => setRole("author")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              role === "author"
                ? "bg-teal-700 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            ✍️ I want to Publish
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Raman Gupta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl">
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full bg-teal-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating account..." : "Create Free Account"}
          </button>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/signin" className="text-teal-700 font-medium hover:underline">
            Sign In
          </a>
        </p>

      </div>
    </div>
  );
}

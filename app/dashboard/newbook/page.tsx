"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const genres = [
  "Technology", "Programming", "DevOps", "Science",
  "Business", "Self Help", "Fiction", "Non Fiction",
  "History", "Biography", "Other"
];

export default function NewBook() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [chapters, setChapters] = useState<{ title: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Step 1 — Book Details
  const handleStep1 = () => {
    if (!title || !description || !genre) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStep(2);
  };

  // Step 2 — Cover Upload
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Step 3 — Manuscript Upload + Parse
  const handleManuscriptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setManuscriptFile(file);
    setParsing(true);
    setError("");

    try {
      let extractedText = "";

      if (file.name.endsWith(".docx")) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/parse-docx', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        extractedText = JSON.stringify(data.sections);
      } else if (file.name.endsWith(".pdf")) {
        // Parse PDF
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          extractedText += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
      } else {
        setError("Please upload a .docx or .pdf file.");
        setParsing(false);
        return;
      }

      // Split into chapters by detecting headings
      let parsedChapters;
      if (file.name.endsWith(".docx")) {
        parsedChapters = JSON.parse(extractedText);
      } else {
        parsedChapters = parseChapters(extractedText);
      }
      setChapters(parsedChapters);
      setStep(3);
    } catch (err) {
      setError("Failed to parse file. Please try again.");
    }

    setParsing(false);
  };

  const parseChapters = (html: string) => {
    const chapterList: { title: string; content: string }[] = [];
    let currentTitle = "";
    let currentContent = "";

    // Split by h1 and h2 tags
    const parts = html.split(/(<h[12][^>]*>.*?<\/h[12]>)/gi);

    parts.forEach((part) => {
      const h1Match = part.match(/^<h1[^>]*>(.*?)<\/h1>$/i);
      const h2Match = part.match(/^<h2[^>]*>(.*?)<\/h2>$/i);

      if (h1Match || h2Match) {
        // Save previous chapter
        if (currentTitle && currentContent.trim()) {
          chapterList.push({ title: currentTitle, content: currentContent });
        }
        // Start new chapter
        currentTitle = (h1Match || h2Match)![1].replace(/<[^>]*>/g, "").trim();
        currentContent = "";
      } else {
        currentContent += part;
      }
    });

    // Save last chapter
    if (currentTitle && currentContent.trim()) {
      chapterList.push({ title: currentTitle, content: currentContent });
    }

    return chapterList.length > 0
      ? chapterList
      : [{ title: "Full Content", content: html }];
  };

  // Publish the book
  const handlePublish = async () => {
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/signin"; return; }

    try {
      // Upload cover
      let coverUrl = null;
      if (coverFile) {
        const coverPath = `${user.id}/${Date.now()}_${coverFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(coverPath, coverFile);
        if (!uploadError) {
          const { data } = supabase.storage.from("covers").getPublicUrl(coverPath);
          coverUrl = data.publicUrl;
        }
      }

      // Create book
      const { data: book, error: bookError } = await supabase
        .from("books")
        .insert({ title, description, genre, author_id: user.id, cover_url: coverUrl, status: "published" })
        .select()
        .single();

      if (bookError) throw bookError;

      // Insert chapters
      const chapterRows = chapters.map((ch, i) => ({
        book_id: book.id,
        title: ch.title,
        content: ch.content,
        chapter_number: i + 1,
      }));

      const { error: chaptersError } = await supabase.from("chapters").insert(chapterRows);
      if (chaptersError) throw chaptersError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Published!</h1>
          <p className="text-gray-500 text-sm mb-2">{chapters.length} chapters uploaded successfully.</p>
          <p className="text-gray-500 text-sm mb-8">Your book is now live on IAM Press.</p>
          <div className="flex flex-col gap-3">
            <a href="/dashboard" className="w-full bg-teal-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors text-center block">Back to Dashboard</a>
            <a href="/books" className="w-full border border-teal-700 text-teal-700 py-3 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors text-center block">View Bookstore</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-teal-700">IAM Press</span>
          <span className="text-xl">♾️</span>
        </div>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-teal-700 transition-colors">Back to Dashboard</a>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-10">

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s ? "bg-teal-700 text-white" : "bg-gray-200 text-gray-400"
              }`}>{s}</div>
              <span className={`text-sm ${step >= s ? "text-teal-700 font-medium" : "text-gray-400"}`}>
                {s === 1 ? "Details" : s === 2 ? "Cover & Manuscript" : "Review & Publish"}
              </span>
              {s < 3 && <div className={`h-px w-8 ${step > s ? "bg-teal-700" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-10">

          {/* Step 1 — Details */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Book Details</h1>
                <p className="text-gray-500 text-sm mt-1">Tell us about your book</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Book Title</label>
                <input type="text" placeholder="e.g. Mastering Git & GitHub" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea placeholder="What is your book about?" value={description}
                  onChange={(e) => setDescription(e.target.value)} rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Genre</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white">
                  <option value="">Select a genre</option>
                  {genres.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <button onClick={handleStep1} className="w-full bg-teal-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors">Continue</button>
            </div>
          )}

          {/* Step 2 — Cover + Manuscript */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cover & Manuscript</h1>
                <p className="text-gray-500 text-sm mt-1">Upload your book cover and manuscript</p>
              </div>

              {/* Cover Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Book Cover</label>
                <div className="flex gap-6 items-start">
                  <div className="w-28 h-40 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
                    {coverPreview
                      ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      : <span className="text-3xl">📖</span>
                    }
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" id="cover-upload" />
                    <label htmlFor="cover-upload" className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm cursor-pointer hover:bg-gray-200 transition-colors">
                      Choose Cover Image
                    </label>
                    <p className="text-gray-400 text-xs mt-2">JPG, PNG recommended. Ratio 2:3 (like a book cover)</p>
                  </div>
                </div>
              </div>

              {/* Manuscript Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Manuscript</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-gray-500 text-sm mb-4">Upload your Word (.docx) or PDF file</p>
                  <input type="file" accept=".docx,.pdf" onChange={handleManuscriptChange} className="hidden" id="manuscript-upload" />
                  <label htmlFor="manuscript-upload" className="inline-block bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm cursor-pointer hover:bg-teal-800 transition-colors">
                    {parsing ? "Parsing..." : "Choose Manuscript"}
                  </label>
                  {manuscriptFile && <p className="text-teal-600 text-xs mt-3">✅ {manuscriptFile.name}</p>}
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            </div>
          )}

          {/* Step 3 — Review Chapters */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review Chapters</h1>
                <p className="text-gray-500 text-sm mt-1">{chapters.length} chapters detected from your manuscript</p>
              </div>

              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                {chapters.map((ch, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full font-medium w-8 text-center">{i + 1}</span>
                    <input
                      type="text"
                      value={ch.title}
                      onChange={(e) => {
                        const updated = [...chapters];
                        updated[i].title = e.target.value;
                        setChapters(updated);
                      }}
                      className="flex-1 text-sm text-gray-900 focus:outline-none border-b border-transparent focus:border-teal-300"
                    />
                  </div>
                ))}
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

              <button onClick={handlePublish} disabled={loading}
                className="w-full bg-teal-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-50">
                {loading ? "Publishing..." : `Publish Book with ${chapters.length} Chapters`}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

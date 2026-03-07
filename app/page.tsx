export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-teal-700">IAM Press</span>
          <span className="text-2xl">♾️</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-teal-700 transition-colors">Books</a>
          <a href="#" className="hover:text-teal-700 transition-colors">Authors</a>
          <a href="#" className="hover:text-teal-700 transition-colors">Blog</a>
          <a href="#" className="hover:text-teal-700 transition-colors">Community</a>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-gray-600 hover:text-teal-700 transition-colors">
            Sign In
          </button>
          <button className="text-sm bg-teal-700 text-white px-4 py-2 rounded-full hover:bg-teal-800 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-8 py-24 bg-gradient-to-b from-teal-50 to-white">
        <div className="text-6xl mb-6">♾️</div>
        <h1 className="text-5xl font-bold text-gray-900 max-w-3xl leading-tight mb-6">
          Read freely.
          <span className="text-teal-700"> Write boldly.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
          IAM Press is a completely free and open platform where authors publish
          and readers read — no gatekeeping, no algorithms, no paywalls. Ever.
        </p>
        <div className="flex gap-4">
          <button className="bg-teal-700 text-white px-8 py-3 rounded-full text-base font-medium hover:bg-teal-800 transition-colors">
            Start Reading
          </button>
          <button className="border border-teal-700 text-teal-700 px-8 py-3 rounded-full text-base font-medium hover:bg-teal-50 transition-colors">
            Publish Your Book
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
          A platform built differently
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="text-4xl">📖</div>
            <h3 className="text-lg font-semibold text-gray-900">Free Forever</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Every book on IAM Press is free to read. No subscriptions,
              no credits, no paywalls. Knowledge belongs to everyone.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="text-4xl">✍️</div>
            <h3 className="text-lg font-semibold text-gray-900">Author Friendly</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              No gatekeeping. No AI detection. No account terminations.
              Publish your work and own it forever.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="text-4xl">🌍</div>
            <h3 className="text-lg font-semibold text-gray-900">Open to All</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              All genres, all languages, all authors. From technical guides
              to fiction — every voice deserves to be heard.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-700 text-white text-center px-8 py-20">
        <h2 className="text-3xl font-bold mb-4">Ready to share your story?</h2>
        <p className="text-teal-100 mb-8 text-lg max-w-xl mx-auto">
          Join IAM Press and publish your book for free today.
          Your readers are waiting.
        </p>
        <button className="bg-white text-teal-700 px-8 py-3 rounded-full font-medium hover:bg-teal-50 transition-colors">
          Start Publishing
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center px-8 py-8 text-sm text-gray-400 border-t border-gray-100">
        <p>IAM Press ♾️ — Built with love for authors and readers everywhere</p>
        <p className="mt-1">© 2026 IAM Press. Free forever.</p>
      </footer>

    </div>
  );
}
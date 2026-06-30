import { Link } from "react-router-dom"
import TaglineTyper from "../components/TaglineTyper"

const LandingLight = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl">🖨️</span>
          <h1 className="text-lg md:text-2xl font-bold" style={{ color: "#1a1a2e" }}>Print<span style={{ color: "#c0392b" }}>Drop</span></h1>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Link
            to="/login"
            className="hidden md:inline-block px-5 py-2.5 rounded-lg text-sm font-medium transition hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ color: "#1a1a2e", border: "1px solid #e5e7eb" }}
          >
            Track Job
          </Link>
          <Link
            to="/login"
            className="px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ color: "#1a1a2e", border: "1px solid #e5e7eb" }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#c0392b", color: "#fff" }}
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-12 pb-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(192,57,43,0.06) 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(192,57,43,0.05) 0%, transparent 70%)" }}></div>
        <div className="absolute top-20 right-20 w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(192,57,43,0.3)" }}></div>
        <div className="absolute top-40 left-24 w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(192,57,43,0.2)" }}></div>
        <div className="absolute bottom-20 left-1/3 w-4 h-4 rounded-full" style={{ backgroundColor: "rgba(192,57,43,0.25)" }}></div>

        <div
          className="px-4 py-1.5 rounded-full text-sm font-medium mb-6 z-10"
          style={{ backgroundColor: "#fdecea", color: "#c0392b", border: "1px solid rgba(192,57,43,0.2)" }}
        >
          🚀 The smartest way to receive print jobs from customers
        </div>

        {/* Pain points - with logos */}
        <div className="mb-6 z-10 text-center">
          <p className="text-xl md:text-2xl font-bold flex items-center justify-center gap-3 flex-wrap" style={{ color: "#9ca3af" }}>
            <span className="inline-flex items-center gap-1" style={{ textDecoration: "line-through" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1" style={{ textDecoration: "line-through" }}>
              <svg width="22" height="22" viewBox="0 0 24 18" fill="none"><path d="M21.6 2.4L12 9.6 2.4 2.4h19.2zM2.4 15.6V4.8l9.6 7.2 9.6-7.2v10.8H2.4z" fill="#EA4335"/></svg>
              Gmail
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1" style={{ textDecoration: "line-through" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#4285F4"><path d="M18 2h-8L4 8v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V8.83L10.83 4H18v16z"/></svg>
              USB
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1" style={{ textDecoration: "line-through" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF9800"><path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.22.99 2.2 2.2 2.2 1.21 0 2.2-.98 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/></svg>
              Pendrive
            </span>
          </p>
          <p className="text-lg font-bold mt-2" style={{ color: "#c0392b" }}>
            Focus on Printing, Not File Sharing.
          </p>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight z-10" style={{ color: "#1a1a2e" }}>
          Your Shop Deserves
          <span style={{ color: "#c0392b" }}> a Smarter Way to Print</span>
        </h2>

        <p className="text-lg mt-6 max-w-2xl z-10" style={{ color: "#6b7280" }}>
          Customers scan, upload files, and you print. No WhatsApp, no USB, no hassle. Get notification on your dashboard instantly.
        </p>

        {/* Typewriter */}
        <div className="mt-8 z-10">
          <TaglineTyper />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 z-10">
          <Link
            to="/register"
            className="px-8 py-4 rounded-xl font-bold text-lg transition hover:shadow-xl hover:scale-105 transform"
            style={{ backgroundColor: "#c0392b", color: "#fff" }}
          >
            Register Your Shop →
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl font-bold text-lg transition hover:scale-105 transform"
            style={{ backgroundColor: "#fff", color: "#1a1a2e", border: "1px solid #e5e7eb" }}
          >
            I have an account
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6" style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
        <div className="flex flex-wrap justify-center gap-12 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: "#c0392b" }}>500+</p>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Shops Registered</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: "#c0392b" }}>10K+</p>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Jobs Printed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: "#c0392b" }}>4.9★</p>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Shop Rating</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: "#1a1a2e" }}>
          How It Works
        </h3>
        <p className="text-center mb-14" style={{ color: "#6b7280" }}>Three simple steps to modernize your print shop</p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-8 rounded-2xl relative" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#c0392b", color: "#fff" }}>1</div>
            <div className="text-5xl mb-5 mt-2">📱</div>
            <h4 className="text-lg font-semibold mb-3" style={{ color: "#1a1a2e" }}>
              Customer Scans QR
            </h4>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Stick QR on your counter. Customer scans with phone — no app download needed.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl relative" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#c0392b", color: "#fff" }}>2</div>
            <div className="text-5xl mb-5 mt-2">📄</div>
            <h4 className="text-lg font-semibold mb-3" style={{ color: "#1a1a2e" }}>
              Upload Files
            </h4>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              PDF, Word, Images, PPT — customer selects copies, color, size and uploads.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl relative" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#c0392b", color: "#fff" }}>3</div>
            <div className="text-5xl mb-5 mt-2">🖨️</div>
            <h4 className="text-lg font-semibold mb-3" style={{ color: "#1a1a2e" }}>
              You Print
            </h4>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Get instant notification. Download files, set price, and print!
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ backgroundColor: "#fff" }}>
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: "#1a1a2e" }}>
          Why Shopkeepers Love It
        </h3>
        <p className="text-center mb-14" style={{ color: "#6b7280" }}>Built for real print shops, not tech companies</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-4 p-6 rounded-xl" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e5e7eb" }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: "#fdecea" }}>
              ⚡
            </div>
            <div>
              <h4 className="font-semibold text-lg" style={{ color: "#1a1a2e" }}>Instant Jobs</h4>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Real-time notifications when customer uploads files</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-xl" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e5e7eb" }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: "#fdecea" }}>
              🔒
            </div>
            <div>
              <h4 className="font-semibold text-lg" style={{ color: "#1a1a2e" }}>Auto Cleanup</h4>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Files auto-delete after completion — privacy first</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-xl" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e5e7eb" }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: "#fef3e2" }}>
              💰
            </div>
            <div>
              <h4 className="font-semibold text-lg" style={{ color: "#1a1a2e" }}>Set Your Price</h4>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>You decide the price for each job — full control</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-xl" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e5e7eb" }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: "#fdecea" }}>
              📊
            </div>
            <div>
              <h4 className="font-semibold text-lg" style={{ color: "#1a1a2e" }}>Track Everything</h4>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Dashboard shows all jobs — pending, printing, ready, done</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#fdecea" }}>
        <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1a1a2e" }}>
          Ready to modernize your shop?
        </h3>
        <p className="mb-8 text-lg" style={{ color: "#6b7280" }}>
          Join hundreds of print shops already using PrintDrop
        </p>
        <Link
          to="/register"
          className="px-10 py-4 rounded-xl font-bold text-lg transition hover:shadow-xl hover:scale-105 transform inline-block"
          style={{ backgroundColor: "#c0392b", color: "#fff" }}
        >
          Get Started Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center" style={{ backgroundColor: "#1a1a2e" }}>
        <p className="text-lg font-semibold mb-2" style={{ color: "#fff" }}>🖨️ PrintDrop</p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>QR-based print management for modern shops</p>
        <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>© 2025 PrintDrop. All rights reserved.</p>
        <p className="text-sm mt-3 text-right" style={{ color: "rgba(255,255,255,0.5)" }}>
          Created by <span className="font-medium" style={{ color: "#a4b4a0ff" }}>Anuj Singhal❤️</span>
        </p>
        
      </footer>
    </div>
  )
}

export default LandingLight

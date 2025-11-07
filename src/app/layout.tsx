import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Fantasy Streamer HQ",
  description: "Waiver & Streamer assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full bg-gray-950 text-gray-100">
        <div className="flex min-h-screen">
          {/* Single Sidebar */}
          <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800">
            <div className="px-4 py-5 border-b border-gray-800">
              <h1 className="text-xl font-bold">🏈 Streamer HQ</h1>
              <p className="text-xs text-gray-400">Fantasy Streamer Assistant</p>
            </div>
            <nav className="p-3 text-sm space-y-1">
              <Link href="/" className="block px-3 py-2 rounded hover:bg-gray-800">🏠 Home</Link>
              <Link href="/dashboard/waivers" className="block px-3 py-2 rounded hover:bg-gray-800">📊 Waivers</Link>
              <Link href="/dashboard/manual" className="block px-3 py-2 rounded hover:bg-gray-800">🧠 Manual</Link>
              <Link href="/dashboard/manual-data" className="block px-3 py-2 rounded hover:bg-gray-800">📝 Manual Data</Link>
              <Link href="/dashboard/weights" className="block px-3 py-2 rounded hover:bg-gray-800">⚙️ Weights</Link>
            </nav>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}

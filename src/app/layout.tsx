import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Fantasy Streamer HQ",
  description: "Advanced Fantasy Waiver & Streamer Tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-900 text-gray-100">
        <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
          <div className="p-5 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">🏈 Fantasy HQ</h1>
            <p className="text-sm text-gray-500">Streamer Dashboard</p>
          </div>

          <nav className="flex-1 p-3 space-y-2">
            <Link href="/dashboard/manual" className="block px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition">
              📋 Dashboard (Main)
            </Link>
            <Link href="/dashboard/manual-data" className="block px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition">
              ✏️ Manual Data Entry
            </Link>
            <Link href="/dashboard/waivers" className="block px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition">
              📊 Waiver Rankings
            </Link>
            <Link href="/dashboard/snapshots" className="block px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition">
              🕒 Weekly Snapshots
            </Link>
            <Link href="/dashboard/odds" className="block px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition">
              💰 Odds Feed
            </Link>
            <Link href="/dashboard/weather" className="block px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition">
              ☁️ Weather Feed
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-800 text-center text-xs text-gray-500">
            © 2025 Fantasy Streamer HQ
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto bg-gray-900">{children}</main>
      </body>
    </html>
  );
}

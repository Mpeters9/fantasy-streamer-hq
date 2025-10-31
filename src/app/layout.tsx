import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

export const metadata = {
  title: "Fantasy Streamer HQ",
  description: "Fantasy Streamer HQ — Streamer rankings, tools, and dashboards",
};

export const fetchCache = "force-no-store";
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 bg-gray-900 p-4 flex flex-col border-r border-gray-800">
          <h1 className="text-xl font-bold mb-6 text-center">🏈 Fantasy HQ</h1>
          <nav className="flex flex-col gap-3">
            <Link href="/" className="hover:text-blue-400">
              🏠 Dashboard Home
            </Link>
            <Link href="/dashboard/manual" className="hover:text-blue-400">
              🧠 Manual Entry
            </Link>
            <Link href="/dashboard/streamers" className="hover:text-blue-400">
              ⚙️ Streamers API (WIP)
            </Link>
          </nav>
          <div className="mt-auto pt-4 border-t border-gray-800 flex justify-center">
            <ThemeToggle />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </body>
    </html>
  );
}

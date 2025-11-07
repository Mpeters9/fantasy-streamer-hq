import Sidebar from "@/components/sidebar";

export const metadata = {
  title: "Fantasy Streamer HQ",
  description: "Streamer Dashboard for Fantasy HQ",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Single unified sidebar */}
      <Sidebar />

      {/* All pages render here */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

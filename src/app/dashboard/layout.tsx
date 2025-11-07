import Sidebar from "@/components/sidebar";

export const metadata = {
  title: "Fantasy Streamer HQ Dashboard",
  description: "Fantasy Streamer HQ internal dashboard and tools",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

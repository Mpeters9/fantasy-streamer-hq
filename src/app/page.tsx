export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">🏈 Fantasy Streamer HQ</h1>
        <p className="text-gray-400 mb-4">Launch the dashboard from the sidebar to get started.</p>
        <a href="/dashboard/manual" className="px-4 py-2 bg-blue-600 rounded shadow hover:bg-blue-700">Open Manual Dashboard</a>
      </div>
    </main>
  );
}

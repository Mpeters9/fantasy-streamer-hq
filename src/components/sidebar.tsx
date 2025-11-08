export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-gray-900/60 border-r border-gray-800 p-4 space-y-2">
      <a className="block px-3 py-2 rounded hover:bg-gray-800" href="/dashboard/manual">🧠 Manual Entry</a>
      <a className="block px-3 py-2 rounded hover:bg-gray-800" href="/dashboard/manual-data">📊 Manual Stats</a>
      <a className="block px-3 py-2 rounded hover:bg-gray-800" href="/dashboard/waivers">🚨 Waivers</a>
      <a className="block px-3 py-2 rounded hover:bg-gray-800" href="/dashboard/weights">⚙️ Weights</a>
    </aside>
  );
}

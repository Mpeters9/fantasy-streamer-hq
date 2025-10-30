export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Fantasy Streamer HQ</h1>
      <p className="text-gray-400 mb-6">
        Launch the dashboard from the sidebar or menu to get started.
      </p>
    </main>
  );
}

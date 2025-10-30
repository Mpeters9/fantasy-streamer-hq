export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">404 – Page Not Found</h1>
      <p className="text-gray-400 mt-2">
        Please check the URL and try again.
      </p>
    </div>
  );
}

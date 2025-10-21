import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
        Selamat Datang di Flowra 👋
      </h1>
      <p className="mt-4 text-gray-600 max-w-md">
        Flowra membantu kamu mengatur alur kerja dengan lebih mudah dan efisien.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="px-6 py-2 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
        >
          Daftar
        </Link>
      </div>
    </main>
  );
}

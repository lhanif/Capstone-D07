import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <div className="flex-1 relative">
        {/* Background sawah */}
        <Image
          src="/sawah.jpg" 
          alt="Latar Sawah"
          fill
          priority
          className="object-cover brightness-90"
        />

        <div className="absolute inset-0 bg-white/50"></div>

        <div className="absolute inset-0 flex flex-col justify-start p-10 lg:p-16 text-black bg-white/10 backdrop-blur-[1px]">
          <div className="mb-6 mt-[-20px]">
            <Image
              src="/capstone logo 2.png"
              alt="Flowra Logo"
              width={450}
              height={100}
              priority
              className="h-auto"
            />
          </div>
        </div>
      </div>

      <div
        className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 text-center"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
          <span className="text-blue-600">Irigasi Cerdas</span> untuk Sawah Produktif Anda
        </h1>

        <p className="mt-4 text-base sm:text-lg font-medium text-gray-600">
          Hemat air, hemat waktu, panen melimpah!
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-100 hover:text-blue-700 shadow-sm transition duration-300 ease-in-out"
          >
            Daftar
          </Link>
        </div>
      </div>
    </main>
  );
}

import { Footer } from "@/components/ui/Footer";
import Image from "next/image";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header dengan Logo */}
            <header className="w-full flex justify-start items-center pl-4 mb-6">
                <Image
                    src="/capstone logo 2.png" 
                    alt="Flowra Logo"
                    width={450}
                    height={31}
                    priority
                    className="h-auto w-[280px] sm:w-[300px] md:w-[400px] lg:w-[450px]"
                />

                <div className="flex gap-4 text-gray-700 ml-auto mr-12">
                    <a href="/dashboard" className="hover:underline">
                    Dashboard
                    </a>
                    <a href="/profile" className="hover:underline">
                    Profile
                    </a>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
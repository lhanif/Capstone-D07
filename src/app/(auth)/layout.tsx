import { Footer } from "@/components/ui/Footer";
import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="w-full flex justify-start pl-4 mb-6">
                <Image
                    src="/capstone logo 2.png" 
                    alt="Flowra Logo"
                    width={450}
                    height={31}
                    priority
                    className="h-auto w-[280px] sm:w-[300px] md:w-[400px] lg:w-[450px]"
                />
            </header>

            <main className="flex flex-col flex-grow mb-12 items-center justify-center px-4">
                {children}
            </main>

            <Footer />
        </div>
    );
}
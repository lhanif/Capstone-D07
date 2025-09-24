import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { User } from "lucide-react";

export default function ProfilePage() {
    return (
    <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="flex items-center px-6">
            {/* Logo */}
            <Image
                src="/capstone logo 2.png"
                alt="Flowra Logo"
                width={450}
                height={31}
                priority
                className="h-auto w-[280px] sm:w-[300px] md:w-[400px] lg:w-[450px]"
            />

            {/* Menu kanan */}
            <div className="flex gap-4 text-gray-700 ml-auto mr-8">
                <a href="/dashboard" className="hover:underline">
                Dashboard
                </a>
                <a href="/profile" className="hover:underline">
                Profile
                </a>
            </div>
        </header>

        {/* Profile Card */}
        <main className="flex-grow flex flex-col items-center py-10">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-black">Profile</h2>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kiri */}
            <Input label="Nama Depan" placeholder="Aurel" />
            <Input label="Email" placeholder="aurel123@gmail.com" />

            <Input label="Nama Belakang" placeholder="Zayyan" />
            <Input label="Kata Sandi Lama" type="password" placeholder="******" />

            <Input label="Nomor Telepon" placeholder="0823816312723" />
            <Input label="Kata Sandi Baru" type="password" placeholder="******" />
            </form>

            <div className="flex justify-end mt-10">
            <Button type="submit" className="bg-gray-200 !text-black text-sm px-12 border border-gray-300 shadow-lg hover:bg-gray-200 hover:shadow-lg">
                Ganti Password
            </Button>
            </div>
        </div>

        {/* Logout */}
        <div className="mt-10">
            <Button className="px-30">Logout</Button>
        </div>
        </main>
    </div>
    );
}

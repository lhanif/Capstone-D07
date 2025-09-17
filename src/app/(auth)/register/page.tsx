import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50">
            {/* Logo */}
            <div className="w-full flex justify-start pl-6">
                <Image
                    src="/capstone logo.png"
                    alt="Flowra Logo"
                    width={460}
                    height={31}
                    // className="h-10 w-auto"
                    priority
                />
            </div>
            

            <h1 className="font-semibold text-3xl font-poppins text-black mb-4">Selamat Datang!</h1>

            <AuthCard>
                <h2 className="text-xl font-semibold mb-6 text-center text-black">Sign Up</h2>

                <form className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nama Depan" placeholder="Masukkan nama depan anda" />
                    <Input label="Email" placeholder="Masukkan email anda" />
                    <Input label="Nama Belakang" placeholder="Masukkan nama belakang anda" />
                    <Input label="Kata Sandi" type="password" placeholder="Masukkan kata sandi anda" />
                    <Input label="Nomor Telepon" placeholder="Masukkan nomor telepon anda" />
                    <Input label="Konfirmasi Kata Sandi" type="password" placeholder="Masukkan kata sandi anda" />
                </div>

                <Button type="submit">Sign Up</Button>
                </form>

                <p className="text-sm text-center mt-4 text-gray-700">
                Sudah punya akun?{" "}
                <a href="/login" className="text-[#3091CD] hover:underline">
                    Masuk
                </a>
                </p>
            </AuthCard>

            <footer className="mt-6 text-sm text-gray-500">
                Copyright © 2025 Tim Capstone D07
            </footer>
        </div>
    );
}

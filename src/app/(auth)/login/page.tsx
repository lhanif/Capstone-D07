// src/app/(auth)/login/page.tsx
import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center w-full">
            <h1 className="font-semibold text-xl sm:text-2xl md:text-3xl font-poppins text-black mb-4">
                Selamat Datang Kembali!
            </h1>

            <AuthCard className="w-full max-w-md">
                <h2 className="text-xl font-semibold mb-6 text-center text-black">User Login</h2>

                <form className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-4">
                        <Input label="Email" placeholder="Masukkan email anda" />
                        <Input label="Kata Sandi" type="password" placeholder="Masukkan kata sandi anda" />
                    </div>
                    <Button type="submit">Login</Button>
                </form>

                <p className="text-sm text-center mt-4 text-gray-700">
                    Belum mendaftar?{" "}
                    <a href="/register" className="text-[#3091CD] hover:underline">
                        Daftar
                    </a>
                </p>
            </AuthCard>
        </div>
    );
}
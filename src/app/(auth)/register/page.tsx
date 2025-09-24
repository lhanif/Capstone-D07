import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50">
            {/* Logo */}
            <div className="w-full flex justify-start pl-6 mb-4">
                <Image
                    src="/capstone logo 2.png"
                    alt="Flowra Logo"
                    width={450}
                    height={31}
                    priority
                    className="h-auto w-[280px] sm:w-[300px] md:w-[400px] lg:w-[450px]"
                />
            </div>
            

            <h1 className="font-semibold text-2xl sm:text-3xl font-poppins text-black mb-4">Selamat Datang!</h1>

            <AuthCard className="w-full max-w-[700px]">
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

                    <Button type="submit" className="px-12">Sign Up</Button>
                </form>

                <p className="text-sm text-center mt-4 text-gray-700">
                    Sudah punya akun?{" "}
                    <a href="/login" className="text-[#3091CD] hover:underline">
                        Masuk
                    </a>
                </p>
            </AuthCard>
        </div>
    );
}

"use client";

import { useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Login berhasil!");
                // Simpan token ke localStorage (opsional, karena cookie juga sudah diset)
                localStorage.setItem("token", data.token);

                // Redirect ke dashboard (misal)
                window.location.href = "/dashboard";
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            console.error("Login error:", err);
            setMessage("❌ Terjadi kesalahan saat login");
        }
    };

    return (
        <div className="flex flex-col items-center w-full">
            <h1 className="font-semibold text-xl sm:text-2xl md:text-3xl font-poppins text-black mb-4">
                Selamat Datang Kembali!
            </h1>

            <AuthCard className="w-full max-w-md">
                <h2 className="text-xl font-semibold mb-6 text-center text-black">User Login</h2>

                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="Email"
                            name="email"
                            placeholder="Masukkan email anda"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            label="Kata Sandi"
                            name="password"
                            type="password"
                            placeholder="Masukkan kata sandi anda"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <Button type="submit">Login</Button>
                </form>

                {message && (
                    <p className="text-sm text-center mt-3 text-gray-700">{message}</p>
                )}

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

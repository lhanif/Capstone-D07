// src/app/(auth)/register/page.tsx
"use client";
import { useState } from "react";

import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nama_depan: "",
    nama_belakang: "",
    email: "",
    device_id: "",
    password: "",
    konfirmasi_password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) setMessage("✅ Registrasi berhasil!");
    else setMessage(`❌ ${data.error}`);
  };

  return (
    // HANYA konten spesifik untuk halaman ini
    <div className="flex flex-col items-center w-full">
      <h1 className="font-semibold text-2xl sm:text-3xl font-poppins text-black mb-4">
        Selamat Datang!
      </h1>

      <AuthCard className="w-full max-w-[700px]">
        <h2 className="text-xl font-semibold mb-6 text-center text-black">Sign Up</h2>

        {/* Tambahkan onSubmit dan name di setiap input */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Depan"
              name="nama_depan"
              placeholder="Masukkan nama depan anda"
              value={formData.nama_depan}
              onChange={handleChange}
            />
            <Input
              label="Nama Belakang"
              name="nama_belakang"
              placeholder="Masukkan nama belakang anda"
              value={formData.nama_belakang}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              placeholder="Masukkan email anda"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Device ID"
              name="device_id"
              placeholder="Masukkan ID device IoT anda"
              value={formData.device_id}
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
            <Input
              label="Konfirmasi Kata Sandi"
              name="konfirmasi_password"
              type="password"
              placeholder="Masukkan kata sandi anda"
              value={formData.konfirmasi_password}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" className="px-12">Sign Up</Button>
        </form>

        {message && (
          <p className="text-sm text-center mt-2 text-black">{message}</p>
        )}

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

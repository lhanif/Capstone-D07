// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabaseClient";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Cek user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Kata sandi salah" }, { status: 401 });
    }

    // Buat token JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        nama_depan: user.nama_depan,
        nama_belakang: user.nama_belakang,
        email: user.email,
        active_device_id: user.active_device_id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Simpan cookie supaya bisa dibaca client
    const res = NextResponse.json({ message: "Login berhasil", token });
    res.cookies.set("token", token, {
      path: "/",
      httpOnly: false, // ⬅️ harus false agar bisa dibaca Cookies.get()
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return res;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

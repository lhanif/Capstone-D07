import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama_depan, nama_belakang, email, device_id, password, konfirmasi_password } = body;

    if (!email || !password || !konfirmasi_password) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (password !== konfirmasi_password) {
      return NextResponse.json({ error: "Kata sandi tidak cocok" }, { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // ✅ Pastikan device_id sudah terdaftar agar tidak melanggar foreign key
    if (device_id) {
      const { data: existingDevice } = await supabase
        .from("devices")
        .select("device_id")
        .eq("device_id", device_id)
        .single();

      if (!existingDevice) {
        await supabase.from("devices").insert([{ device_id }]);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase.from("users").insert([
      {
        nama_depan,
        nama_belakang,
        email,
        active_device_id: device_id || null,
        password_hash: hashedPassword,
      },
    ]);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Gagal mendaftarkan user" }, { status: 500 });
    }

    return NextResponse.json({ message: "Registrasi berhasil" }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

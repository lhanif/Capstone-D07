import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
// Asumsi path ini benar, jika tidak, mohon disesuaikan.
import { supabase } from "@/lib/supabaseClient";

// Pastikan variabel lingkungan ini telah diatur
const JWT_SECRET = process.env.JWT_SECRET!;

export async function PUT(req: Request) {
  try {
    // Ambil token dari cookie
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Tidak ada token, akses ditolak" }, { status: 401 });
    }
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Token tidak valid atau kadaluarsa" }, { status: 401 });
    }
    // Mengubah console.log menjadi console.error agar lebih terlihat
    console.error(`[DEBUG] User ID dari Token: ${decoded.user_id}`); 

    // Ambil data request
    const body = await req.json();
    // LOG KRITIS: Tampilkan body request yang diterima server
    console.error("[DEBUG] Body Request Diterima:", body); 

    // PENTING: Mengganti password_lama dan password_baru
    // menjadi oldPassword dan newPassword agar sesuai dengan body request
    const { nama_depan, nama_belakang, email, active_device_id, oldPassword, newPassword } = body;

    // Ambil user dari DB
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("user_id, password_hash, email") 
      .eq("user_id", decoded.user_id)
      .single();

    if (userErr || !user) {
      console.error("User not found or DB error:", userErr);
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Data yang akan diupdate: Hanya sertakan field yang benar-benar disediakan di body request
    let updateData: any = {
      updated_at: new Date(),
    };

    if (nama_depan !== undefined) updateData.nama_depan = nama_depan;
    if (nama_belakang !== undefined) updateData.nama_belakang = nama_belakang;
    if (email !== undefined) updateData.email = email;
    if (active_device_id !== undefined) updateData.active_device_id = active_device_id;

    // --- LOGIC UPDATE PASSWORD ---
    // Cek apakah ada upaya perubahan sandi (menggunakan nama kunci baru)
    const tryingToChangePassword = oldPassword || newPassword;

    if (tryingToChangePassword) {
      // 1. VALIDASI: Jika ada upaya ubah sandi, KEDUA field wajib diisi dan sandi baru tidak boleh kosong
      if (!oldPassword || !newPassword || (typeof newPassword === 'string' && newPassword.trim() === '')) {
        return NextResponse.json(
          { error: "Untuk mengubah sandi, harap isi Kata Sandi Lama dan Kata Sandi Baru (tidak boleh kosong)." },
          { status: 400 }
        );
      }

      // 2. VERIFIKASI: Bandingkan password lama yang dimasukkan dengan hash di DB
      if (!user.password_hash) {
         console.error(`[CRITICAL] Sandi hash tidak ditemukan di DB untuk user ${decoded.user_id}. Pastikan kolom ini TIDAK NULL.`);
         return NextResponse.json({ error: "Gagal memverifikasi sandi. Sandi hash tidak ditemukan." }, { status: 500 });
      }
      
      // Mengubah console.log menjadi console.error agar lebih terlihat
      console.error(`[DEBUG] Kehadiran password_hash dari DB: ${!!user.password_hash}`); 

      // Membandingkan oldPassword yang dikirim dengan hash di DB
      const match = await bcrypt.compare(oldPassword, user.password_hash);
      
      // Mengubah console.log menjadi console.error agar lebih terlihat
      console.error(`[DEBUG] Hasil bcrypt.compare (Sandi Lama Benar?): ${match}`); // INI KRITIS

      if (!match) {
        // Jika password lama salah, segera hentikan proses dan kembalikan error 400
        return NextResponse.json({ error: "Kata sandi lama salah" }, { status: 400 });
      }

      // 3. HASH: Hash password baru dan masukkan ke data update
      const hashedNew = await bcrypt.hash(newPassword, 10);
      updateData.password_hash = hashedNew;
    }
    // --- AKHIR LOGIC UPDATE PASSWORD ---

    // Mengubah console.log menjadi console.error agar lebih terlihat
    console.error("[DEBUG] Payload Final untuk Update DB:", updateData);

    // Update user di DB
    const { error: updateErr } = await supabase
      .from("users")
      .update(updateData)
      .eq("user_id", decoded.user_id);

    if (updateErr) {
      console.error("Supabase Update Error:", updateErr);
      
      // Penanganan error duplikasi email 
      if (updateErr.code === '23505' && updateErr.message.includes('email')) {
        return NextResponse.json({ error: "Email sudah digunakan oleh pengguna lain." }, { status: 409 });
      }

      return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 });
    }

    return NextResponse.json({ message: "Profil berhasil diperbarui" }, { status: 200 });
  } catch (err) {
    console.error("Update profile error (Catch Block):", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

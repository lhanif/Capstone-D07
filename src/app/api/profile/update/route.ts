import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
// Asumsi path ini benar, jika tidak, mohon disesuaikan.
import { supabase } from "@/lib/supabaseClient";

// 1. Definisikan tipe untuk payload JWT
interface DecodedToken extends JwtPayload {
    user_id: string; // Asumsi 'user_id' selalu ada dan bertipe string
}

// 2. Definisikan tipe untuk data yang akan diupdate (memperbaiki error any di baris 51)
interface UpdatePayload {
    updated_at: Date;
    nama_depan?: string;
    nama_belakang?: string;
    email?: string;
    active_device_id?: string;
    password_hash?: string;
    [key: string]: unknown; // Memungkinkan properti lain untuk fleksibilitas
}


// Pastikan variabel lingkungan ini telah diatur
const JWT_SECRET = process.env.JWT_SECRET!;

export async function PUT(req: Request) {
    // Memperbaiki error 'any' pada catch block (meskipun di baris akhir, ini praktik terbaik)
    try {
        // Ambil token dari cookie
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Tidak ada token, akses ditolak" }, { status: 401 });
        }
        
        // Memperbaiki Error: Unexpected any. Specify a different type. (Baris 20)
        let decoded: DecodedToken;
        try {
            // jwt.verify mengembalikan DecodedToken, jadi kita type cast di sini
            decoded = jwt.verify(token, JWT_SECRET) as DecodedToken; 
        } catch (error) { // Memperbaiki warning 'err' is defined but never used (Baris 23)
            return NextResponse.json({ error: "Token tidak valid atau kadaluarsa" }, { status: 401 });
        }
        
        console.error(`[DEBUG] User ID dari Token: ${decoded.user_id}`); 

        // Ambil data request
        const body = await req.json();
        console.error("[DEBUG] Body Request Diterima:", body); 

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
        // Memperbaiki Error: 'updateData' is never reassigned. Use 'const' instead. (Baris 51)
        // Memperbaiki Error: Unexpected any. Specify a different type. (Baris 51)
        const updateData: UpdatePayload = { 
            updated_at: new Date(),
        };

        if (nama_depan !== undefined) updateData.nama_depan = nama_depan;
        if (nama_belakang !== undefined) updateData.nama_belakang = nama_belakang;
        if (email !== undefined) updateData.email = email;
        if (active_device_id !== undefined) updateData.active_device_id = active_device_id;

        // --- LOGIC UPDATE PASSWORD ---
        const tryingToChangePassword = oldPassword || newPassword;

        if (tryingToChangePassword) {
            // 1. VALIDASI
            if (!oldPassword || !newPassword || (typeof newPassword === 'string' && newPassword.trim() === '')) {
                return NextResponse.json(
                    { error: "Untuk mengubah sandi, harap isi Kata Sandi Lama dan Kata Sandi Baru (tidak boleh kosong)." },
                    { status: 400 }
                );
            }

            // 2. VERIFIKASI
            if (!user.password_hash) {
                console.error(`[CRITICAL] Sandi hash tidak ditemukan di DB untuk user ${decoded.user_id}. Pastikan kolom ini TIDAK NULL.`);
                return NextResponse.json({ error: "Gagal memverifikasi sandi. Sandi hash tidak ditemukan." }, { status: 500 });
            }
            
            console.error(`[DEBUG] Kehadiran password_hash dari DB: ${!!user.password_hash}`); 

            // Membandingkan oldPassword yang dikirim dengan hash di DB
            const match = await bcrypt.compare(oldPassword, user.password_hash);
            
            console.error(`[DEBUG] Hasil bcrypt.compare (Sandi Lama Benar?): ${match}`); // INI KRITIS

            if (!match) {
                return NextResponse.json({ error: "Kata sandi lama salah" }, { status: 400 });
            }

            // 3. HASH
            const hashedNew = await bcrypt.hash(newPassword, 10);
            updateData.password_hash = hashedNew;
        }
        // --- AKHIR LOGIC UPDATE PASSWORD ---

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
        
    } catch (err: unknown) { // Mengubah (err) menjadi (err: unknown)
        console.error("Update profile error (Catch Block):", err);
        // Memperbaiki error: Agar dapat mengakses 'message', kita perlu type check
        let errorMessage = "Terjadi kesalahan server";
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err) {
             errorMessage = (err as { message: string }).message; 
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

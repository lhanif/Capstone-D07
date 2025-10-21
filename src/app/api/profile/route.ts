import { NextResponse } from "next/server";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { supabase } from "@/lib/supabaseClient";

// Tentukan tipe data yang diharapkan dari payload JWT dan database
// Ini mengatasi Error: Unexpected any. Specify a different type. (Baris 15 dan 43)
interface UserProfilePayload extends JwtPayload {
  nama_depan?: string;
  nama_belakang?: string;
  email?: string;
  active_device_id?: string;
  // Gunakan tipe yang lebih fleksibel untuk properti yang tidak terdefinisi
  [key: string]: unknown; 
}

interface ProfileData {
  nama_depan: string;
  nama_belakang: string;
  email: string;
  active_device_id: string;
  oldPassword: ""; // Ini tampaknya hanya untuk UI, tapi kita pertahankan tipenya
  newPassword: ""; // Ini tampaknya hanya untuk UI, tapi kita pertahankan tipenya
  // Properti tambahan dari tabel 'users' akan digabungkan di sini
  [key: string]: unknown; 
}

export async function GET(req: Request) {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    // Menggunakan interface yang sudah dibuat
    const decoded: UserProfilePayload = jwtDecode(token);

    // Ambil data default dari JWT
    let data: ProfileData = {
      // Menggunakan tipe assertion untuk memastikan nilai ada atau string kosong
      nama_depan: (decoded.nama_depan as string) || "",
      nama_belakang: (decoded.nama_belakang as string) || "",
      email: (decoded.email as string) || "",
      active_device_id: (decoded.active_device_id as string) || "",
      oldPassword: "",
      newPassword: "",
    };

    // Jika ingin fetch data tambahan dari Supabase, misal user profile lengkap
    const { data: userProfile, error } = await supabase
      .from("users") // sesuaikan nama tabel
      .select("*")
      .eq("email", data.email)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = row not found
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (userProfile) {
      // Menggabungkan data dari userProfile ke objek 'data'
      data = { ...data, ...userProfile } as ProfileData;
    }

    return NextResponse.json({ success: true, data });
    
  } catch (err: unknown) {
    // Memperbaiki Error: Unexpected any. Specify a different type. (Baris 43)
    let errorMessage = "Something went wrong";
    if (err instanceof Error) {
        errorMessage = err.message;
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
        // Ini untuk menangani Supabase/JWT Decode error yang mungkin tidak selalu merupakan instance dari Error
        errorMessage = (err as { message: string }).message; 
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

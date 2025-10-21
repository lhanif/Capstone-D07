import { NextResponse } from "next/server";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { supabase } from "@/lib/supabaseClient";

// 1. Tentukan interface untuk tipe data yang diharapkan dari JWT
interface DecodedToken extends JwtPayload {
  user_id: string; // ID pengguna dari tabel auth.users
  email: string;
  active_device_id: string | null; // ID perangkat yang sedang aktif (penting!)
}

// GET endpoint untuk mengambil data sensor berdasarkan active_device_id pengguna
export async function GET(req: Request) {
  // Ambil token dari header Authorization
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Tidak ada token otentikasi" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let decoded: DecodedToken;

  try {
    // 2. Decode JWT untuk mendapatkan active_device_id
    decoded = jwtDecode<DecodedToken>(token);
  } catch (err) {
    console.error("JWT Decode Error:", err);
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }

  const activeDeviceId = decoded.active_device_id;

  if (!activeDeviceId) {
    return NextResponse.json({ 
        message: "Pengguna tidak memiliki perangkat aktif yang dipilih.", 
        data: [] 
    }, { status: 200 });
  }
  
  // 3. Query Supabase: Ambil semua data dari tabel sensor_data
  const { data: sensorHistory, error } = await supabase
    .from("sensor_data")
    .select("*")
    .eq("device_id", activeDeviceId)
    // Urutkan berdasarkan waktu terbaru (timestamp)
    .order("timestamp", { ascending: false }); 

  if (error) {
    console.error("Supabase Query Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data sensor." }, { status: 500 });
  }

  return NextResponse.json({ success: true, deviceId: activeDeviceId, data: sensorHistory });
}

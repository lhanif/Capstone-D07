import { NextResponse } from "next/server";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { supabase } from "@/lib/supabaseClient";

interface DecodedToken extends JwtPayload {
  user_id: string;
  email: string;
  active_device_id: string | null;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Tidak ada token otentikasi" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let decoded: DecodedToken;

  try {
    decoded = jwtDecode<DecodedToken>(token);
  } catch (err) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }

  const activeDeviceId = decoded.active_device_id;

  if (!activeDeviceId) {
    return NextResponse.json(
      { message: "Pengguna tidak memiliki perangkat aktif.", data: null },
      { status: 200 }
    );
  }

  const { data, error } = await supabase
    .from("sensor_data")
    .select("*")
    .eq("device_id", activeDeviceId)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Supabase Query Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data terbaru." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    device_id: activeDeviceId,
    latest: data,
  });
}

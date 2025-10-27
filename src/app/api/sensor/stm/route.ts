import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/sensor/stm?device_id=STM_004
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("device_id");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Parameter 'device_id' wajib disertakan" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("device_status")
      .select("is_rain, servo_1_open, servo_2_open, servo_3_open, servo_4_open")
      .eq("device_id", deviceId)
      .single(); // ambil 1 baris saja

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data dari Database" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Device tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

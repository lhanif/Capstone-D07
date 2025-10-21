// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded: JwtPayload & { [key: string]: any } = jwtDecode(token);

    // Ambil data default dari JWT
    let data = {
      nama_depan: decoded.nama_depan || "",
      nama_belakang: decoded.nama_belakang || "",
      email: decoded.email || "",
      active_device_id: decoded.active_device_id || "",
      oldPassword: "",
      newPassword: "",
    };

    // Jika ingin fetch data tambahan dari Supabase, misal user profile lengkap
    const { data: userProfile, error } = await supabase
      .from("users") // sesuaikan nama tabel
      .select("*")
      .eq("email", decoded.email)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = row not found
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (userProfile) {
      data = { ...data, ...userProfile };
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}

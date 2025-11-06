import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient"; 
// Pastikan path "@/lib/supabaseClient" sudah benar

/**
 * Endpoint untuk mendapatkan status perangkat berdasarkan device_id.
 * Menggunakan metode GET. device_id biasanya dilewatkan melalui query parameters.
 * URL Contoh: /api/get-status?deviceId=STM_004
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // 1. Ambil device_id dari query parameter
        const deviceId = searchParams.get('deviceId');

        // 2. Validasi Input
        if (!deviceId) {
            return NextResponse.json(
                { message: "Query parameter 'deviceId' wajib diisi." },
                { status: 400 }
            );
        }
        
        // Asumsi nama tabel Anda adalah 'device_status'
        const TABLE_NAME = "device_status"; // Ganti dengan nama tabel Supabase Anda

        // 3. Proses Select/Fetch dari Supabase
        // Menggunakan .select('*') dengan klausa .eq() untuk filter 'device_id'
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                status_id,
                device_id,
                is_rain,
                servo_1_open,
                servo_2_open,
                servo_3_open,
                servo_4_open,
                last_updated
            `) // Ambil semua kolom status yang relevan
            .eq('device_id', deviceId)
            .limit(1) // Ambil hanya satu (yang terbaru/sesuai kebutuhan)
            .single(); // Gunakan .single() jika yakin hanya ada satu baris

        // 4. Penanganan Error dari Supabase
        if (error && error.code !== 'PGRST116') { // PGRST116 adalah "tidak ada data ditemukan" jika menggunakan .single()
            console.error("Supabase Error:", error);
            return NextResponse.json(
                { message: "Gagal mengambil status perangkat.", error: error.message },
                { status: 500 }
            );
        }
        
        // 5. Penanganan Jika device_id tidak ditemukan (error code PGRST116 dari .single() atau data null)
        if (!data) {
             return NextResponse.json(
                { message: `Status perangkat dengan device_id: ${deviceId} tidak ditemukan.` },
                { status: 404 }
            );
        }

        // 6. Respon Sukses
        return NextResponse.json(
            { 
                message: `Status perangkat ${deviceId} berhasil diambil.`,
                current_status: data // Mengembalikan data status tunggal
            },
            { status: 200 }
        );

    } catch (error) {
        // 7. Penanganan Error Umum
        console.error("General Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error." },
            { status: 500 }
        );
    }
}
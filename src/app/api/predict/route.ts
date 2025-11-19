import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { predictRandomForest, RFModelStructure } from '@/lib/rf/rfInference'; 
import { supabase } from '@/lib/supabaseClient'; 

// --- KONFIGURASI PENTING ---
const TARGET_DEVICE_ID = "STM_004"; 
const MODEL_FILENAME = 'rf_model.json.gz';
// Path diakses dari root proyek (process.cwd()) menuju folder public/
const modelPath = path.join(process.cwd(), 'public', MODEL_FILENAME); 
// ----------------------------

// Variabel global untuk menyimpan model setelah dimuat
let rfModelData: RFModelStructure | null = null;

/**
 * Memuat dan mendekompensasi model Gzip dari disk.
 * Fungsi ini dijalankan hanya sekali saat server cold start.
 */
function loadModel(): RFModelStructure | null {
    if (rfModelData) return rfModelData;
    
    try {
        // 1. Baca file Gzip sebagai Buffer
        const gzippedBuffer = fs.readFileSync(modelPath); 
        
        // 2. Dekompresi Buffer menggunakan zlib
        const jsonString = zlib.gunzipSync(gzippedBuffer).toString('utf-8'); 
        
        // 3. Parse JSON menjadi struktur model
        rfModelData = JSON.parse(jsonString) as RFModelStructure; 
        
        console.log(`[API/PREDICT] Model Gzip (${MODEL_FILENAME}) berhasil dimuat dan didekompresi.`);
        return rfModelData;
    } catch (e) {
        console.error(`[API/PREDICT] Kesalahan fatal saat memuat model: ${e}`);
        console.error("Pastikan file GZIP ada di folder public/");
        return null;
    }
}

/**
 * Route Handler untuk metode HTTP POST
 * Endpoint: /api/predict
 */
export async function POST(request: Request) {
    // 1. Muat Model (Ini akan memuat model jika belum dimuat)
    const model = loadModel();
    if (!model) {
        return NextResponse.json({ error: 'Model inferensi tidak tersedia di server.' }, { status: 500 });
    }

    // 2. Ambil Input (Hanya Suhu dan Kelembapan)
    const body = await request.json();
    const { temperature, humidity } = body; 

    // Validasi
    if (typeof temperature !== 'number' || typeof humidity !== 'number') {
        return NextResponse.json({ error: 'Input temperature dan humidity wajib diisi dan harus numerik.' }, { status: 400 });
    }

    // 3. Lakukan Prediksi
    const prediction = predictRandomForest(model, temperature, humidity);
    const newIsRainStatus = prediction === 'Hujan'; 

    try {
        // 4. Update Database Supabase
        const { data, error } = await supabase
            .from('device_status') 
            .update({ is_rain: newIsRainStatus })
            .eq('device_id', TARGET_DEVICE_ID) // Target STM_004
            .select()
            .single();
        
        if (error) {
            console.error('Supabase Update Error:', error);
            throw new Error(error.message || 'Gagal memperbarui status di database.');
        }

        // 5. Kembalikan Status Terbaru dari DB
        return NextResponse.json({ 
            prediksi_cuaca: prediction,
            is_rain_updated: newIsRainStatus,
            current_status: data, // Status lengkap perangkat yang baru di-update
            status: 'success'
        });
        
    } catch (error: unknown) { // Perbaikan: Menggunakan 'unknown' untuk catch
        let errorMessage = "Terjadi kesalahan server saat memproses update.";
        
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message; 
        }

        console.error("Error Prediksi dan Update Status:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
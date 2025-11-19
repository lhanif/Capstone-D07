import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { predictRandomForest } from '@/lib/rf/rfInference'; 
import { supabase } from '@/lib/supabaseClient'; 

// --- PENTING: Tentukan Device ID di sini ---
const TARGET_DEVICE_ID = "STM_004"; 
// ------------------------------------------

// --- Pemuatan Model ---
const MODEL_FILENAME = 'rf_model.json';
const modelPath = path.join(process.cwd(), 'public', MODEL_FILENAME); 

let rfModelData: any = null;

function loadModel() {
    if (rfModelData) return rfModelData;
    try {
        const jsonString = fs.readFileSync(modelPath, 'utf-8');
        rfModelData = JSON.parse(jsonString);
        return rfModelData;
    } catch (e) {
        console.error("Kesalahan saat memuat model JSON:", e);
        return null;
    }
}

/**
 * Route Handler untuk metode HTTP POST
 * Endpoint: /api/predict
 * Input hanya membutuhkan temperature dan humidity
 */
export async function POST(request: Request) {
    // 1. Muat Model
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
        // 4. Update Database Supabase (Menggunakan TARGET_DEVICE_ID yang sudah ditentukan)
        const { data, error } = await supabase
            .from('device_status') // Ganti dengan nama tabel status Anda
            .update({ is_rain: newIsRainStatus })
            .eq('device_id', TARGET_DEVICE_ID) // Menggunakan ID yang di-hardcode
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
            current_status: data,
            status: 'success'
        });
        
    } catch (error: any) {
        console.error("Error Prediksi dan Update Status:", error);
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan server saat memproses update.' }, { status: 500 });
    }
}
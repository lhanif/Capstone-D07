import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// POST endpoint untuk menerima data dari STM32 (Format String Gabungan)
export async function POST(req: NextRequest) {
  try {
    const deviceId = req.headers.get("device-id");
    if (!deviceId) {
      return NextResponse.json({ error: "Device ID missing" }, { status: 400 });
    }

    const body = await req.json();
    
    // Ambil properti sesuai format baru
    // ultrasonic: "20;21.32;32;25"
    // soil_moisture: "50;51;52;53"
    const { ultrasonic, soil_moisture, temperature, humidity } = body;

    // --- LOGIC PARSING STRING BARU ---
    
    // Fungsi pembantu untuk parsing dan mengkonversi ke float, mengembalikan array
    const parseSensorString = (str: string | undefined): (number | null)[] => {
      if (!str) return [null, null, null, null];
      // Pisahkan string berdasarkan semicolon (;), lalu konversi ke float
      const parts = str.split(';');
      return parts.map(p => {
        const num = parseFloat(p.trim());
        // Memastikan hanya angka valid yang dimasukkan, selain itu return null
        return isNaN(num) ? null : num;
      });
    };

    const ultrasonicValues = parseSensorString(ultrasonic);
    const moistureValues = parseSensorString(soil_moisture);

    // --- END LOGIC PARSING STRING BARU ---

    // Konversi temperature dan humidity menjadi float
    const tempValue = parseFloat(temperature);
    const humValue = parseFloat(humidity);

    const { error } = await supabase.from("sensor_data").insert([
      {
        device_id: deviceId,
        // Mapping dari array hasil parsing
        ultrasonic_1: ultrasonicValues[0] ?? null,
        ultrasonic_2: ultrasonicValues[1] ?? null,
        ultrasonic_3: ultrasonicValues[2] ?? null,
        ultrasonic_4: ultrasonicValues[3] ?? null,
        soil_moisture_1: moistureValues[0] ?? null,
        soil_moisture_2: moistureValues[1] ?? null,
        soil_moisture_3: moistureValues[2] ?? null,
        soil_moisture_4: moistureValues[3] ?? null,
        // Mapping untuk nilai tunggal
        temperature: isNaN(tempValue) ? null : tempValue,
        humidity: isNaN(humValue) ? null : humValue,
      },
    ]);

    if (error) throw error;

    // Log aktivitas (tetap dilakukan)
    await supabase.from("device_logs").insert([
      {
        device_id: deviceId,
        action_type: "NEW_DATA",
        description: "Data sensor diterima (String Parsing)",
      },
    ]);

    return NextResponse.json({ message: "Data saved successfully" }, { status: 201 });
    
  } catch (err: unknown) { // FIX: Mengganti 'any' dengan 'unknown'
    let errorMessage = "An unknown error occurred.";
    
    // Logic untuk mendapatkan pesan error yang aman dari tipe 'unknown'
    if (err instanceof Error) {
        errorMessage = err.message;
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as { message: string }).message; 
    }

    console.error(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

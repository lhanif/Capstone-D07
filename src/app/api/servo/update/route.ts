import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabaseClient"; 

interface UpdatePayload {
  device_id: string;
  is_rain: boolean;
  servo_1_open: boolean;
  servo_2_open: boolean;
  servo_3_open: boolean;
  servo_4_open: boolean;
}

export async function POST(request: Request) {
  try {
    const body: UpdatePayload = await request.json();
    
    const { 
      device_id, 
      is_rain, 
      servo_1_open, 
      servo_2_open, 
      servo_3_open, 
      servo_4_open 
    } = body;

    if (!device_id) {
      return NextResponse.json(
        { message: "Parameter 'device_id' wajib diisi." },
        { status: 400 }
      );
    }
    

    const updateData = {
      is_rain: is_rain,
      servo_1_open: servo_1_open,
      servo_2_open: servo_2_open,
      servo_3_open: servo_3_open,
      servo_4_open: servo_4_open,
      // Secara opsional, tambahkan waktu update otomatis
      last_updated: new Date().toISOString(),
    };
    
    const TABLE_NAME = "device_status"; 

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('device_id', device_id)
      .select(); 

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { message: "Gagal memperbarui status perangkat.", error: error.message },
        { status: 500 }
      );
    }
    
    if (!data || data.length === 0) {
        return NextResponse.json(
            { message: `Tidak ada perangkat dengan device_id: ${device_id} yang ditemukan untuk diperbarui.` },
            { status: 404 }
        );
    }

    return NextResponse.json(
      { 
        message: `Status perangkat ${device_id} berhasil diperbarui.`,
        updated_data: data[0] 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("General Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
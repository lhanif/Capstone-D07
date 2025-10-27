import { NextResponse } from "next/server";

// Dummy data (nanti bisa diganti ambil dari database PostgreSQL, Prisma, dll)
const sensorData = [
  {
    idx: 0,
    status_id: "175549c8-2d55-412b-b24a-1eff93e2e967",
    device_id: "12345",
    is_rain: false,
    servo_1_open: false,
    servo_2_open: false,
    servo_3_open: false,
    servo_4_open: false,
    last_updated: "2025-10-21 10:13:40.886673+00",
  },
  {
    idx: 1,
    status_id: "8a34b864-e791-44ae-8411-44d0dbd23fbd",
    device_id: "STM_004",
    is_rain: false,
    servo_1_open: false,
    servo_2_open: false,
    servo_3_open: false,
    servo_4_open: false,
    last_updated: "2025-10-21 12:53:35.704037+00",
  },
  {
    idx: 2,
    status_id: "95898575-f1e9-47ac-be3a-3ef387fb687a",
    device_id: "STM_0044",
    is_rain: false,
    servo_1_open: false,
    servo_2_open: false,
    servo_3_open: false,
    servo_4_open: false,
    last_updated: "2025-10-20 19:55:37.075314+00",
  },
  {
    idx: 3,
    status_id: "e719f06c-09c5-43bf-96c9-d527d0dd25fb",
    device_id: "STM_003",
    is_rain: false,
    servo_1_open: false,
    servo_2_open: false,
    servo_3_open: false,
    servo_4_open: false,
    last_updated: "2025-10-20 19:55:02.404613+00",
  },
];

// Handler GET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("device_id");

  if (!deviceId) {
    return NextResponse.json(
      { error: "device_id query parameter is required" },
      { status: 400 }
    );
  }

  // Cari data berdasarkan device_id
  const data = sensorData.find((item) => item.device_id === deviceId);

  if (!data) {
    return NextResponse.json(
      { error: "Device not found" },
      { status: 404 }
    );
  }

  // Ambil hanya field yang diminta
  const result = {
    device_id: data.device_id,
    is_rain: data.is_rain,
    servo_1_open: data.servo_1_open,
    servo_2_open: data.servo_2_open,
    servo_3_open: data.servo_3_open,
    servo_4_open: data.servo_4_open,
  };

  return NextResponse.json(result);
}

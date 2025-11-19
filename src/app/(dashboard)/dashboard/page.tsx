"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/ui/Header";
import { FieldCard } from "@/components/FieldCard";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarModal } from "@/components/ui/CalendarModal";
import "swiper/swiper.css";
import { CalendarDays } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import HistoryChart from "@/components/HistoryChart";
import toast from "react-hot-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface StatusData {
  device_id: string;
  is_rain: boolean;
  servo_1_open: boolean;
  servo_2_open: boolean;
  servo_3_open: boolean;
  servo_4_open: boolean;
  [key: string]: unknown;
}

const DEFAULT_STATUS: StatusData = {
  device_id: "STM_004",

  is_rain: false,
  servo_1_open: false,
  servo_2_open: false,
  servo_3_open: false,
  servo_4_open: false,
};

interface SensorData {
  data_id: string;
  device_id: string;
  timestamp: string;
  ultrasonic_1: number;
  ultrasonic_2: number;
  ultrasonic_3: number;
  ultrasonic_4: number;
  soil_moisture_1: number;
  soil_moisture_2: number;
  soil_moisture_3: number;
  soil_moisture_4: number;
  temperature: number;
  humidity: number;
}

export default function DashboardPage() {
  const [date, setDate] = useState<Value>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [deviceStatus, setDeviceStatus] = useState<StatusData>(DEFAULT_STATUS);
  const [isLoading, setIsLoading] = useState(true);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceStatus = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/servo/read?deviceId=STM_004`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Gagal memuat status awal perangkat."
          );
        }

        const data = await response.json();

        if (data && data.current_status) {
          setDeviceStatus(data.current_status);
        } else {
          throw new Error("Format data yang dikembalikan tidak valid.");
        }
      } catch (error: unknown) {
        console.error("Fetch Status Error:", error);

        let errorMessage = "Kesalahan tidak diketahui.";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        toast.error(`Error memuat data: ${errorMessage}`);

        setDeviceStatus(DEFAULT_STATUS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeviceStatus();
  }, []);

  const handleStatusUpdate = (updatedData: StatusData) => {
    setDeviceStatus(updatedData);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchLatest() {
      const res = await fetch("/api/sensor/data/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      setLatestData(json.latest as SensorData);
      setDeviceId(json.latest.device_id);
    }

    fetchLatest();

    const channel: RealtimeChannel = supabase
      .channel("realtime_sensor")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_data",
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          console.log("DATA BARU MASUK:", payload);
          fetchLatest();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId]);

  useEffect(() => {
    if (latestData && latestData.temperature !== undefined && latestData.humidity !== undefined) {
      const runPredictionAndUpdateStatus = async () => {
        
        const predictionInput = {
          temperature: latestData.temperature,
          humidity: latestData.humidity,
        };

        try {
          const response = await fetch('/api/predict', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(predictionInput),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Gagal memperbarui status hujan dari model.");
          }

          const data = await response.json();

          if (data && data.current_status) {
            setDeviceStatus(data.current_status); 
          }

        } catch (error) {
          console.error("Error Prediksi Model:", error);
          toast.error("Gagal mendapatkan status hujan: Cek koneksi API.");
        }
      };

      runPredictionAndUpdateStatus();
    }
  }, [latestData]); 

  if (isLoading) return <p>Loading...</p>;
  if (!latestData) return <p>No data available</p>;

  const isRaining = deviceStatus.is_rain;
  const weatherEmoji = isRaining ? "🌧️" : "☀️";
  const weatherText = isRaining ? "Hujan" : "Tidak Hujan";

  return (
    <div className="p-4 w-full flex flex-col gap-4">
      <Header />
      <div className="flex-grow bg-[#F0F1F7] rounded-2xl p-6 overflow-y-auto">
        {isDesktop ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-md p-4 flex justify-center items-center">
                <Calendar
                  onChange={setDate}
                  value={date}
                  className="react-calendar-custom"
                />
              </div>
              <div className="flex-grow flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  {" "}
                  <div className="bg-white rounded-xl shadow-md p-10 text-center">
                    <p className="text-sm font-semibold text-gray-900 mb-4">
                      Suhu
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <p className="text-3xl font-bold text-gray-800">{latestData.temperature}°C</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-10 text-center">
                    <p className="text-sm font-semibold text-gray-900 mb-4">
                      Kelembaban
                    </p>
                    <p className="text-3xl font-bold text-gray-800">{latestData.humidity}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {" "}
                  <div className="bg-white rounded-xl shadow-md p-6 text-center col-span-2">
                    <p className="text-sm font-semibold text-gray-900 mb-4">
                      Prediksi Cuaca
                    </p>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl">{weatherEmoji}</span>
                      <p className="font-semibold text-gray-600">
                        {weatherText}
                      </p>
                      <p className="text-xs text-gray-500 mt-4">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  <FieldCard
                    title="Field 1"
                    soilMoisture={`${latestData.soil_moisture_1.toFixed(2)}`}
                    waterLevel={`${latestData.ultrasonic_1} cm`}
                    isActive={deviceStatus.servo_1_open}
                    deviceId="STM_004"
                    servoKey="servo_1_open"
                    currentStatus={deviceStatus}
                    onUpdateSuccess={handleStatusUpdate}
                  />
                  <FieldCard
                    title="Field 2"
                    soilMoisture={`${latestData.soil_moisture_2.toFixed(2)}`}
                    waterLevel={`${latestData.ultrasonic_2} cm`}
                    isActive={deviceStatus.servo_2_open}
                    deviceId="STM_004"
                    servoKey="servo_2_open"
                    currentStatus={deviceStatus}
                    onUpdateSuccess={handleStatusUpdate}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <FieldCard
                    title="Field 3"
                    soilMoisture={`${latestData.soil_moisture_3.toFixed(2)}`}
                    waterLevel={`${latestData.ultrasonic_3} cm`}
                    isActive={deviceStatus.servo_3_open}
                    deviceId="STM_004"
                    servoKey="servo_3_open"
                    currentStatus={deviceStatus}
                    onUpdateSuccess={handleStatusUpdate}
                  />
                  <FieldCard
                    title="Field 4"
                    soilMoisture={`${latestData.soil_moisture_4.toFixed(2)}`}
                    waterLevel={`${latestData.ultrasonic_4} cm`}
                    isActive={deviceStatus.servo_4_open}
                    deviceId="STM_004"
                    servoKey="servo_4_open"
                    currentStatus={deviceStatus}
                    onUpdateSuccess={handleStatusUpdate}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-mdflex flex-col flex-grow">
                <HistoryChart />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-6">
              {/* --- BLOK PREDIKSI CUACA (MOBILE - DILEBARKAN) --- */}
              {/* Menggunakan col-span-2 agar mengambil seluruh lebar baris ini */}
              <div className="bg-white rounded-2xl shadow p-4 text-center col-span-2"> 
                <p className="text-sm text-gray-500 mb-1">Prediksi Cuaca</p>
                <div className="flex flex-col items-center">
                  <span className="text-3xl">{weatherEmoji}</span>
                  <p className="font-semibold text-gray-800">{weatherText}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Suhu</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-3xl font-bold text-gray-800">{latestData.temperature}°C</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Kelembaban</p>
                <p className="text-3xl font-bold text-gray-800">{latestData.humidity}%</p>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-6">
              <div className="flex flex-col gap-4">
                <FieldCard
                  title="Field 1"
                  soilMoisture={`${latestData.soil_moisture_1.toFixed(2)}`}
                  waterLevel={`${latestData.ultrasonic_1} cm`}
                  isActive={deviceStatus.servo_1_open}
                  deviceId="STM_004"
                  servoKey="servo_1_open"
                  currentStatus={deviceStatus}
                  onUpdateSuccess={handleStatusUpdate}
                />
                <FieldCard
                  title="Field 2"
                  soilMoisture={`${latestData.soil_moisture_2.toFixed(2)}`}
                  waterLevel={`${latestData.ultrasonic_2} cm`}
                  isActive={deviceStatus.servo_2_open}
                  deviceId="STM_004"
                  servoKey="servo_2_open"
                  currentStatus={deviceStatus}
                  onUpdateSuccess={handleStatusUpdate}
                />
              </div>

              <div className="flex flex-col gap-4">
                <FieldCard
                  title="Field 3"
                  soilMoisture={`${latestData.soil_moisture_3.toFixed(2)}`}
                  waterLevel={`${latestData.ultrasonic_3} cm`}
                  isActive={deviceStatus.servo_3_open}
                  deviceId="STM_004"
                  servoKey="servo_3_open"
                  currentStatus={deviceStatus}
                  onUpdateSuccess={handleStatusUpdate}
                />
                <FieldCard
                  title="Field 4"
                  soilMoisture={`${latestData.soil_moisture_4.toFixed(2)}`}
                  waterLevel={`${latestData.ultrasonic_4} cm`}
                  isActive={deviceStatus.servo_4_open}
                  deviceId="STM_004"
                  servoKey="servo_4_open"
                  currentStatus={deviceStatus}
                  onUpdateSuccess={handleStatusUpdate}
                />
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl shadow-md p-2 h-96 flex flex-col">
                <div className="flex-grow flex items-center justify-center text-gray-400">
                  <HistoryChart />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- FLOATING CALENDAR BUTTON (Hanya Muncul di Mobile) --- */}
      {!isDesktop && (
        <>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50"
          >
            <CalendarDays size={24} />
          </button>
          <CalendarModal
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
            date={date}
            setDate={setDate}
          />
        </>
      )}
      {/* --- AKHIR FLOATING CALENDAR BUTTON --- */}
    </div>
  );
}
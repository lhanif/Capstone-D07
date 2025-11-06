"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/ui/Header";
import { FieldCard } from "@/components/FieldCard";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarModal } from "@/components/ui/CalendarModal";
import 'swiper/swiper.css';
import { CalendarDays } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import HistoryChart from "@/components/HistoryChart";
import toast from "react-hot-toast";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface StatusData {
    device_id: string;
    is_rain: boolean;
    servo_1_open: boolean;
    servo_2_open: boolean;
    servo_3_open: boolean;
    servo_4_open: boolean;
    [key: string]: any; 
}

const DEFAULT_STATUS: StatusData = {
    device_id: "STM_004", 
    
    is_rain: false,
    servo_1_open: false,
    servo_2_open: false,
    servo_3_open: false,
    servo_4_open: false,
    

}

export default function DashboardPage() {
    const [date, setDate] = useState<Value>(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 1024px)"); 
    const [deviceStatus, setDeviceStatus] = useState<StatusData>(DEFAULT_STATUS);
    const [isLoading, setIsLoading] = useState(true);

    // --- FUNGSI FETCH AWAL (Menggunakan API GET) ---
useEffect(() => {
        const fetchDeviceStatus = async () => {
            setIsLoading(true); // Mulai loading
            
            try {
                // PANGGIL API GET yang sesungguhnya
                const response = await fetch(`/api/servo/read?deviceId=STM_004`); 
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Gagal memuat status awal perangkat.");
                }
                
                // Ambil data JSON
                const data = await response.json();
                
                // Pastikan data status yang dikembalikan ada
                if (data && data.current_status) {
                    setDeviceStatus(data.current_status); // Set status dengan data dari Supabase
                } else {
                    throw new Error("Format data yang dikembalikan tidak valid.");
                }

            } catch (error: any) {
                console.error("Fetch Status Error:", error);
                // Beri notifikasi kepada pengguna jika gagal mengambil data
                toast.error(`Error memuat data: ${error.message}`);
                
                // Jika gagal, pastikan kita tetap menggunakan DEFAULT_STATUS
                setDeviceStatus(DEFAULT_STATUS);
            } finally {
                setIsLoading(false); // Akhiri loading, terlepas dari sukses atau gagal
            }
        };

        fetchDeviceStatus();
    }, []);

    // --- FUNGSI UPDATE STATUS (Dilewatkan ke FieldCard) ---
    const handleStatusUpdate = (updatedData: StatusData) => {
        // Fungsi ini dipanggil FieldCard setelah sukses POST
        setDeviceStatus(updatedData); // Sinkronkan state data utama
    };


    if (isLoading) {
        return <p className="p-4 text-center">Memuat data...</p>;
    }
        return (
        <div className="p-4 w-full flex flex-col gap-4">
            <Header />
            <div className="flex-grow bg-[#F0F1F7] rounded-2xl p-6 overflow-y-auto">

                {isDesktop ? (
                    /* --- DESKTOP --- */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                        {/* Kalender & Sensor */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            {/* Kalender */}
                            <div className="bg-white rounded-2xl shadow-md p-4 flex justify-center items-center">
                                <Calendar onChange={setDate} value={date} className="react-calendar-custom" />
                            </div>
                            {/* Sensor */}
                            <div className="flex-grow flex flex-col gap-6">
                                <div className="grid grid-cols-2 gap-4"> {/* Suhu & Kelembaban */}
                                    <div className="bg-white rounded-xl shadow-md p-10 text-center">
                                        <p className="text-sm font-semibold text-gray-900 mb-4">Suhu</p>
                                        <div className="flex items-center justify-center gap-4">
                                            <span className="text-2xl">☀️</span>
                                            <p className="text-3xl font-bold text-gray-800">27°C</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-md p-10 text-center">
                                        <p className="text-sm font-semibold text-gray-900 mb-4">Kelembaban</p>
                                        <p className="text-3xl font-bold text-gray-800">80%</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4"> {/* Cuaca */}
                                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                                        <p className="text-sm font-semibold text-gray-900 mb-4">Cuaca Hari Ini</p>
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl">⛅</span>
                                            <p className="font-semibold text-gray-600">Cerah Berawan</p>
                                            <p className="text-xs text-gray-500 mt-4">7 Mei 2025</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                                        <p className="text-sm font-semibold text-gray-900 mb-4">Cuaca Besok</p>
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl">🌧️</span>
                                            <p className="font-semibold text-gray-600">Hujan</p>
                                            <p className="text-xs text-gray-500 mt-4">8 Mei 2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fields & History */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Kolom Fields Kiri */}
                                <div className="flex flex-col gap-4">
{/* Field 1 (Servo 1) */}
                    <FieldCard 
                        title="Field 1" 
                        soilMoisture="70%" 
                        waterLevel="50 cm" 
                        isActive={deviceStatus.servo_1_open} 
                        deviceId="STM_004" 
                        servoKey="servo_1_open" 
                        currentStatus={deviceStatus} 
                        onUpdateSuccess={handleStatusUpdate}
                    />
                    {/* Field 2 (Servo 2) */}
                    <FieldCard 
                        title="Field 2" 
                        soilMoisture="70%" 
                        waterLevel="50 cm" 
                        isActive={deviceStatus.servo_2_open} 
                        deviceId="STM_004" 
                        servoKey="servo_2_open" 
                        currentStatus={deviceStatus} 
                        onUpdateSuccess={handleStatusUpdate}
                    />
                </div>
                
                <div className="flex flex-col gap-4">
                    {/* Field 3 (Servo 3) */}
                    <FieldCard 
                        title="Field 3" 
                        soilMoisture="70%" 
                        waterLevel="50 cm" 
                        isActive={deviceStatus.servo_3_open} 
                        deviceId="STM_004" 
                        servoKey="servo_3_open" 
                        currentStatus={deviceStatus} 
                        onUpdateSuccess={handleStatusUpdate}
                    />
                    {/* Field 4 (Servo 4) */}
                    <FieldCard 
                        title="Field 4" 
                        soilMoisture="70%" 
                        waterLevel="50 cm" 
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
                    /* --- MOBILE --- */
                    <div className="grid grid-cols-1 gap-6"> 
                        {/* Cuaca */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow p-4 text-center">
                                <p className="text-sm text-gray-500 mb-1">Cuaca Hari Ini</p>
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl">⛅</span>
                                    <p className="font-semibold text-gray-800">Cerah Berawan</p>
                                    <p className="text-xs text-gray-400 mt-2">7 Mei 2025</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow p-4 text-center flex flex-col">
                                <p className="text-sm text-gray-500 mb-1">Cuaca Besok</p>
                                <div className="flex flex-col items-center flex-grow justify-center">
                                    <span className="text-3xl">🌧️</span>
                                    <p className="font-semibold text-gray-800">Hujan</p>
                                    <p className="text-xs text-gray-400 mt-2">8 Mei 2025</p>
                                </div>
                                <button onClick={() => setIsCalendarOpen(true)} className="self-end mt-auto -mb-2 -mr-2 text-blue-500 hover:text-blue-700">
                                    <CalendarDays size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Suhu & Kelembaban */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow p-4 text-center">
                                <p className="text-sm text-gray-500 mb-1">Suhu</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl">☀️</span>
                                    <p className="text-3xl font-bold text-gray-800">27°C</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow p-4 text-center">
                                <p className="text-sm text-gray-500 mb-1">Kelembaban</p>
                                <p className="text-3xl font-bold text-gray-800">80%</p>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-rows-2 gap-6">
                            <div className="flex flex-col gap-4">
{/* Field 1 (Servo 1) */}
                    <FieldCard 
                        title="Field 1" 
                        soilMoisture="70%" 
                        waterLevel="50 cm" 
                        isActive={deviceStatus.servo_1_open} 
                        deviceId="STM_004" 
                        servoKey="servo_1_open" 
                        currentStatus={deviceStatus} 
                        onUpdateSuccess={handleStatusUpdate}
                    />
                    {/* Field 2 (Servo 2) */}
                    <FieldCard 
                        title="Field 2" 
                        soilMoisture="70%" 
                        waterLevel="50 cm" 
                        isActive={deviceStatus.servo_2_open} 
                        deviceId="STM_004" 
                        servoKey="servo_2_open" 
                        currentStatus={deviceStatus} 
                        onUpdateSuccess={handleStatusUpdate}
                    />
                </div>
                
                <div className="flex flex-col gap-4">
                    {/* Field 3 (Servo 3) */}
                    <FieldCard 
                        title="Field 3" 
                        soilMoisture="70%" 
                        waterLevel="50 cm" 
                        isActive={deviceStatus.servo_3_open} 
                        deviceId="STM_004" 
                        servoKey="servo_3_open" 
                        currentStatus={deviceStatus} 
                        onUpdateSuccess={handleStatusUpdate}
                    />
                    {/* Field 4 (Servo 4) */}
                    <FieldCard 
                        title="Field 4" 
                        soilMoisture="70%" 
                        waterLevel="50 cm" 
                        isActive={deviceStatus.servo_4_open} 
                        deviceId="STM_004" 
                        servoKey="servo_4_open" 
                        currentStatus={deviceStatus} 
                        onUpdateSuccess={handleStatusUpdate}
                    />
                            </div>
                        </div>

                        {/* History */}
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

            {/* Modal Kalender */}
            {!isDesktop && (
                <CalendarModal
                    isOpen={isCalendarOpen}
                    onClose={() => setIsCalendarOpen(false)}
                    date={date}
                    setDate={setDate}
                />
            )}
        </div>
    );
}
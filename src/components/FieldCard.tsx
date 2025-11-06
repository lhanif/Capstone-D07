"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch"; 
import { toast } from 'react-hot-toast'; // Pastikan Anda menginstal dan mengimpor react-hot-toast

// Definisikan tipe data untuk Payload dan Props
type ServoKey = "servo_1_open" | "servo_2_open" | "servo_3_open" | "servo_4_open";

interface StatusData {
    device_id: string;
    is_rain: boolean;
    servo_1_open: boolean;
    servo_2_open: boolean;
    servo_3_open: boolean;
    servo_4_open: boolean;
    [key: string]: any; // Untuk mengakomodasi field lain (misalnya idx, last_updated)
}

interface FieldCardProps {
    title: string;
    soilMoisture: string;
    waterLevel: string;
    isActive: boolean; // Dibuat wajib karena diambil dari currentStatus
    deviceId: string;
    servoKey: ServoKey;
    currentStatus: StatusData; // Status lengkap perangkat
    onUpdateSuccess: (updatedData: StatusData) => void; // Fungsi callback ke komponen induk
}

export const FieldCard = ({ 
    title, 
    soilMoisture, 
    waterLevel, 
    isActive, // Sekarang wajib
    deviceId, 
    servoKey,
    currentStatus, 
    onUpdateSuccess 
}: FieldCardProps) => {
    
    // State lokal untuk tampilan, diinisialisasi dari prop 'isActive'
    const [isOn, setIsOn] = useState(isActive);
    const [isLoading, setIsLoading] = useState(false);

    // Sinkronisasi: Jika 'isActive' berubah dari luar (oleh update kartu lain), 
    // update state lokal 'isOn'
    if (isActive !== isOn && !isLoading) {
        setIsOn(isActive);
    }
    
    // FUNGSI UNTUK MENGIRIM PERUBAHAN KE BACKEND
    const handleSwitchChange = async (newCheckedState: boolean) => {
        setIsLoading(true);
        const previousState = isOn;
        setIsOn(newCheckedState); // Update UI cepat (optimistic update)

        try {
            // 1. MERGE: Gabungkan status lama (currentStatus) dengan perubahan baru
            // Kami menggunakan currentStatus yang disediakan oleh props (yang seharusnya selalu sinkron)
            const updatePayload: StatusData = {
                ...currentStatus, // Ambil semua field yang diperlukan API POST
                [servoKey]: newCheckedState, // Timpa dengan status servo yang dikontrol saat ini
            };
            
            // Hapus field yang tidak perlu di-update jika ada (misal: idx, status_id)
            delete updatePayload.idx; 
            delete updatePayload.status_id; 

            // 2. POST: Kirim data status LENGKAP ke API Update
            const response = await fetch('/api/servo/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memperbarui status di server.');
            }

            const successData = await response.json();
            
            // 3. CALLBACK: Panggil fungsi dari induk untuk sinkronisasi data
            if (successData.updated_data) {
                onUpdateSuccess(successData.updated_data);
            }

            toast.success(`${title} ${newCheckedState ? "Diaktifkan (ON)" : "Dinonaktifkan (OFF)"}`);
            
        } catch (error: any) {
            console.error("Update Error:", error);
            setIsOn(previousState); // Kembalikan switch ke state semula (roll back)
            toast.error(`Gagal: ${error.message || "Kesalahan jaringan."}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Struktur tampilan asli, ditambahkan loading overlay/opacity
        <div 
            className="bg-white rounded-2xl shadow-md overflow-hidden transition-opacity duration-300"
            style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}
        >
            {/* Judul & Switch */}
            <div className="p-4 flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
                <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">{isOn ? "ON" : "OFF"}</span>
                    <Switch 
                        checked={isOn} 
                        onCheckedChange={handleSwitchChange} 
                        disabled={isLoading} // Nonaktifkan saat loading
                    />
                </div>
            </div>

            {/* Data Sensor */}
            <div className="text-sm text-gray-900">
                <div className="border-t border-gray-200 p-3 flex justify-between items-center">
                    <span>Kelembaban Tanah</span>
                    <span className="font-semibold text-gray-800">{soilMoisture}</span>
                </div>
                <div className="border-t border-gray-200 p-3 flex justify-between items-center">
                    <span>Ketinggian Air</span>
                    <span className="font-semibold text-gray-800">{waterLevel}</span>
                </div>
            </div>
        </div>
    );
};
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch"; // Pastikan path import benar

interface FieldCardProps {
    title: string;
    soilMoisture: string;
    waterLevel: string;
    isActive?: boolean;
}

export const FieldCard = ({ title, soilMoisture, waterLevel, isActive = false }: FieldCardProps) => {
    const [isOn, setIsOn] = useState(isActive);

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Bagian Atas: Judul & Switch */}
            <div className="p-4 flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
                <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">{isOn ? "ON" : "OFF"}</span>
                    <Switch checked={isOn} onCheckedChange={setIsOn} />
                </div>
            </div>

            {/* Bagian Bawah: Data Sensor */}
            <div className="text-sm text-gray-900">
                {/* Data Kelembaban Tanah */}
                <div className="border-t border-gray-200 p-4 flex justify-between items-center">
                    <span>Kelembaban Tanah</span>
                    <span className="font-semibold text-gray-800">{soilMoisture}</span>
                </div>
                {/* Data Ketinggian Air */}
                <div className="border-t border-gray-200 p-4 flex justify-between items-center">
                    <span>Ketinggian Air</span>
                    <span className="font-semibold text-gray-800">{waterLevel}</span>
                </div>
            </div>
        </div>
    );
};
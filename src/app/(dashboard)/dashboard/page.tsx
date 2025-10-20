"use client";

import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { HistoryTable } from "@/components/HistoryTable";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FieldCard } from "@/components/FieldCard"; 

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function DashboardPage() {
    const [date, setDate] = useState<Value>(new Date());
    
    return (
        <div className="p-4 w-full flex flex-col gap-4">
            <Header />
            <div className="flex-grow bg-[#F0F1F7] rounded-2xl p-6 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

                    {/* (Kalender & Sensor) */}
                    <div className="grid grid-rows-2 gap-6 h-full">
                        {/* Kalender */}
                        <div className="bg-white rounded-xl shadow-md p-4 flex justify-center items-center h-full">
                            <Calendar
                                onChange={setDate}
                                value={date}
                                className="react-calendar-custom"
                            />
                        </div>

                        {/* Suhu & Kelembaban */}
                        <div className="flex flex-col gap-4 h-full">
                            <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="bg-white rounded-xl shadow-md p-6 text-center h-full">
                                    <p className="text-sm font-semibold text-gray-900 mb-4">Suhu</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <span className="text-2xl">☀️</span>
                                        <p className="text-3xl font-bold text-gray-800">27°C</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-md p-6 text-center h-full">
                                    <p className="text-sm font-semibold text-gray-900 mb-4">Kelembaban</p>
                                    <p className="text-3xl font-bold text-gray-800">80%</p>
                                </div>
                            </div>

                            {/* Cuaca Hari Ini & Besok */}
                            <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="bg-white rounded-xl shadow-md p-6 text-center h-full">
                                    <p className="text-sm font-semibold text-gray-900 mb-4">Cuaca Hari Ini</p>
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl">⛅</span>
                                        <p className="font-semibold text-gray-600">Cerah Berawan</p>
                                        <p className="text-xs text-gray-500 mt-4">7 Mei 2025</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-md p-6 text-center h-full">
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

                    {/* Fields */}
                    <div className="grid grid-rows-4 gap-4">
                        <FieldCard 
                            title="Field 1" 
                            soilMoisture="70%" 
                            waterLevel="50 cm"
                            isActive={true} 
                        />
                        <FieldCard 
                            title="Field 2" 
                            soilMoisture="70%" 
                            waterLevel="50 cm" 
                        />
                        <FieldCard 
                            title="Field 3" 
                            soilMoisture="70%" 
                            waterLevel="50 cm"
                            isActive={true} 
                        />
                        <FieldCard 
                            title="Field 4" 
                            soilMoisture="70%" 
                            waterLevel="50 cm" 
                        />
                    </div>

                    {/* History */}
                    <div className="grid grid-rows-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
                            <h2 className="text-lg font-semibold mb-2 text-black">History</h2>
                            <div className="flex-grow flex items-center justify-center text-gray-400">
                                <p>Placeholder untuk Grafik</p>
                            </div>
                        </div>
                        <HistoryTable />
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
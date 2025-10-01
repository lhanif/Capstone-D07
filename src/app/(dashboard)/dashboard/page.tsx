"use client";

import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { HistoryTable } from "@/components/HistoryTable";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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
                    <div className="grid grid-rows-2 gap-6">
                        {/* Kalender */}
                        <div className="bg-white rounded-xl shadow-md p-4 flex justify-center items-center">
                            <Calendar
                                onChange={setDate}
                                value={date}
                                className="react-calendar-custom"
                            />
                        </div>

                        {/* Suhu & Kelembaban */}
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                                    <p className="text-sm text-gray-500 mb-4">Suhu</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <span className="text-2xl">☀️</span>
                                        <p className="text-3xl font-bold text-gray-800">27°C</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                                    <p className="text-sm text-gray-500 mb-4">Kelembaban</p>
                                    <p className="text-3xl font-bold text-gray-800">80%</p>
                                </div>
                            </div>

                            {/* Cuaca Hari Ini & Besok */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                                    <p className="text-sm text-gray-500 mb-4">Cuaca Hari Ini</p>
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl">⛅</span>
                                        <p className="font-semibold text-gray-800">Cerah Berawan</p>
                                        <p className="text-xs text-gray-400 mt-4">7 Mei 2025</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                                    <p className="text-sm text-gray-500 mb-4">Cuaca Besok</p>
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl">🌧️</span>
                                        <p className="font-semibold text-gray-800">Hujan</p>
                                        <p className="text-xs text-gray-400 mt-4">8 Mei 2025</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="flex flex-col gap-4 text-black h-full">
                        <div className="bg-white rounded-xl shadow-md p-6 flex-grow flex-col justify-center">
                            <h2 className="font-semibold text-black mb-10">Field 1</h2>
                            <p>Kelembaban Tanah: 70%</p>
                            <p>Ketinggian Air: 50 cm</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-4 flex-grow flex-col justify-center">
                            <h2 className="font-semibold text-black">Field 2</h2>
                            <p>Kelembaban Tanah: 70%</p>
                            <p>Ketinggian Air: 50 cm</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-4 flex-grow flex-col justify-center">
                            <h2 className="font-semibold text-black">Field 3</h2>
                            <p>Kelembaban Tanah: 70%</p>
                            <p>Ketinggian Air: 50 cm</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-4 flex-grow flex-col justify-center">
                            <h2 className="font-semibold text-black">Field 4</h2>
                            <p>Kelembaban Tanah: 70%</p>
                            <p>Ketinggian Air: 50 cm</p>
                        </div>
                    </div>

                    {/* History */}
                    <div className="grid grid-rows-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
                            <h2 className="font-semibold mb-2 text-black">History</h2>
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
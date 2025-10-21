"use client"

import React, { useState } from "react"
import { Modal } from "@/components/ui/Modal"

const historyData = [
    { name: "Field 1", startDate: "Senin", startTime: "07:00", stopTime: "07:30", duration: "30 min" },
    { name: "Field 2", startDate: "Senin", startTime: "07:00", stopTime: "07:30", duration: "30 min" },
    { name: "Field 3", startDate: "Senin", startTime: "07:00", stopTime: "07:30", duration: "30 min" },
    { name: "Field 4", startDate: "Senin", startTime: "07:00", stopTime: "07:30", duration: "30 min" },
]

interface FieldDetail {
    date: string
    start: string
    end: string
    soil: string
    water: string
}

const fieldDetails: Record<string, FieldDetail[]> = {
    "Field 1": [
        { date: "4 Mei", start: "07:00", end: "07:30", soil: "80%", water: "3 cm" },
        { date: "5 Mei", start: "07:00", end: "07:30", soil: "82%", water: "3 cm" },
    ],
    "Field 2": [
        { date: "4 Mei", start: "07:00", end: "07:30", soil: "70%", water: "4 cm" },
        { date: "5 Mei", start: "07:00", end: "07:30", soil: "72%", water: "4 cm" },
    ],
    "Field 3": [
        { date: "4 Mei", start: "07:00", end: "07:30", soil: "70%", water: "4 cm" },
        { date: "5 Mei", start: "07:00", end: "07:30", soil: "72%", water: "4 cm" },
    ],
    "Field 4": [
        { date: "4 Mei", start: "07:00", end: "07:30", soil: "70%", water: "4 cm" },
        { date: "5 Mei", start: "07:00", end: "07:30", soil: "72%", water: "4 cm" },
    ],
}

export const HistoryTable = () => {
    const [selectedField, setSelectedField] = useState<string | null>(null)

    return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col h-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Watering History</h2>
        <div className="overflow-x-auto flex-grow">
        <table className="w-full text-sm text-center">
            <thead className="text-black">
            <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Start day</th>
                <th className="px-4 py-2 font-medium">Start time</th>
                <th className="px-4 py-2 font-medium">Stop time</th>
                <th className="px-4 py-2 font-medium">Duration</th>
            </tr>
            </thead>
            <tbody className="text-gray-900">
            {historyData.map((item, index) => (
                <tr key={index} className="border-t border-gray-200">
                <td
                    className="px-4 py-3 text-gray-900 cursor-pointer hover:underline"
                    onClick={() => setSelectedField(item.name)}
                >
                    {item.name}
                </td>
                <td className="px-4 py-3">{item.startDate}</td>
                <td className="px-4 py-3">{item.startTime}</td>
                <td className="px-4 py-3">{item.stopTime}</td>
                <td className="px-4 py-3">{item.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>

        {/* Modal Detail */}
        <Modal
        isOpen={!!selectedField}
        onClose={() => setSelectedField(null)}
        title={`History > ${selectedField}`}
        >
        {selectedField && (
            <table className="w-full text-sm text-center">
            <thead className="text-gray-700">
                <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Start time</th>
                <th className="px-4 py-2">End time</th>
                <th className="px-4 py-2">Soil moisture</th>
                <th className="px-4 py-2">Water level</th>
                </tr>
            </thead>
            <tbody>
                {fieldDetails[selectedField]?.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-gray-800">{row.date}</td>
                    <td className="px-4 py-2 text-gray-800">{row.start}</td>
                    <td className="px-4 py-2 text-gray-800">{row.end}</td>
                    <td className="px-4 py-2 text-gray-800">{row.soil}</td>
                    <td className="px-4 py-2 text-gray-800">{row.water}</td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        </Modal>
    </div>
    )
}

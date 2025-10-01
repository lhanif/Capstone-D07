import React from 'react';

const historyData = [
    { name: "Field 1", startDate: "Senin", startTime: "07:00", stopTime: "07:30", duration: "30 min" },
    { name: "Field 2", startDate: "Senin", startTime: "07:00", stopTime: "07:30", duration: "30 min" },
    { name: "Field 3", startDate: "Senin", startTime: "07:00", stopTime: "07:30", duration: "30 min" },
    { name: "Field 4", startDate: "Senin", startTime: "07:00", stopTime: "07:30", duration: "30 min" },
];

export const HistoryTable = () => {
    return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col h-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">History</h2>
        <div className="overflow-x-auto flex-grow">
        <table className="w-full text-sm text-left">
            <thead className="text-gray-500">
            <tr>
                <th scope="col" className="px-4 py-2 font-medium">Name</th>
                <th scope="col" className="px-4 py-2 font-medium">Start day</th>
                <th scope="col" className="px-4 py-2 font-medium">Start time</th>
                <th scope="col" className="px-4 py-2 font-medium">Stop time</th>
                <th scope="col" className="px-4 py-2 font-medium">Duration</th>
            </tr>
            </thead>
            <tbody className="text-gray-700">
            {historyData.map((item, index) => (
                <tr key={index} className="border-t border-gray-200">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.startDate}</td>
                <td className="px-4 py-3">{item.startTime}</td>
                <td className="px-4 py-3">{item.stopTime}</td>
                <td className="px-4 py-3">{item.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
    );
};
"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Registrasi komponen Chart.js
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip, Title);

interface SensorData {
  timestamp: string;
  ultrasonic_1: string;
  ultrasonic_2: string;
  ultrasonic_3: string;
  ultrasonic_4: string;
  soil_moisture_1: string;
  soil_moisture_2: string;
  soil_moisture_3: string;
  soil_moisture_4: string;
  temperature: string;
  humidity: string;
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
}

// Definisikan tipe untuk memudahkan penggunaan
type ChartType = "ultrasonic" | "soil" | "environment";

export default function HistoryChart() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  // Menggunakan tipe yang sudah didefinisikan
  const [selectedType, setSelectedType] = useState<ChartType>("ultrasonic"); 

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/sensor/data", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("HTTP error:", res.status, res.statusText);
          return;
        }

        const json = await res.json().catch(() => null);

        if (!json) {
          console.error("Response kosong / tidak valid");
          return;
        }

        const data = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];

        if (isMounted && data.length > 0) {
          setSensorData(data as SensorData[]);
        } else {
          console.warn("Tidak ada data sensor yang ditemukan.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (sensorData.length === 0)
    return <p className="text-gray-500">Loading sensor data...</p>;

  const labels = [...sensorData]
    .reverse()
    .map((item) =>
      new Date(item.timestamp).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

  // Helper untuk bikin dataset
  const makeDataset = (
    label: string,
    dataKey: keyof SensorData,
    color: string
  ): Dataset => ({
    label,
    data: [...sensorData].reverse().map((item) => parseFloat(item[dataKey])),
    borderColor: color,
    backgroundColor: color + "33",
    tension: 0.4,
  });

  // Dataset untuk setiap tipe sensor
  const datasetsMap: Record<ChartType, Dataset[]> = {
    ultrasonic: [
      makeDataset("Ultrasonic 1", "ultrasonic_1", "#ef4444"),
      makeDataset("Ultrasonic 2", "ultrasonic_2", "#f59e0b"),
      makeDataset("Ultrasonic 3", "ultrasonic_3", "#10b981"),
      makeDataset("Ultrasonic 4", "ultrasonic_4", "#3b82f6"),
    ],
    soil: [
      makeDataset("Soil Moisture 1", "soil_moisture_1", "#a855f7"),
      makeDataset("Soil Moisture 2", "soil_moisture_2", "#6366f1"),
      makeDataset("Soil Moisture 3", "soil_moisture_3", "#22d3ee"),
      makeDataset("Soil Moisture 4", "soil_moisture_4", "#14b8a6"),
    ],
    environment: [
      makeDataset("Temperature (°C)", "temperature", "#f97316"),
      makeDataset("Humidity (%)", "humidity", "#60a5fa"),
    ],
  };

  const chartData = {
    labels,
    datasets: datasetsMap[selectedType],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeInOutCubic" as const,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text:
          selectedType === "ultrasonic"
            ? "Ultrasonic Sensor History"
            : selectedType === "soil"
            ? "Soil Moisture History"
            : "Temperature & Humidity History",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          color: "#4b5563",
          stepSize: 100
        },
      },
      x: {
        ticks: { color: "#4b5563" },
      },
    },
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Memastikan nilai yang dipilih adalah salah satu dari ChartType yang valid
    setSelectedType(e.target.value as ChartType);
  };

  return (
    <div className="p-5 transition-all duration-300 w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-semibold text-gray-800">
          History
        </h2>

        {/* --- DROPDOWN SEBAGAI PENGGANTI TOMBOL HORIZONTAL --- */}
        <select
          value={selectedType}
          onChange={handleSelectChange}
          className="text-sm px-2 py-0.5 rounded-md border border-gray-300 bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ultrasonic">Ultrasonic</option>
          <option value="soil">Soil Moisture</option>
          <option value="environment">Temp & Humidity</option>
        </select>
        {/* --- AKHIR DROPDOWN --- */}
      </div> 	

      <div className="flex-grow relative h-64 md:h-auto">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
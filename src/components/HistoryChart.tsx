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

export default function HistoryChart() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [selectedType, setSelectedType] = useState<"ultrasonic" | "soil" | "environment">("ultrasonic");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/sensor/data", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const json = await res.json();

        if (json.success) {
          setSensorData(json.data as SensorData[]);
        } else {
          console.error("Gagal mengambil data sensor:", json.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
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
    tension: 0.3,
  });

  // Dataset untuk setiap tipe sensor
  const datasetsMap: Record<
    "ultrasonic" | "soil" | "environment",
    Dataset[]
  > = {
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
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl">

      {/* Tombol pilihan tipe data */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setSelectedType("ultrasonic")}
          className={`text-sm px-2 py-1 rounded-lg ${
            selectedType === "ultrasonic"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Ultrasonic
        </button>
        <button
          onClick={() => setSelectedType("soil")}
          className={`text sm px-2 py-1 rounded-lg ${
            selectedType === "soil"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          Soil Moisture
        </button>
        <button
          onClick={() => setSelectedType("environment")}
          className={`text-sm px-2 py-1 rounded-lg ${
            selectedType === "environment"
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          Temp & Humidity
        </button>
      </div>

      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

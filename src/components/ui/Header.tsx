"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserCircle } from "lucide-react";
import Cookies from "js-cookie";

interface ProfileData {
  active_device_id: string;
}

export const Header = () => {
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (res.ok && result.data) {
          setDeviceId(result.data.active_device_id || "");
        }
      } catch (err) {
        console.error("Error fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <header className="w-full">
      <div className="w-full bg-white rounded-2xl shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-600">
          Irrigation Management {deviceId && `(${deviceId})`}
        </h1>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-gray-600 font-medium hover:text-blue-600 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2 text-gray-600 font-medium hover:text-blue-600 transition"
          >
            <UserCircle size={20} />
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

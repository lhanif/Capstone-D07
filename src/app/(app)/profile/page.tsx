"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User } from "lucide-react";
import Cookies from "js-cookie";

interface FormData {
  nama_depan: string;
  nama_belakang: string;
  email: string;
  active_device_id: string;
  oldPassword: string;
  newPassword: string;
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<FormData>({
    nama_depan: "",
    nama_belakang: "",
    email: "",
    active_device_id: "",
    oldPassword: "",
    newPassword: "",
  });

  const [originalData, setOriginalData] = useState<FormData>(formData);
  const [isChanged, setIsChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch profile data dari API
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
          const data = {
            nama_depan: result.data.nama_depan || "",
            nama_belakang: result.data.nama_belakang || "",
            email: result.data.email || "",
            active_device_id: result.data.active_device_id || "",
            oldPassword: "",
            newPassword: "",
          };
          setFormData(data);
          setOriginalData(data);
        } else {
          console.error(result.error || "Gagal fetch profile");
        }
      } catch (err) {
        console.error("Error fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // Deteksi perubahan data
  useEffect(() => {
    setIsChanged(JSON.stringify(formData) !== JSON.stringify(originalData));
  }, [formData, originalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal memperbarui profil");
      } else {
        alert("Profil berhasil diperbarui");
        setOriginalData(formData);
        setIsChanged(false);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-8 border-b pb-6">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-black">Profile</h1>
            <p className="text-gray-500">Perbarui detail pribadi Anda.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <Input
              label="Nama Depan"
              value={formData.nama_depan}
              onChange={(e) =>
                setFormData({ ...formData, nama_depan: e.target.value })
              }
            />
            <Input
              label="Nama Belakang"
              value={formData.nama_belakang}
              onChange={(e) =>
                setFormData({ ...formData, nama_belakang: e.target.value })
              }
            />
            <Input
              label="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              label="Device ID"
              value={formData.active_device_id}
              onChange={(e) =>
                setFormData({ ...formData, active_device_id: e.target.value })
              }
            />
            <Input
              label="Kata Sandi Lama"
              type="password"
              value={formData.oldPassword}
              placeholder="Kosongkan jika tidak diubah"
              onChange={(e) =>
                setFormData({ ...formData, oldPassword: e.target.value })
              }
            />
            <Input
              label="Kata Sandi Baru"
              type="password"
              value={formData.newPassword}
              placeholder="Kosongkan jika tidak diubah"
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end mt-10">
            <Button
              type="submit"
              disabled={!isChanged || loading}
              className={`px-12 text-sm border border-gray-300 shadow-lg ${
                isChanged
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 !text-black hover:bg-gray-200"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-10">
        <Button className="px-24" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}

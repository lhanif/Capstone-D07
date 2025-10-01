"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User } from "lucide-react";

export default function ProfilePage() {
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

                <form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <Input label="Nama Depan" defaultValue="Aurel" />
                        <Input label="Nama Belakang" defaultValue="Zayyan" />
                        <Input label="Email" defaultValue="aurel123@gmail.com" type="email" />
                        <Input label="Nomor Telepon" defaultValue="0823816312723" />
                        <Input label="Kata Sandi Lama" type="password" placeholder="Kosongkan jika tidak diubah" />
                        <Input label="Kata Sandi Baru" type="password" placeholder="Kosongkan jika tidak diubah" />
                    </div>

                    <div className="flex justify-end mt-10">
                        <Button type="submit" className="bg-gray-200 !text-black text-sm px-12 border border-gray-300 shadow-lg hover:bg-gray-200 hover:shadow-lg">
                            Ganti Password
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-10">
                <Button className="px-24">
                    Logout
                </Button>
            </div>
            
        </div>
    );
}
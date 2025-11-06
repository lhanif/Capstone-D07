"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, type, ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const isPasswordField = type === 'password';

    return (
        <div className="flex flex-col w-full">
            <label className="mb-1 text-base font-medium text-gray-700">{label}</label>
            <div className="relative">
                <input
                    {...props}
                    type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-black placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-primary-2"
                />

                {isPasswordField && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    >
                        {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
};
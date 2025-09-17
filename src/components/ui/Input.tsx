import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
    return (
        <div className="flex flex-col w-full">
            <label className="mb-1 text-base font-medium text-gray-700">{label}</label>
            <input
                {...props}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-primary-2"
            />
        </div>
    );
};
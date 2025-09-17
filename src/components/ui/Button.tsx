import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
    return (
        <button
            {...props}
            className="w-auto bg-[#3091CD] text-white py-2 px-10 rounded-lg hover:bg-[#3091CD] transition"
        >
            {children}
        </button>
    );
};

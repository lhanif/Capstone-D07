import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
    return (
        <button
            {...props}
            className={`bg-[#3091CD] text-white py-2 rounded-lg hover:bg-[#3091CD] transition ${className ?? ""}`}
        >
            {children}
        </button>
    );
};

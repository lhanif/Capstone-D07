import React from "react";

export const AuthCard = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
    <div
        className={`bg-white shadow-xl rounded-2xl p-12 ${className ?? ""}`}
    >
        {children}
    </div>
    );
};

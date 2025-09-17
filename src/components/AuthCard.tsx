import React from "react";

export const AuthCard = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-12">
            {children}
        </div>
    );
};

"use client";

import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Value; 
    setDate: (date: Value) => void; 
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, date, setDate }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center"
            onClick={onClose} 
        >
            <div 
                className="bg-white rounded-2xl shadow-lg p-4"
                onClick={(e) => e.stopPropagation()} 
            >
                <Calendar
                    onChange={setDate}
                    value={date}
                    className="react-calendar-custom"
                />
            </div>
        </div>
    );
};
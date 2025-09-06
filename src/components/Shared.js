import React from 'react';
import { XCircle } from 'lucide-react';

export const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-modal-pop">
                <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
            <style jsx>{`
                @keyframes modal-pop {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-modal-pop { animation: modal-pop 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export const Spinner = ({size = 'h-12 w-12'}) => (
    <div className="flex justify-center items-center h-full">
        <div className={`animate-spin rounded-full ${size} border-b-2 border-t-2 border-teal-500`}></div>
    </div>
);

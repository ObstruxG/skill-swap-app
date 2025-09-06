import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Briefcase, Settings, LogOut, Bell, MessageSquare, X } from 'lucide-react';

const Navbar = ({ setPage, handleLogout, userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const notifRef = collection(db, 'notifications', userId, 'userNotifications');
        const q = query(notifRef, where('read', '==', false));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [userId]);

    const handleNotificationClick = async (notification) => {
        await updateDoc(doc(db, 'notifications', userId, 'userNotifications', notification.id), { read: true });
        if (notification.link) {
            setPage(notification.link);
        }
        setShowNotifications(false);
    };

    const handleNavClick = (page) => {
        setPage(page);
        setMobileMenuOpen(false);
    };

    return (
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={() => handleNavClick('home')} className="flex-shrink-0 text-teal-600 font-bold text-2xl flex items-center gap-2">
                            <Briefcase className="h-7 w-7"/> SkillSwap
                        </button>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <button onClick={() => handleNavClick('home')} className="text-slate-600 hover:bg-teal-100 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Home</button>
                        <button onClick={() => handleNavClick('search')} className="text-slate-600 hover:bg-teal-100 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Search</button>
                        <button onClick={() => handleNavClick('swaps')} className="text-slate-600 hover:bg-teal-100 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">My Swaps</button>
                        <button onClick={() => handleNavClick('chat')} className="text-slate-600 hover:bg-teal-100 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <MessageSquare size={18}/> Chat
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="relative hidden md:flex">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-100 rounded-full transition-colors">
                                 <Bell className="h-6 w-6" />
                                 {notifications.length > 0 && (
                                     <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                                 )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20">
                                    <div className="p-4 font-semibold border-b">Notifications</div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div key={notif.id} onClick={() => handleNotificationClick(notif)} className="p-4 hover:bg-slate-50 cursor-pointer border-b">
                                                    <p className="text-sm text-slate-700">{notif.message}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt?.toDate()).toLocaleString()}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="p-4 text-sm text-slate-500">No new notifications.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                         </div>
                         <div className="hidden md:flex items-center gap-3">
                            <button onClick={() => handleNavClick('profile')} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-100 rounded-full transition-colors">
                                <Settings className="h-6 w-6" />
                            </button>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                                <LogOut className="h-6 w-6" />
                            </button>
                         </div>
                         <div className="md:hidden">
                            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-slate-600">
                                {isMobileMenuOpen ? <X size={24} /> : <Briefcase size={24} />}
                            </button>
                         </div>
                    </div>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <button onClick={() => handleNavClick('home')} className="text-slate-600 hover:bg-teal-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Home</button>
                        <button onClick={() => handleNavClick('search')} className="text-slate-600 hover:bg-teal-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Search</button>
                        <button onClick={() => handleNavClick('swaps')} className="text-slate-600 hover:bg-teal-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">My Swaps</button>
                        <button onClick={() => handleNavClick('chat')} className="text-slate-600 hover:bg-teal-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Chat</button>
                        <button onClick={() => handleNavClick('profile')} className="text-slate-600 hover:bg-teal-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Profile Settings</button>
                        <button onClick={handleLogout} className="text-slate-600 hover:bg-teal-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Logout</button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;

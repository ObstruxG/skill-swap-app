import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { Briefcase, Bell, Clock, Search, Settings, ArrowRight } from 'lucide-react';

const HomePage = ({ setPage, userData }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [pendingSwaps, setPendingSwaps] = useState([]);

    useEffect(() => {
        const annQuery = query(collection(db, 'announcements'), limit(3));
        const annUnsub = onSnapshot(annQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(data.sort((a, b) => b.createdAt - a.createdAt));
        });

        if (userData?.uid) {
            const swapQuery = query(collection(db, 'swaps'), where('responderId', '==', userData.uid), where('status', '==', 'pending'), limit(3));
            const swapUnsub = onSnapshot(swapQuery, (snapshot) => {
                setPendingSwaps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
            return () => { annUnsub(); swapUnsub(); };
        }
        return () => annUnsub();
    }, [userData?.uid]);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl shadow-lg p-8">
                <h1 className="text-4xl font-bold">Hello, {userData?.name || 'User'}!</h1>
                <p className="mt-2 text-lg text-teal-100">Ready to learn something new or share your expertise?</p>
                <div className="mt-6 flex flex-wrap gap-4">
                    <button onClick={() => setPage('search')} className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-slate-100 transition duration-300 flex items-center gap-2 transform hover:scale-105">
                        <Search/> Find a Skill
                    </button>
                    <button onClick={() => setPage('profile')} className="bg-teal-400/50 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-teal-400/80 transition duration-300 flex items-center gap-2 transform hover:scale-105">
                        <Settings/> Update Profile
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white shadow-lg rounded-xl p-6 lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-2"><Briefcase className="text-teal-500"/>Your Skills</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-teal-700">You Offer:</h3>
                            {userData?.skillsOffered?.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {userData.skillsOffered.map(skill => <span key={skill} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>)}
                                </div>
                            ) : <p className="text-slate-500 mt-2">Add skills you can teach.</p>}
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-700">You Want:</h3>
                            {userData?.skillsWanted?.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {userData.skillsWanted.map(skill => <span key={skill} className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>)}
                                </div>
                            ) : <p className="text-slate-500 mt-2">Add skills you want to learn.</p>}
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-2"><Bell className="text-amber-500"/>Announcements</h2>
                    <div className="space-y-4">
                        {announcements.length > 0 ? announcements.map(ann => (
                            <div key={ann.id} className="border-l-4 border-amber-400 pl-4">
                                <p className="text-slate-700">{ann.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{new Date(ann.createdAt?.toDate()).toLocaleDateString()}</p>
                            </div>
                        )) : <p className="text-slate-500">No new announcements.</p>}
                    </div>
                </div>
                
                <div className="bg-white shadow-lg rounded-xl p-6 lg:col-span-3">
                    <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-2"><Clock className="text-blue-500"/>Pending Swap Requests for You</h2>
                    {pendingSwaps.length > 0 ? (
                        <div className="space-y-3">
                            {pendingSwaps.map(swap => (
                                <div key={swap.id} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{swap.requesterName}</p>
                                        <p className="text-sm text-slate-600">Wants to swap for your <span className="font-medium text-teal-600">{swap.skillRequested}</span> skill.</p>
                                    </div>
                                    <button onClick={() => setPage('swaps')} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 transition">View</button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-500">You have no pending swap requests.</p>}
                     <button onClick={() => setPage('swaps')} className="text-teal-600 font-semibold mt-4 flex items-center gap-1 hover:underline">
                        Go to all swaps <ArrowRight size={16}/>
                    </button>
                </div>
            </div>
        </div>
    );
};
export default HomePage;

import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { CheckCircle, XCircle, Star, Trash2 } from 'lucide-react';
import { Spinner } from './Shared';
import FeedbackModal from './FeedbackModal';

const SwapsPage = ({ currentUserData }) => {
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, swap: null });

    useEffect(() => {
        if (!currentUserData?.uid) return;
        setLoading(true);
        const q1 = query(collection(db, 'swaps'), where('requesterId', '==', currentUserData.uid));
        const q2 = query(collection(db, 'swaps'), where('responderId', '==', currentUserData.uid));
        
        let allSwaps = {};
        const updateSwaps = () => {
            const sorted = Object.values(allSwaps).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setSwaps(sorted);
        };

        const unsub1 = onSnapshot(q1, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "removed") delete allSwaps[change.doc.id];
                else allSwaps[change.doc.id] = { id: change.doc.id, ...change.doc.data() };
            });
            updateSwaps();
            setLoading(false);
        });
        const unsub2 = onSnapshot(q2, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "removed") delete allSwaps[change.doc.id];
                else allSwaps[change.doc.id] = { id: change.doc.id, ...change.doc.data() };
            });
            updateSwaps();
            setLoading(false);
        });

        return () => { unsub1(); unsub2(); };
    }, [currentUserData?.uid]);
    
    const handleSwapAction = async (swapId, newStatus) => { await updateDoc(doc(db, 'swaps', swapId), { status: newStatus }); };
    const handleDeleteRequest = async (swapId) => { if (window.confirm("Are you sure?")) { await deleteDoc(doc(db, 'swaps', swapId)); } };
    const openFeedbackModal = (swap) => { setFeedbackModal({ isOpen: true, swap }); };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { border: '#f59e0b', bg: '#fffbeb', text: '#d97706' };
            case 'accepted': return { border: '#10b981', bg: '#f0fdf4', text: '#059669' };
            case 'rejected': return { border: '#ef4444', bg: '#fef2f2', text: '#dc2626' };
            case 'completed': return { border: '#3b82f6', bg: '#eff6ff', text: '#2563eb' };
            default: return { border: '#6b7280', bg: '#f9fafb', text: '#4b5563' };
        }
    };

    const renderSwapCard = (swap) => {
        const isRequester = swap.requesterId === currentUserData.uid;
        const otherPartyName = isRequester ? swap.responderName : swap.requesterName;
        const style = getStatusStyle(swap.status);

        return (
            <div key={swap.id} className="bg-white p-5 rounded-xl shadow-lg border-l-4" style={{borderColor: style.border}}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-slate-800">Swap with {otherPartyName}</p>
                        <p className="text-sm text-slate-600">You offer: <span className="font-semibold">{isRequester ? swap.skillOffered : swap.skillRequested}</span></p>
                        <p className="text-sm text-slate-600">You get: <span className="font-semibold">{isRequester ? swap.skillRequested : swap.skillOffered}</span></p>
                    </div>
                    <span className="text-sm font-bold px-3 py-1 rounded-full capitalize" style={{backgroundColor: style.bg, color: style.text}}>
                        {swap.status}
                    </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end items-center gap-2">
                    {swap.status === 'pending' && !isRequester && (
                        <>
                            <button onClick={() => handleSwapAction(swap.id, 'accepted')} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 flex items-center gap-1"><CheckCircle size={14}/> Accept</button>
                            <button onClick={() => handleSwapAction(swap.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 flex items-center gap-1"><XCircle size={14}/> Reject</button>
                        </>
                    )}
                    {swap.status === 'pending' && isRequester && (
                        <button onClick={() => handleDeleteRequest(swap.id)} className="bg-slate-500 text-white px-3 py-1 rounded-md text-sm hover:bg-slate-600 flex items-center gap-1"><Trash2 size={14}/> Delete</button>
                    )}
                    {swap.status === 'accepted' && (
                        <>
                            <button onClick={() => openFeedbackModal(swap)} className="bg-amber-500 text-white px-3 py-1 rounded-md text-sm hover:bg-amber-600 flex items-center gap-1"><Star size={14}/> Feedback</button>
                            <button onClick={() => handleSwapAction(swap.id, 'completed')} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 flex items-center gap-1"><CheckCircle size={14}/> Complete</button>
                        </>
                    )}
                    {swap.status === 'completed' && !swap.feedbackGivenBy?.[currentUserData.uid] && (
                         <button onClick={() => openFeedbackModal(swap)} className="bg-amber-500 text-white px-3 py-1 rounded-md text-sm hover:bg-amber-600 flex items-center gap-1"><Star size={14}/> Leave Feedback</button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-slate-800">My Swaps</h2>
            {loading ? <Spinner /> : (
                <div className="space-y-6">
                    {swaps.length > 0 ? swaps.map(renderSwapCard) : <p className="text-center text-slate-500 bg-white p-10 rounded-xl shadow-md">You have no active or pending swaps.</p>}
                </div>
            )}
            <FeedbackModal isOpen={feedbackModal.isOpen} onClose={() => setFeedbackModal({ isOpen: false, swap: null })} swap={feedbackModal.swap} currentUserData={currentUserData} />
        </div>
    );
};
export default SwapsPage;

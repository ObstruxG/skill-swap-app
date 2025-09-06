import React, { useState } from 'react';
import { db } from '../App';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Modal } from './Shared';
import { Star } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, swap, currentUserData }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmitFeedback = async () => {
        if (rating === 0) { setMessage("Please select a rating."); return; }
        setLoading(true);
        setMessage('');
        const otherUserId = swap.requesterId === currentUserData.uid ? swap.responderId : swap.requesterId;
        
        try {
            await addDoc(collection(db, 'feedback'), { swapId: swap.id, fromUserId: currentUserData.uid, toUserId: otherUserId, rating, comment, createdAt: serverTimestamp() });
            await updateDoc(doc(db, 'swaps', swap.id), { [`feedbackGivenBy.${currentUserData.uid}`]: true });
            setMessage("Feedback submitted successfully!");
            setTimeout(onClose, 2000);
        } catch (error) {
            setMessage("Failed to submit feedback.");
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Leave Feedback">
            <div className="space-y-4">
                <p>Rate your swap with {swap?.requesterId === currentUserData.uid ? swap?.responderName : swap?.requesterName}</p>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Rating</label>
                    <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRating(star)} className="focus:outline-none text-slate-300 hover:text-amber-400 transition-colors">
                                <Star className={`h-10 w-10 ${rating >= star ? 'text-amber-400' : ''}`} fill="currentColor" />
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-slate-700">Comment (optional)</label>
                    <textarea id="comment" rows="3" value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"></textarea>
                </div>
                {message && <p className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                <div className="flex justify-end pt-4">
                    <button onClick={handleSubmitFeedback} disabled={loading} className="py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-teal-400">
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default FeedbackModal;

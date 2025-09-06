import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Modal } from './Shared';
import { Send } from 'lucide-react';

const SwapRequestModal = ({ isOpen, onClose, targetUser, currentUserData }) => {
    const [selectedSkill, setSelectedSkill] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentUserData?.skillsOffered?.length > 0) {
            setSelectedSkill(currentUserData.skillsOffered[0]);
        }
    }, [isOpen, currentUserData]);

    const handleRequestSwap = async () => {
        if (!selectedSkill) {
            setMessage('Please select a skill to offer.');
            return;
        }
        setLoading(true);
        setMessage('');

        try {
            await addDoc(collection(db, 'swaps'), {
                requesterId: currentUserData.uid,
                requesterName: currentUserData.name,
                responderId: targetUser.id,
                responderName: targetUser.name,
                skillOffered: selectedSkill,
                skillRequested: targetUser.skillsOffered.join(', '),
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            setMessage('Swap request sent successfully!');
            setTimeout(() => { onClose(); setMessage(''); }, 2000);
        } catch (error) {
            setMessage('Failed to send request. Please try again.');
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Swap with ${targetUser?.name}`}>
            {currentUserData?.skillsOffered?.length > 0 ? (
                <div className="space-y-4">
                    <p className="text-slate-600">Select one of your skills to offer in exchange for one of {targetUser?.name}'s skills.</p>
                    <div>
                        <label htmlFor="skill-select" className="block text-sm font-medium text-slate-700">Your Skill to Offer:</label>
                        <select id="skill-select" value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                            {currentUserData.skillsOffered.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                        </select>
                    </div>
                    {message && <p className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition">Cancel</button>
                        <button onClick={handleRequestSwap} disabled={loading} className="py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-teal-400 flex items-center gap-2">
                            <Send size={16}/> {loading ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-red-600 font-semibold">You have no skills to offer!</p>
                    <p className="text-slate-600 mt-2">Please add skills to your profile before requesting a swap.</p>
                </div>
            )}
        </Modal>
    );
};

export default SwapRequestModal;
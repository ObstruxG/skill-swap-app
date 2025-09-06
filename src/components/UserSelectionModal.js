import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Modal, Spinner } from './Shared';

const UserSelectionModal = ({ isOpen, onClose, onSelect, currentUserId }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                setLoading(true);
                try {
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('isPublic', '==', true));
                    const snapshot = await getDocs(q);
                    const userList = snapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(user => user.id !== currentUserId && user.name); // Ensure user has a name
                    setUsers(userList);
                } catch (error) {
                    console.error("Error fetching users for modal:", error);
                }
                setLoading(false);
            };
            fetchUsers();
        }
    }, [isOpen, currentUserId]);

    const filteredUsers = users.filter(user =>
        user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Start a New Chat">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search for a user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
            {loading ? (
                <Spinner />
            ) : (
                <div className="max-h-80 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div
                                key={user.id}
                                onClick={() => onSelect(user)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0D9488&color=fff`}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <span className="font-medium">{user.name}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No users found.</p>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default UserSelectionModal;

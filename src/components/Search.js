import React, { useState } from 'react';
import { db } from '../App';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Search, MessageSquare } from 'lucide-react';
import { Spinner } from './Shared';
import SwapRequestModal from './SwapRequestModal';

// --- Predefined Skill Categories ---
const skillCategories = ["Technology", "Creative", "Business", "Lifestyle", "Languages", "Crafts", "Academic"];

const SearchPage = ({ currentUserData, openChatWithUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false); // FIXED: Added this line
    const [searched, setSearched] = useState(false); // FIXED: Added this line
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim() && !category.trim()) return; // Prevent empty search
        setLoading(true);
        setSearched(true);
        setResults([]);
        try {
            // This is a simplified query logic for demonstration.
            // A real-world app would use a more advanced search service like Algolia for complex queries.
            const usersRef = collection(db, 'users');
            let q = query(usersRef, where('isPublic', '==', true));

            const querySnapshot = await getDocs(q);
            let users = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.id !== currentUserData.uid);

            // Manual filtering since Firestore has limitations
            if (searchTerm) {
                users = users.filter(user => 
                    user.skillsOffered.some(skill => 
                        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                );
            }
            if (category) {
                 users = users.filter(user => 
                    user.skillsOffered.some(skill => skill.category === category)
                );
            }
            
            setResults(users);
        } catch (error) {
            console.error("Error searching: ", error);
        }
        setLoading(false);
    };
    
    const openSwapModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-slate-800">Find a Skill</h2>
                <p className="text-slate-500 mt-2">Search for users offering a skill you want to learn.</p>
            </div>
            <form onSubmit={handleSearch} className="space-y-4 mb-10 max-w-lg mx-auto">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder="e.g., Python, Guitar" 
                        className="flex-grow px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                    />
                     <button type="submit" disabled={loading} className="bg-teal-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-teal-700 disabled:bg-teal-400 flex items-center justify-center">
                        {loading ? <Spinner size="h-5 w-5"/> : <Search />}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Category:</span>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-grow px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
                        <option value="">All</option>
                        {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </form>

            {loading && <Spinner />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map(userResult => ( // FIXED: Renamed 'user' to 'userResult' to avoid conflict
                    <div key={userResult.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <img src={userResult.photoURL || `https://ui-avatars.com/api/?name=${userResult.name.replace(' ', '+')}&background=0D9488&color=fff`} alt={userResult.name} className="h-16 w-16 rounded-full object-cover mr-4 border-2 border-teal-200"/>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{userResult.name}</h3>
                                <p className="text-sm text-slate-500">{userResult.location}</p>
                            </div>
                        </div>
                        <div className="flex-grow space-y-4">
                            <div>
                                <h4 className="font-semibold text-teal-700 text-sm mb-1">Offers:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {userResult.skillsOffered.map(skill => <span key={skill.name} className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-1 rounded-full">{skill.name} ({skill.category})</span>)}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-amber-700 text-sm mb-1">Wants:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {userResult.skillsWanted.map(skill => <span key={skill} className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <button onClick={() => openSwapModal(userResult)} className="w-full bg-teal-500 text-white py-2 rounded-lg font-semibold hover:bg-teal-600 transition duration-300 transform hover:scale-105">
                                Request Swap
                            </button>
                            <button onClick={() => openChatWithUser(userResult)} className="w-full bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-300 transition duration-300 flex items-center justify-center gap-2">
                                <MessageSquare size={16}/> Message
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {searched && results.length === 0 && !loading && (
                <div className="text-center text-slate-500 bg-white p-10 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold">No results found</h3>
                    <p>No users were found matching your criteria. Try a different search.</p>
                </div>
            )}

            <SwapRequestModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                targetUser={selectedUser}
                currentUserData={currentUserData}
            />
        </div>
    );
};
export default SearchPage;

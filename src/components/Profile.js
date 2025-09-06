import React, { useState, useEffect } from 'react';
import { db, ADMIN_UID } from '../App';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Eye, EyeOff, PlusCircle, Trash2, Award, ShieldCheck, Zap } from 'lucide-react';

// --- Predefined Skill Categories ---
const skillCategories = ["Technology", "Creative", "Business", "Lifestyle", "Languages", "Crafts", "Academic"];

// --- Reputation Badge Calculation ---
const getReputationBadges = (userData) => {
    const badges = [];
    const completedSwaps = userData?.completedSwaps || 0;
    const averageRating = userData?.averageRating || 0;

    if (completedSwaps >= 10 && averageRating >= 4.5) {
        badges.push({ name: "Top Swapper", icon: Award, color: "text-amber-500" });
    }
    if (completedSwaps >= 5) {
        badges.push({ name: "Reliable", icon: ShieldCheck, color: "text-green-500" });
    }
    if (userData?.quickResponder) { // This would be a boolean field updated by a cloud function in a real app
        badges.push({ name: "Quick Responder", icon: Zap, color: "text-blue-500" });
    }
    return badges;
};


const ProfilePage = ({ user, userData, setUserData, setPage }) => {
    // ... (existing state variables) ...
    const [skillsOffered, setSkillsOffered] = useState(userData?.skillsOffered || [{ name: '', category: '' }]);
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        if (userData) {
            setBadges(getReputationBadges(userData));
        }
    }, [userData]);

    const handleSkillChange = (index, field, value) => {
        const newSkills = [...skillsOffered];
        newSkills[index][field] = value;
        setSkillsOffered(newSkills);
    };

    const addSkill = () => {
        setSkillsOffered([...skillsOffered, { name: '', category: '' }]);
    };

    const removeSkill = (index) => {
        const newSkills = skillsOffered.filter((_, i) => i !== index);
        setSkillsOffered(newSkills);
    };

    const handleSaveProfile = async (e) => {
        // ... (existing save logic)
        const profileData = {
            // ... (other data)
            skillsOffered: skillsOffered.filter(s => s.name && s.category), // Save skills with category
            // ...
        };
        // ...
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* ... (existing profile page structure) ... */}
            
            {/* Reputation Badges Display */}
            {badges.length > 0 && (
                <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 mb-8">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Your Reputation</h3>
                    <div className="flex flex-wrap gap-4">
                        {badges.map(badge => (
                            <div key={badge.name} className={`flex items-center gap-2 p-2 rounded-lg bg-white border`}>
                                <badge.icon className={`${badge.color}`} size={20} />
                                <span className="text-sm font-medium text-slate-600">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-8">
                {/* ... (Basic Info Section) ... */}

                {/* Skills Section - UPDATED */}
                <div className="p-6 border border-slate-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Skills You Offer</h3>
                    <div className="space-y-4">
                        {skillsOffered.map((skill, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-slate-50">
                                <input
                                    type="text"
                                    placeholder="Skill Name (e.g., Python)"
                                    value={skill.name}
                                    onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                                    className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"
                                />
                                <select
                                    value={skill.category}
                                    onChange={(e) => handleSkillChange(index, 'category', e.target.value)}
                                    className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"
                                >
                                    <option value="">Select Category</option>
                                    {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <button type="button" onClick={() => removeSkill(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addSkill} className="mt-4 flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-800">
                        <PlusCircle size={18} /> Add Another Skill
                    </button>
                </div>
                {/* ... (Skills Wanted, Preferences, and Save Button) ... */}
            </form>
        </div>
    );
};
export default ProfilePage;

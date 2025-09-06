import React, { useState, useEffect } from 'react';
import { db, ADMIN_UID } from '../App';
import { collection, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Users, Briefcase, Mail, BarChart, LogOut, Shield, XCircle, Star } from 'lucide-react';
import { Spinner } from './Shared';

const AdminDashboard = ({ user, handleLogout }) => {
    const [adminPage, setAdminPage] = useState('users');

    if (user.uid !== ADMIN_UID) {
        return <div className="text-center text-red-500 p-10">Access Denied. You are not an administrator.</div>;
    }

    const pages = {
        users: { label: 'User Management', icon: Users, component: <AdminUserManagement /> },
        swaps: { label: 'Swap Monitoring', icon: Briefcase, component: <AdminSwapMonitoring /> },
        messages: { label: 'Platform Messages', icon: Mail, component: <AdminMessages /> },
        reports: { label: 'Reports', icon: BarChart, component: <AdminReports /> },
    };

    return (
        <div className="flex min-h-screen">
            <div className="w-64 bg-slate-800 text-slate-200 flex flex-col p-4">
                <div className="text-white font-bold text-2xl flex items-center gap-2 mb-10 px-2">
                    <Shield/> Admin Panel
                </div>
                <nav className="flex-grow">
                    {Object.entries(pages).map(([key, { label, icon: Icon }]) => (
                        <button key={key} onClick={() => setAdminPage(key)} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg mb-2 transition-colors ${adminPage === key ? 'bg-teal-600 text-white' : 'hover:bg-slate-700'}`}>
                            <Icon size={20}/> {label}
                        </button>
                    ))}
                </nav>
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 transition-colors">
                    <LogOut size={20}/> Logout
                </button>
            </div>
            <div className="flex-1 bg-slate-100 p-10 overflow-y-auto">
                {pages[adminPage].component}
            </div>
        </div>
    );
};
export default AdminDashboard;

// Admin Sub-components
const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const toggleBanUser = async (userId, isBanned) => {
        if (userId === ADMIN_UID) { alert("Cannot ban the main admin."); return; }
        await updateDoc(doc(db, 'users', userId), { isBanned: !isBanned });
    };

    const rejectSkill = async (userId, skillToReject) => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const updatedSkills = userDoc.data().skillsOffered.filter(s => s !== skillToReject);
            await updateDoc(doc(db, 'users', userId), { skillsOffered: updatedSkills });
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">User Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills Offered</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {users.map(user => (
                            <tr key={user.id} className={`hover:bg-slate-50 ${user.isBanned ? 'bg-red-50' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="flex flex-wrap gap-2">
                                        {user.skillsOffered?.map(skill => (
                                            <span key={skill} className="flex items-center bg-slate-200 rounded-full px-2 py-1 text-xs">
                                                {skill}
                                                <button onClick={() => rejectSkill(user.id, skill)} className="ml-1.5 text-red-500 hover:text-red-700"><XCircle size={14}/></button>
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => toggleBanUser(user.id, user.isBanned)} className={`px-3 py-1 text-sm rounded-md text-white ${user.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                                        {user.isBanned ? 'Unban' : 'Ban'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminSwapMonitoring = () => { /* Code for this component */ return <div className="bg-white p-6 rounded-xl shadow-lg"><h2 className="text-2xl font-bold mb-6 text-slate-800">Swap Monitoring</h2><p>Swap monitoring table would go here.</p></div>; };
const AdminMessages = () => { /* Code for this component */ return <div className="bg-white p-6 rounded-xl shadow-lg"><h2 className="text-2xl font-bold mb-6 text-slate-800">Platform Messages</h2><p>Message sending form would go here.</p></div>;};
const AdminReports = () => { /* Code for this component */ return <div className="bg-white p-6 rounded-xl shadow-lg"><h2 className="text-2xl font-bold mb-6 text-slate-800">Reports</h2><p>Report download buttons would go here.</p></div>;};


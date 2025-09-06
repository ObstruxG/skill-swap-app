import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Import Components
import AuthPage from './components/Auth';
import ProfilePage from './components/Profile';
import HomePage from './components/Dashboard';
import SearchPage from './components/Search';
import SwapsPage from './components/Swaps';
import AdminDashboard from './components/Admin';
import ChatPage from './components/Chat';
import Navbar from './components/Navbar';
import { Spinner } from './components/Shared';

// --- Firebase Configuration (Using your provided details) ---
const firebaseConfig = {
  apiKey: "AIzaSyCpI7W_eN-S0QaFflO0v2kUAf9d1UxqlCE",
  authDomain: "ronakoddo.firebaseapp.com",
  projectId: "ronakoddo",
  storageBucket: "ronakoddo.firebasestorage.app",
  messagingSenderId: "888347947693",
  appId: "1:888347947693:web:5376db6f4fa5569e8acc24",
  measurementId: "G-548ZRXQ9LQ"
};

// --- Firebase Initialization ---
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- Admin UID (Using your provided UID) ---
export const ADMIN_UID = "3LaUnXFD4OgnYbaKYy32eZ5o2Zw1";

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('home');
    const [authPage, setAuthPage] = useState('login');
    const [chatTarget, setChatTarget] = useState(null); // NEW: To open a specific chat

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const dbUserData = { uid: currentUser.uid, ...userDocSnap.data() };
                    setUserData(dbUserData);
                    if (dbUserData.name) {
                        if (dbUserData.isAdmin) {
                            setPage('admin');
                        } else {
                            setPage('home');
                        }
                    } else {
                        setPage('profile');
                    }
                } else {
                    setUserData({ uid: currentUser.uid, email: currentUser.email });
                    setPage('profile');
                }
            } else {
                setUser(null);
                setUserData(null);
                setPage('auth');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setUserData(null);
        setPage('auth');
        setAuthPage('login');
    };
    
    // NEW: Function to navigate to chat page with a specific user
    const openChatWithUser = (targetUser) => {
        setChatTarget(targetUser);
        setPage('chat');
    };

    const renderPage = () => {
        if (loading) {
            return <div className="h-screen w-screen flex justify-center items-center bg-slate-100"><Spinner /></div>;
        }

        switch (page) {
            case 'auth':
                return <AuthPage setAuthPage={setAuthPage} authPage={authPage} />;
            case 'profile':
                return <ProfilePage user={user} userData={userData} setUserData={setUserData} setPage={setPage} />;
            case 'home':
                return <HomePage setPage={setPage} userData={userData} />;
            case 'search':
                return <SearchPage currentUserData={userData} openChatWithUser={openChatWithUser} />;
            case 'swaps':
                return <SwapsPage currentUserData={userData} openChatWithUser={openChatWithUser} />;
            case 'chat':
                return <ChatPage currentUser={user} chatTarget={chatTarget} setChatTarget={setChatTarget} />;
            case 'admin':
                return <AdminDashboard user={user} handleLogout={handleLogout} />;
            default:
                return <HomePage setPage={setPage} userData={userData} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
            {user && page !== 'auth' && page !== 'admin' && <Navbar setPage={setPage} handleLogout={handleLogout} userId={user.uid} />}
            <main className={page !== 'admin' ? "p-4 sm:p-6 lg:p-8" : ""}>
                {renderPage()}
            </main>
        </div>
    );
}

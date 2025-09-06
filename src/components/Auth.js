import React, { useState } from 'react';
import { auth } from '../App'; // Corrected import path
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Briefcase, LogIn, UserPlus } from 'lucide-react';
import { Spinner } from './Shared'; // Corrected import path

const AuthPage = ({ setAuthPage, authPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async (e, action) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await action(auth, email, password);
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-400 to-blue-500 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl">
                <div className="text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-teal-600"/>
                    <h1 className="text-3xl font-bold text-slate-800 mt-2">SkillSwap</h1>
                    <p className="mt-2 text-slate-500">{authPage === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>
                </div>
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">{error}</div>}
                
                <form className="space-y-6" onSubmit={(e) => handleAction(e, authPage === 'login' ? signInWithEmailAndPassword : createUserWithEmailAndPassword)}>
                    <div className="space-y-4">
                        <input id="email-address" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Email address" />
                        <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Password" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 transition-all duration-300 transform hover:scale-105">
                        {loading ? <Spinner size="h-5 w-5"/> : (authPage === 'login' ? <><LogIn className="mr-2"/>Sign In</> : <><UserPlus className="mr-2"/>Sign Up</>)}
                    </button>
                </form>

                <div className="text-sm text-center">
                    {authPage === 'login' ? (
                        <p className="text-slate-600">Don't have an account? <button onClick={() => setAuthPage('signup')} className="font-semibold text-teal-600 hover:text-teal-500">Sign up</button></p>
                    ) : (
                        <p className="text-slate-600">Already have an account? <button onClick={() => setAuthPage('login')} className="font-semibold text-teal-600 hover:text-teal-500">Sign in</button></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

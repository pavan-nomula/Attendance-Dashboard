import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simplified login for hackathon demo
        console.log('Login attempt:', email);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 transition-all">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                        <span className="text-white text-3xl font-bold">A</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h1>
                    <p className="text-slate-500">Sign in to Smart Attendance Dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-slate-50/50"
                            placeholder="admin@smartattendance.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-slate-50/50"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-indigo-100"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Professional Dashboard for Smart Attendance System
                </div>
            </div>
        </div>
    );
};

export default Login;

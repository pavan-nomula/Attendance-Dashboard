import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, usersAPI, setStoredUser } from '../services/api';

const ChangePasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const user = getStoredUser();

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await usersAPI.changePassword(user.id, newPassword);

            // Update local storage to clear must_change_password flag
            const updatedUser = { ...user, must_change_password: false };
            setStoredUser(updatedUser);

            alert('Password updated successfully!');

            // Redirect based on role
            switch (user.role) {
                case 'admin': navigate('/admin-dashboard'); break;
                case 'incharge': navigate('/incharge-dashboard'); break;
                case 'faculty': navigate('/faculty-dashboard'); break;
                default: navigate('/student-dashboard');
            }
        } catch (err) {
            setError(err.message || 'Failed to update password');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-white">
            <div className="w-full max-w-md bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700">
                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">
                        🔑
                    </div>
                    <h2 className="text-3xl font-black mb-2">Security Shield</h2>
                    <p className="text-slate-400">Please change your temporary password to continue.</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/50 text-rose-400 rounded-xl text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-500 mb-2">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase text-slate-500 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                        {loading ? "Securing Account..." : "Update Password & Enter"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;

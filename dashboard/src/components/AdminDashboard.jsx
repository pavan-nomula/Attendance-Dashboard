import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, removeToken, removeStoredUser, usersAPI, reportsAPI } from '../services/api';
import LoadingScreen from './LoadingScreen';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [overallStats, setOverallStats] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Create User Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '', email: '', role: 'student', department: '', class_name: '', password: ''
    });

    // Edit User Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const storedUser = getStoredUser();
        if (!storedUser || storedUser.role !== 'admin') {
            navigate('/');
            return;
        }
        setUser(storedUser);
        loadAdminData();
    }, [navigate]);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            const filters = { search: searchQuery, role: roleFilter };
            const usersData = await usersAPI.getAll(filters);
            setAllUsers(usersData.rows || []);

            const statsData = await reportsAPI.getOverallStats();
            setOverallStats(statsData);

            setLoading(false);
        } catch (err) {
            console.error('Error loading admin dashboard:', err);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadAdminData();
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await usersAPI.create(
                newUser.name,
                newUser.email,
                newUser.role,
                null,
                newUser.password || 'Welcome#2026',
                newUser.department,
                newUser.class_name
            );
            alert(`User ${newUser.name} created successfully! Welcome email sent (Check server logs).`);
            setShowCreateModal(false);
            setNewUser({ name: '', email: '', role: 'student', department: '', class_name: '', password: '' });
            loadAdminData();
        } catch (err) {
            alert(`Failed to create user: ${err.message}`);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await usersAPI.update(
                editingUser.id,
                editingUser.name,
                editingUser.email,
                editingUser.role,
                editingUser.uid,
                editingUser.department,
                editingUser.class_name
            );
            alert('User updated successfully!');
            setShowEditModal(false);
            setEditingUser(null);
            loadAdminData();
        } catch (err) {
            alert(`Failed to update user: ${err.message}`);
        }
    };

    const toggleUserStatus = async (userId) => {
        try {
            await usersAPI.toggleStatus(userId);
            loadAdminData();
        } catch (err) {
            alert(`Failed to toggle status: ${err.message}`);
        }
    };

    const promoteToIncharge = async (userId) => {
        if (!window.confirm('Are you sure you want to promote this faculty to Class Incharge?')) return;
        try {
            await usersAPI.promote(userId);
            alert('User promoted to Class Incharge successfully!');
            loadAdminData();
        } catch (err) {
            console.error('Promote error:', err);
            alert(`Failed to promote: ${err.message}`);
        }
    };

    const handleDemoteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to demote this Incharge back to Faculty?')) return;
        try {
            await usersAPI.demote(userId);
            alert('User demoted to Faculty successfully!');
            loadAdminData();
        } catch (err) {
            console.error('Demote error:', err);
            alert(`Failed to demote: ${err.message}`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;
        try {
            await usersAPI.delete(userId);
            alert('User deleted successfully!');
            loadAdminData();
        } catch (err) {
            console.error('Delete error:', err);
            alert(`Failed to delete user: ${err.message}`);
        }
    };

    const resetUserPassword = async (userId) => {
        if (!window.confirm('Reset this user\'s password to default (Welcome#2026)?')) return;
        try {
            console.log(`Attempting to reset password for user ID: ${userId}`);
            await usersAPI.changePassword(userId, 'Welcome#2026');
            alert('Password reset successfully! Default password is Welcome#2026. The user will be required to change it on their next login.');
        } catch (err) {
            console.error('Reset password error:', err);
            alert(`Failed to reset password: ${err.message}`);
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Class', 'Status', 'Created At'];
        const rows = allUsers.map(u => [
            u.id, u.name, u.email, u.role, u.department || 'N/A', u.class_name || 'N/A',
            u.is_active ? 'Active' : 'Inactive', new Date(u.created_at).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `All_Users_Report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    const handleLogout = () => {
        removeToken();
        removeStoredUser();
        navigate('/');
    };

    if (loading && !allUsers.length) {
        return <LoadingScreen message="Accessing Secure Admin Vault..." />;
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-slate-900 text-white font-sans max-w-[1600px] mx-auto">
            {/* HEADER */}
            <header className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700/50 flex flex-col md:flex-row md:justify-between md:items-center gap-6 sticky top-0 z-40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20">
                        A
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                            System Control Center
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">
                            Administrator: <span className="text-indigo-400">{user?.name}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl transition-all font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                        <span>+</span> Create Account
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl transition-all font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                        📊 Export Data
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-slate-700 hover:bg-rose-600 px-6 py-2.5 rounded-xl transition-all font-bold"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                <AdminStatCard title="Total Users" value={overallStats?.totalUsers || allUsers.length} icon="👥" gradient="from-blue-500 to-blue-700" />
                <AdminStatCard title="Total Students" value={overallStats?.totalStudents || 0} icon="🎓" gradient="from-emerald-500 to-emerald-700" />
                <AdminStatCard title="Active Incharges" value={overallStats?.totalIncharges || 0} icon="🛡️" gradient="from-amber-500 to-amber-700" />
                <AdminStatCard title="System Uptime" value="99.9%" icon="⚡" gradient="from-indigo-500 to-indigo-700" />
            </div>

            {/* USER MANAGEMENT PANEL */}
            <section className="mt-10 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-700/50 flex flex-col lg:flex-row justify-between items-center gap-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                        User Access Management
                    </h2>

                    <form onSubmit={handleSearch} className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-80">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Roles</option>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="incharge">Incharge</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="bg-slate-700 hover:bg-slate-600 px-6 py-2.5 rounded-xl font-bold transition-all">
                            Filter
                        </button>
                    </form>
                </div>

                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-800 z-10">
                            <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-700/50">
                                <th className="py-5 px-8">User Information</th>
                                <th className="py-5 px-8">Role & Department</th>
                                <th className="py-5 px-8">Status</th>
                                <th className="py-5 px-8 text-center">Security & Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {allUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-slate-500 italic">No users matching your criteria found.</td>
                                </tr>
                            ) : (
                                allUsers.map(u => (
                                    <tr key={u.id} className="group hover:bg-slate-700/20 transition-all">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold border border-slate-600 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all shadow-inner">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-100">{u.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                    u.role === 'incharge' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                        u.role === 'faculty' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                                {u.department && <span className="text-slate-500 font-medium">• {u.department}</span>}
                                            </div>
                                            {u.class_name && <div className="text-[11px] text-slate-600 mt-1 font-bold italic">Class: {u.class_name}</div>}
                                        </td>
                                        <td className="py-6 px-8">
                                            <button
                                                onClick={() => toggleUserStatus(u.id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${u.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                                                    }`}
                                                title={u.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {u.is_active ? 'Active' : 'Deactivated'}
                                            </button>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex justify-center gap-2">
                                                {u.role === 'faculty' && (
                                                    <button
                                                        onClick={() => promoteToIncharge(u.id)}
                                                        className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black rounded-lg transition-all text-xs font-black uppercase tracking-tight border border-amber-500/20"
                                                        title="Promote to Incharge"
                                                    >
                                                        Promote
                                                    </button>
                                                )}
                                                {u.role === 'incharge' && (
                                                    <button
                                                        onClick={() => handleDemoteUser(u.id)}
                                                        className="p-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition-all text-xs font-black uppercase tracking-tight border border-orange-500/20"
                                                        title="Demote to Faculty"
                                                    >
                                                        Demote
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => resetUserPassword(u.id)}
                                                    className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-xs font-black uppercase tracking-tight border border-blue-500/20"
                                                    title="Reset to default password"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingUser({ ...u });
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-2 bg-slate-700/50 text-slate-400 hover:bg-slate-600 hover:text-white rounded-lg transition-all text-xs font-black uppercase tracking-tight border border-slate-600/50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all text-xs font-black uppercase tracking-tight border border-rose-500/20"
                                                    title="Permanently Delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* CREATE USER MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
                    <div className="relative bg-slate-800 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">Provision New Account</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-xl">×</button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-500 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="John Doe"
                                    required
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-500 mb-2">Email (@vishnu.edu.in)</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="john@vishnu.edu.in"
                                    required
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 mb-2">Role</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="faculty">Faculty</option>
                                        <option value="incharge">Incharge</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 mb-2">Default PWD (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Welcome#2026"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 mb-2">Department</label>
                                    <input
                                        type="text"
                                        placeholder="CSE, ECE, IT..."
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newUser.department}
                                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 mb-2">Class / Section</label>
                                    <input
                                        type="text"
                                        placeholder="3rd Year A"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newUser.class_name}
                                        onChange={(e) => setNewUser({ ...newUser, class_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all"
                                >
                                    Create Account & Notify User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-8 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT USER MODAL */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
                    <div className="relative bg-slate-800 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-blue-400">Modify User Entity</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white text-xl">×</button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-500 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-500 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-900/20 border border-slate-700/50 rounded-xl px-4 py-3 outline-none text-slate-500 cursor-not-allowed"
                                    disabled
                                    value={editingUser.email}
                                />
                                <p className="text-[10px] text-slate-600 mt-1 italic">Email cannot be modified for security mapping.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 mb-2">Role</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="faculty">Faculty</option>
                                        <option value="incharge">Incharge</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 mb-2">UID (Hardware)</label>
                                    <input
                                        type="text"
                                        placeholder="No UID Link"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editingUser.uid || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, uid: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 mb-2">Department</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editingUser.department || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 mb-2">Class / Section</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editingUser.class_name || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, class_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all text-white uppercase tracking-widest text-sm"
                                >
                                    Apply Transformations
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-8 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold transition-all"
                                >
                                    Abort
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminStatCard = ({ title, value, icon, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} p-8 rounded-3xl shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-default border border-white/5`}>
        <div className="absolute top-[-10px] right-[-10px] text-6xl opacity-20 filter grayscale group-hover:grayscale-0 transition-all">
            {icon}
        </div>
        <div className="text-4xl font-black mb-1">{value}</div>
        <div className="text-white/60 text-sm font-black uppercase tracking-widest">{title}</div>
        <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">+12% this month</span>
        </div>
    </div>
);

export default AdminDashboard;

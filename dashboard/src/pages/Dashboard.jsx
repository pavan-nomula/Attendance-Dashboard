import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DashboardCards from '../components/DashboardCards';
import AttendanceTable from '../components/AttendanceTable';
import { getAttendance } from '../services/api';
import { REFRESH_INTERVAL } from '../utils/constants';

const Dashboard = () => {
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const data = await getAttendance();
            setAttendance(data);
            // Simple mock stats calculation from data
            setStats({
                total: 50, // Mock total students
                present: data.length,
                late: 2,
                absent: 50 - data.length,
            });
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Attendance Overview</h2>
                        <p className="text-slate-500">Monitoring real-time student attendance</p>
                    </div>
                    <div className="text-sm text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                        Auto-refreshing every 5s
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <DashboardCards stats={stats} />
                        <AttendanceTable attendance={attendance} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;

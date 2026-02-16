import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../services/api';

const LiveStudentMonitor = () => {
  const navigate = useNavigate();
  const logsEndRef = useRef(null);

  /* =========================
     SYSTEM STATUS
  ========================= */
  const [activeSessions, setActiveSessions] = useState(0);
  const [serverLoad, setServerLoad] = useState('Low');
  const [blockedAttempts, setBlockedAttempts] = useState(0);

  /* =========================
     LIVE LOGS & STATS
  ========================= */
  const [logs, setLogs] = useState([]);
  const [liveStats, setLiveStats] = useState([]);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState('Never');

  const handleBack = () => navigate(-1);

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  /* =========================
     DATA FETCHING LOGIC
  ========================= */
  const fetchData = async () => {
    try {
      // 1. Fetch Raw Logs
      const rawData = await attendanceAPI.getCSVData();
      if (rawData && Array.isArray(rawData)) {
        const formattedLogs = rawData.map((item, index) => ({
          id: `${item.time}-${index}`,
          time: item.time,
          message: `${item.name} marked ${item.status}`
        })).reverse();
        setLogs(formattedLogs);
        setActiveSessions(rawData.length);
      }

      // 2. Fetch Aggregated Stats (Entry/Exit)
      const statsData = await attendanceAPI.getLiveStats();
      if (statsData && Array.isArray(statsData)) {
        setLiveStats(statsData);
      }

      setLastSync(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Connection lost. Retrying...');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f18] text-gray-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">

      {/* GLOW DECORATION */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-500 opacity-40"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Live Attendance Monitor
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Real-time hardware verification stream</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-red-400 text-xs font-bold uppercase tracking-wider">{error}</span>
            </div>
          )}
          <button
            onClick={handleBack}
            className="group relative flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-gray-400 group-hover:text-white transition-colors">←</span>
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* SIDEBAR: SYSTEM STATS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-3">
              System Telemetry
            </h3>

            <div className="space-y-1">
              <StatusRow label="Live Scans" value={activeSessions} />
              <StatusRow label="Unique Users" value={liveStats.length} />
              <StatusRow label="Last Update" value={lastSync} />
              <StatusRow label="Network" value="Optimized" color="text-emerald-400" />
            </div>

            <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-[11px] text-blue-300 leading-relaxed">
                <span className="font-bold">Hardware Info:</span> Raspberry Pi 4 stream active. Encrypted SSL tunnel established for real-time verification.
              </p>
            </div>
          </div>

          {/* LIVE ACTIVITY FEED (TINY LOG) */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 max-h-[400px] flex flex-col">
            <h3 className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
              <span>RAW ACTIVITY LOG</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide text-[11px] font-mono">
              {logs.length === 0 ? (
                <p className="text-gray-600 animate-pulse">Waiting for hardware pings...</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={log.id} className="text-gray-400 hover:text-gray-200 transition-colors py-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="text-gray-600">[{log.time}]</span> {log.message}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* MAIN: TODAY'S ACTIVE STUDENTS TABLE */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-white font-bold tracking-tight">Today's Active Students</h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                Live Aggregation
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Student Member</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">ID / RegNo</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Entry Time (Login)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Exit Time</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {liveStats.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-700 animate-spin"></div>
                          <p className="text-gray-500 text-sm font-medium">Monitoring entry/exit points...</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    liveStats.map((stat, idx) => (
                      <tr key={stat.regNo} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center text-blue-400 font-bold text-xs border border-blue-500/20 group-hover:scale-110 transition-transform">
                              {stat.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-200">{stat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-mono text-gray-400 group-hover:text-blue-400 transition-colors">
                            {stat.regNo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/5 text-emerald-400 text-xs font-mono border border-emerald-500/20">
                            {stat.entryTime}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-lg bg-amber-500/5 text-amber-400 text-xs font-mono border border-amber-500/20">
                            {stat.exitTime === stat.entryTime ? '--:--' : stat.exitTime}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${stat.lastStatus === 'IN'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                            {stat.lastStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* =========================
   SMALL COMPONENT
========================= */
const StatusRow = ({ label, value, color = "text-gray-400" }) => (
  <div className="flex justify-between border-b border-gray-700 py-3">
    <span className="text-sm">{label}</span>
    <span className={`${color} font-bold text-sm`}>
      {value === null ? '--' : value}
    </span>
  </div>
);

export default LiveStudentMonitor;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LiveStudentMonitor = () => {
  const navigate = useNavigate();
  const logsEndRef = useRef(null);

  /* =========================
     SYSTEM STATUS (NO DUMMY)
     → values come from backend later
  ========================= */
  const [activeSessions, setActiveSessions] = useState(null);
  const [serverLoad, setServerLoad] = useState(null);
  const [blockedAttempts, setBlockedAttempts] = useState(null);

  /* =========================
     LIVE LOGS (EMPTY INIT)
  ========================= */
  const [logs, setLogs] = useState([]);

  const handleBack = () => navigate(-1);

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  /* =========================
     PLACEHOLDER EFFECT
     (waiting for backend)
  ========================= */
  useEffect(() => {
    // Backend / WebSocket will update states here
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6 font-mono">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-700 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          <h1 className="text-xl md:text-2xl font-bold tracking-wider text-blue-400">
            LIVE MONITORING CONSOLE
          </h1>
        </div>

        <button
          onClick={handleBack}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          ← Return to Dashboard
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* SYSTEM STATUS */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">
            System Status
          </h3>

          <StatusRow label="Active Sessions" value={activeSessions} />
          <StatusRow label="Server Load" value={serverLoad} />
          <StatusRow label="Blocked Attempts" value={blockedAttempts} />

          <p className="text-xs text-gray-500 mt-4 italic">
            Waiting for server connection…
          </p>
        </div>

        {/* LIVE LOG STREAM */}
        <div className="md:col-span-2 bg-black rounded-lg p-4 border border-green-900 h-[450px] flex flex-col">
          <h3 className="text-green-500 text-xs font-bold uppercase mb-2">
            Real-time Activity Stream
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {logs.length === 0 && (
              <p className="text-gray-600 italic">
                No live data received yet…
              </p>
            )}

            {logs.map(log => (
              <div key={log.id} className="text-sm border-l-2 border-gray-800 pl-2">
                <span className="text-gray-500">[{log.time}] </span>
                <span className="text-blue-300">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
};

/* =========================
   SMALL COMPONENT
========================= */
const StatusRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-700 py-2">
    <span>{label}</span>
    <span className="text-gray-400 font-bold">
      {value === null ? '--' : value}
    </span>
  </div>
);

export default LiveStudentMonitor;

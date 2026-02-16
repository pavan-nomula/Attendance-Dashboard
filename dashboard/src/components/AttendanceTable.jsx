import React from 'react';

const AttendanceTable = ({ attendance }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Recent Attendance</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Student Name</th>
                            <th className="px-6 py-4 font-medium">ID Number</th>
                            <th className="px-6 py-4 font-medium">Time</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {attendance.length > 0 ? (
                            attendance.map((record, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{record.studentName}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.studentId}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'IN'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : record.status === 'OUT'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-slate-100 text-slate-800'
                                            }`}>
                                            {record.status || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                                    No attendance records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceTable;

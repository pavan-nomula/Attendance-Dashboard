import React from 'react';

const DashboardCards = ({ stats }) => {
    const cards = [
        { title: 'Total Students', value: stats.total || 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: 'Present Today', value: stats.present || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Late Arrivals', value: stats.late || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Absentees', value: stats.absent || 0, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                    <div className="flex items-end justify-between">
                        <h4 className={`text-2xl font-bold ${card.color}`}>{card.value}</h4>
                        <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                            {/* Optional icon placeholder */}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardCards;

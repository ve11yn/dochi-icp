import Header from "./header";
import Dochi from "./dochi";
import { Zap, ClipboardList } from 'lucide-react';
import React, { useState } from "react";

const AnalyticsChart = ({ data, maxChartValue }) => {
  const maxValue = maxChartValue;
  const svgHeight = 160;
  const svgWidth = 500;
  const padding = 15;
  const chartHeight = svgHeight - padding * 2;
  const chartWidth = svgWidth - padding * 2;

  const points = data.map((point, i) => {
    const x = (chartWidth / (data.length - 1)) * i + padding;
    const y = chartHeight - (point.value / maxValue) * chartHeight + padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative mt-2">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
        <polyline fill="none" stroke="#4F46E5" strokeWidth="2" points={points} />
        {data.map((point, i) => {
          const x = (chartWidth / (data.length - 1)) * i + padding;
          const y = chartHeight - (point.value / maxValue) * chartHeight + padding;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill="#4F46E5" stroke="white" strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 px-2 mt-1">
        {data.map((point) => (
          <span key={point.day}>{point.day}</span>
        ))}
      </div>
    </div>
  );
};

const Profile = () => {
    const [analyticsView, setAnalyticsView] = useState('weekly');

    const weeklyData = [
      { day: 'M', value: 2 }, { day: 'T', value: 4 }, { day: 'W', value: 3 },
      { day: 'T', value: 5 }, { day: 'F', value: 1 }, { day: 'S', value: 3 },
      { day: 'S', value: 3 },
    ];
    
    const monthlyData = [
      { day: 'W1', value: 15 }, { day: 'W2', value: 25 }, 
      { day: 'W3', value: 20 }, { day: 'W4', value: 30 },
    ];
    
    const chartData = analyticsView === 'weekly' ? weeklyData : monthlyData;
    const maxChartValue = analyticsView === 'weekly' ? 5 : 35;
    const highestChecked = analyticsView === 'weekly' ? 5 : 30;

    // --- Dynamic Date Logic for Streak Calendar ---
    const todayDate = new Date();
    const today = todayDate.getDate();
    const currentMonth = todayDate.getMonth();
    const currentYear = todayDate.getFullYear();

    const streakDays = Array.from({ length: 4 }, (_, i) => today - (i + 1)).reverse();
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const calendarDays = Array(firstDayOfMonth).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));


    return (
        <div className="flex-1 min-h-full bg-gray-50">
            <Header currentPage='Profile'/>
            <main className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-1">
                        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Hi, Username!</h2>
                            <div className="flex justify-center items-center my-2">
                                <Dochi size={120} />
                            </div>
                            <div className="flex justify-center items-center gap-1.5 mt-2">
                                <Zap className="text-yellow-500" size={16} />
                                <span className="text-md font-bold text-gray-700">4</span>
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>4 / 30</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(4 / 30) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-md font-semibold text-gray-700 mb-3 text-center">Streak Calendar</h3>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1 mt-2">
                                    {calendarDays.map((day, index) => (
                                        <div 
                                            key={index} 
                                            className={`w-full h-7 flex items-center justify-center rounded-md text-xs
                                                ${!day ? 'text-transparent' : ''}
                                                ${streakDays.includes(day) ? 'bg-green-200 text-green-800' : ''}
                                                ${day === today ? 'bg-purple-200 text-purple-800 font-bold' : ''}
                                                ${day && !streakDays.includes(day) && day !== today ? 'text-gray-600' : ''}
                                            `}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div className="mt-4 space-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                                    <span>Inactive</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-200"></div>
                                    <span>Active Day</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-200"></div>
                                    <span>Today</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
                           <div className="flex items-center gap-2 mb-4">
                                <ClipboardList className="text-gray-500" size={18}/>
                                <h3 className="text-md font-semibold text-gray-700">Productivity Analytics</h3>
                           </div>
                           <div className="space-y-2">
                                <div className="flex justify-between items-center bg-blue-200/80 p-3 rounded-lg">
                                    <span className="font-medium text-blue-900 text-sm">This Week</span>
                                    <span className="font-bold text-blue-900 text-sm">2 tasks</span>
                                </div>
                                <div className="flex justify-between items-center bg-green-200/80 p-3 rounded-lg">
                                    <span className="font-medium text-green-900 text-sm">Completion Rate</span>
                                    <span className="font-bold text-green-900 text-sm">100.0%</span>
                                </div>
                                <div className="flex justify-between items-center bg-violet-200/80 p-3 rounded-lg">
                                    <span className="font-medium text-violet-900 text-sm">Daily Average</span>
                                    <span className="font-bold text-violet-900 text-sm">0.3</span>
                                </div>
                           </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
                                    <button
                                        onClick={() => setAnalyticsView('weekly')}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${analyticsView === 'weekly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                                    >
                                        Weekly
                                    </button>
                                    <button
                                        onClick={() => setAnalyticsView('monthly')}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${analyticsView === 'monthly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                                    >
                                        Monthly
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">Highest Checked: <span className="font-bold text-gray-700">{highestChecked}</span></p>
                            </div>
                            <AnalyticsChart data={chartData} maxChartValue={maxChartValue} />
                            <p className="text-center text-xs text-gray-500 mt-2">Checked To-Do's</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Profile;
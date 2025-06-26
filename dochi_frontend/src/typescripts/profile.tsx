import Header from "./header";
import Dochi from "./dochi";
import { Link, CheckCheck, TrendingUp } from 'lucide-react';
import React, { useState } from "react";

const AnalyticsChart = ({ data, title }) => {
  const maxValue = Math.ceil(Math.max(...data.map(p => p.value), 0) * 1.2) || 5;

  const svgHeight = 220;
  const svgWidth = 500;
  const yAxisWidth = 30;
  const xAxisHeight = 30;
  const paddingTop = 20;
  const paddingRight = 10;

  const chartHeight = svgHeight - xAxisHeight - paddingTop;
  const chartWidth = svgWidth - yAxisWidth - paddingRight;

  const points = data.map((point, i) => {
    const x = (chartWidth / (data.length > 1 ? data.length - 1 : 1)) * i + yAxisWidth;
    const y = chartHeight - (point.value / maxValue) * chartHeight + paddingTop;
    return `${x},${y}`;
  }).join(' ');

  const getYAxisTicks = () => {
      const ticks = [];
      const interval = Math.ceil(maxValue / 4) || 1;
      for (let i = 0; i <= maxValue; i += interval) {
          ticks.push(i);
      }
      if (!ticks.includes(maxValue) && ticks.length > 0 && ticks[ticks.length - 1] < maxValue) {
        ticks.push(Math.ceil(maxValue / interval) * interval);
      }
      return ticks.filter((t, i, arr) => arr.indexOf(t) === i);
  }

  const yAxisTicks = getYAxisTicks();

  return (
    <div className="relative h-full flex flex-col">
       <h4 className="text-sm font-semibold text-gray-600 text-center mb-2">{title}</h4>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
        {yAxisTicks.map((tick, i) => {
          const y = chartHeight - (tick / Math.max(...yAxisTicks, 1)) * chartHeight + paddingTop;
          return (
            <g key={i} className="text-gray-400">
              <line x1={yAxisWidth} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,3" />
              <text x={yAxisWidth - 8} y={y} textAnchor="end" alignmentBaseline="middle" fontSize="10" fill="currentColor">{tick}</text>
            </g>
          );
        })}
        {data.map((point, i) => {
          const x = (chartWidth / (data.length > 1 ? data.length - 1 : 1)) * i + yAxisWidth;
          return (
             <text key={i} x={x} y={svgHeight - 10} textAnchor="middle" fontSize="10" fill="currentColor" className="text-gray-500 font-medium">{point.day}</text>
          )
        })}
        <polyline fill="none" stroke="#4F46E5" strokeWidth="2" points={points} />
        {data.map((point, i) => {
          const x = (chartWidth / (data.length > 1 ? data.length - 1 : 1)) * i + yAxisWidth;
          const y = chartHeight - (point.value / maxValue) * chartHeight + paddingTop;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#4F46E5" stroke="white" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const StatusCard = ({ icon: Icon, value, title, subtitle, percentage, color: fixedColor }) => {
    const getColorsForPercentage = (p) => {
        if (p <= 30) return { bg: '#FEF2F2', iconBg: '#FEE2E2', icon: '#EF4444', text: '#991B1B', subtext: '#B91C1C' }; // Red
        if (p <= 70) return { bg: '#FFFBEB', iconBg: '#FEF3C7', icon: '#F59E0B', text: '#92400E', subtext: '#B45309' }; // Yellow
        return { bg: '#F0FFF4', iconBg: '#D1FAE5', icon: '#10B981', text: '#065F46', subtext: '#047857' }; // Green
    };

    const color = percentage !== undefined ? getColorsForPercentage(percentage) : fixedColor;
    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = percentage !== undefined ? circumference - (percentage / 100) * circumference : circumference;

    return (
        <div className="bg-white p-1 rounded-xl border border-gray-200/60 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5">
            <div className={`p-4 rounded-lg flex items-center justify-between h-full`} style={{ backgroundColor: color.bg }}>
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3`} style={{ backgroundColor: color.iconBg }}>
                        <Icon className="w-5 h-5" style={{ color: color.icon }} />
                    </div>
                    <div>
                        <p className="text-xl font-bold" style={{ color: color.text }}>{value}</p>
                        <p className="font-semibold text-sm" style={{ color: color.text }}>{title}</p>
                        <p className="text-xs" style={{ color: color.subtext }}>{subtitle}</p>
                    </div>
                </div>
                {percentage !== undefined && (
                    <div className="relative w-12 h-12">
                        <svg className="w-full h-full" viewBox="0 0 40 40">
                            <circle className="stroke-current" style={{ color: color.iconBg }} strokeWidth="4" fill="transparent" r="18" cx="20" cy="20"/>
                            <circle
                                className="stroke-current transition-all duration-500"
                                style={{ color: color.icon, strokeDasharray: circumference, strokeDashoffset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                                strokeWidth="4" fill="transparent" r="18" cx="20" cy="20"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: color.text }}>{percentage}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};


const Profile = () => {
    const weeklyData = [
      { day: 'Mon', value: 2 }, { day: 'Tue', value: 4 }, { day: 'Wed', value: 3 },
      { day: 'Thu', value: 5 }, { day: 'Fri', value: 1 }, { day: 'Sat', value: 3 },
      { day: 'Sun', value: 3 },
    ];
    
    const monthlyData = [
      { day: 'W1', value: 15 }, { day: 'W2', value: 25 }, 
      { day: 'W3', value: 20 }, { day: 'W4', value: 30 },
    ];

    const todayDate = new Date();
    const today = todayDate.getDate();
    const currentMonth = todayDate.getMonth();
    const currentYear = todayDate.getFullYear();

    const streakDays = [20, 21, 22, 23, 24];
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const calendarDays = Array(firstDayOfMonth).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        calendarWeeks.push(calendarDays.slice(i, i + 7));
    }

    const statusData = [
        { icon: CheckCheck, value: "17", title: "Tasks Done", subtitle: "of 25 this week", percentage: 68 },
        { icon: Link, value: "4", title: "Day Streak", subtitle: "current streak", color: { bg: '#EFF6FF', iconBg: '#DBEAFE', icon: '#3B82F6', text: '#1E40AF', subtext: '#1D4ED8' } },
        { icon: TrendingUp, value: "2.4", title: "Daily Average", subtitle: "tasks per day", color: { bg: '#F5F5F4', iconBg: '#E7E5E4', icon: '#78716C', text: '#44403C', subtext: '#57534E' } }
    ];

    const categoryProgressData = [
        { label: 'Work', value: 75, gradient: 'from-blue-600 to-blue-400' },
        { label: 'Learning', value: 50, gradient: 'from-green-600 to-green-400' },
        { label: 'Personal', value: 80, gradient: 'from-purple-600 to-purple-400' },
    ];

    return (
        <div className="flex-1 min-h-full" style={{ background: 'linear-gradient(to bottom right, rgba(223, 240, 255, 0.8), rgba(255, 212, 242, 0.8))' }}>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animated-gradient-border-wrapper { position: relative; width: 180px; height: 180px; padding: 8px; border-radius: 9999px; overflow: hidden; }
                .animated-gradient-border-wrapper::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; z-index: 1; background: conic-gradient(from 90deg at 50% 50%, #a855f7, #f472b6, #a855f7); animation: spin 3s linear infinite; }
                .dochi-container { position: relative; z-index: 2; background-color: white; border-radius: 9999px; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
            `}</style>
            <Header currentPage='Profile'/>
            <main className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:items-stretch gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex flex-col h-full">
                            <h2 className="text-xl font-semibold text-gray-800 text-center">Hi, Username!</h2>
                            <div className="flex justify-center items-center my-4">
                               <div className="animated-gradient-border-wrapper">
                                    <div className="dochi-container">
                                        <Dochi size={160} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                                    <Link className="text-white" size={12} />
                                </div>
                                <span className="text-md font-bold text-gray-700">4</span>
                            </div>

                            <div className="mt-6 space-y-3">
                                <h3 className="text-md font-semibold text-gray-700 text-center mb-2">Category Progress</h3>
                                {categoryProgressData.map(item => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                                            <span>{item.label}</span>
                                            <span>{item.value}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className={`bg-gradient-to-r ${item.gradient} h-1.5 rounded-full`} style={{ width: `${item.value}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-12 flex-grow flex flex-col">
                                <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">Streak Calendar</h3>
                                <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
                                </div>
                                <div className="space-y-1 mt-2">
                                    {calendarWeeks.map((week, weekIndex) => (
                                        <div key={weekIndex} className="grid grid-cols-7 relative h-8">
                                            {(() => {
                                                const streakInWeek = week.filter(d => streakDays.includes(d));
                                                if (streakInWeek.length > 0) {
                                                    const firstDayIndex = week.indexOf(streakInWeek[0]);
                                                    const width = `${streakInWeek.length * (100/7)}%`;
                                                    const left = `${firstDayIndex * (100/7)}%`;
                                                    return (
                                                         <div className="absolute h-full top-0 bg-green-100 border-2 border-green-300 rounded-lg" style={{left, width}}></div>
                                                    )
                                                }
                                                return null;
                                            })()}
                                            {week.map((day, dayIndex) => {
                                                let dayClasses = 'w-full h-full flex items-center justify-center text-xs relative z-10 rounded-lg';
                                                if (!day) return <div key={dayIndex} className="w-full h-full"></div>;
                                                
                                                if (day === today) {
                                                    dayClasses += ' text-purple-800 font-bold';
                                                } else if (streakDays.includes(day)) {
                                                    dayClasses += ' text-green-800 font-semibold';
                                                } else {
                                                    dayClasses += ' text-gray-600';
                                                }

                                                return <div key={dayIndex} className="p-px"><div className={dayClasses}>{day}</div></div>
                                            })}
                                        </div>
                                    ))}
                                </div>
                                 <div className="mt-auto pt-4 space-y-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div><span>Inactive</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-lg bg-green-100 border-2 border-green-300"></div><span>Active Day</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-lg bg-purple-200 border-2 border-purple-400"></div><span>Today</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4"><h3 className="text-lg font-semibold text-gray-700">Status</h3></div>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                               {statusData.map((data, index) => (<StatusCard key={index} {...data} />))}
                           </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 flex-grow">
                            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col">
                                <AnalyticsChart data={weeklyData} title="Weekly Progress" />
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col">
                                <AnalyticsChart data={monthlyData} title="Monthly Progress" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Profile;
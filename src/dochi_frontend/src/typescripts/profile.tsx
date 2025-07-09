import Header from "./header";
import Dochi from "./dochi";
import { Link, CheckCheck, TrendingUp, ChevronLeft, ChevronRight, Clock, CalendarDays, Target } from 'lucide-react';
import React, { useState, useMemo } from "react";

// --- Helper Functions for Date Manipulations ---

// Gets the start of the week (Monday) for a given date
const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

// Gets the end of the week (Sunday) for a given date
const getEndOfWeek = (date: Date) => {
    const d = getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    return d;
};


const AnalyticsChart = ({ data }) => {
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
        if (p <= 30) return { bg: '#FEF2F2', iconBg: '#FEE2E2', icon: '#EF4444', text: '#991B1B', subtext: '#B91C1C', glow: 'hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]' }; // Red
        if (p <= 70) return { bg: '#FFFBEB', iconBg: '#FEF3C7', icon: '#F59E0B', text: '#92400E', subtext: '#B45309', glow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]' }; // Yellow
        return { bg: '#F0FFF4', iconBg: '#D1FAE5', icon: '#10B981', text: '#065F46', subtext: '#047857', glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]' }; // Green
    };

    const color = percentage !== undefined ? getColorsForPercentage(percentage) : { ...fixedColor, glow: `hover:shadow-[0_0_15px_${fixedColor.icon.replace(')', ',0.4)')}]` };
    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = percentage !== undefined ? circumference - (percentage / 100) * circumference : circumference;

    return (
        <div className={`bg-white p-1 rounded-xl border border-gray-200/60 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 ${color.glow} group relative cursor-pointer`}>
            <div className={`p-4 rounded-lg flex items-center justify-between h-full transition-all duration-300 group-hover:blur-[2px] group-hover:brightness-[0.8]`} style={{ backgroundColor: color.bg }}>
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
            <div className="absolute inset-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-center text-xs font-semibold px-4">Click to see more details</span>
            </div>
        </div>
    );
};


const Profile = () => {
    // --- MOCK REAL-TIME DATA ---
    const allTimeTaskData = useMemo(() => [
        { date: '2025-05-27', value: 2 }, { date: '2025-05-28', value: 4 }, { date: '2025-05-29', value: 1 },
        { date: '2025-06-02', value: 3 }, { date: '2025-06-03', value: 5 }, { date: '2025-06-04', value: 2 },
        { date: '2025-06-05', value: 4 },
        { date: '2025-06-10', value: 6 }, { date: '2025-06-11', value: 3 }, { date: '2025-06-12', value: 7 },
        { date: '2025-06-16', value: 2 }, { date: '2025-06-17', value: 4 }, { date: '2025-06-18', value: 3 },
        { date: '2025-06-19', value: 5 }, { date: '2025-06-20', value: 1 },
        { date: '2025-06-23', value: 3 }, { date: '2025-06-24', value: 3 }, { date: '2025-06-25', value: 4 },
        { date: '2025-06-26', value: 5 }, { date: '2025-06-27', value: 2 },
    ], []);

    // --- STATE FOR DATE NAVIGATION ---
    const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // --- DATA PROCESSING FOR CHARTS (DERIVED STATE) ---
    const weeklyData = useMemo(() => {
        const weekData = [];
        const start = getStartOfWeek(currentWeek);
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(day.getDate() + i);
            const dateString = day.toISOString().split('T')[0];
            const task = allTimeTaskData.find(t => t.date === dateString);
            weekData.push({
                day: day.toLocaleDateString('en-US', { 'weekday': 'short' }),
                value: task ? task.value : 0,
            });
        }
        return weekData;
    }, [currentWeek, allTimeTaskData]);

    const monthlyData = useMemo(() => {
        const month = currentMonth.getMonth();
        const year = currentMonth.getFullYear();
        const weeksInMonth: { [key: number]: number } = {};

        allTimeTaskData
            .filter(task => {
                const taskDate = new Date(task.date);
                return taskDate.getMonth() === month && taskDate.getFullYear() === year;
            })
            .forEach(task => {
                const taskDate = new Date(task.date);
                const weekNumber = Math.ceil((taskDate.getDate() + getStartOfWeek(new Date(year, month, 1)).getDay() -1) / 7);
                weeksInMonth[weekNumber] = (weeksInMonth[weekNumber] || 0) + task.value;
            });

        return Array.from({length: 4}, (_, i) => ({
            day: `W${i + 1}`,
            value: weeksInMonth[i + 1] || 0
        }));
    }, [currentMonth, allTimeTaskData]);


    const todayDate = new Date();
    const today = todayDate.getDate();
    const currentCalendarMonth = todayDate.getMonth();
    const currentCalendarYear = todayDate.getFullYear();

    const streakDays = [20, 21, 22, 23, 24];
    
    const firstDayOfMonth = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
    const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
    
    const calendarDays = Array(firstDayOfMonth).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        calendarWeeks.push(calendarDays.slice(i, i + 7));
    }

    // --- DYNAMIC STATUS CARD DATA ---
    const calculateStreak = (tasks, today) => {
        const taskDates = new Set(tasks.map(t => t.date));
        let streak = 0;
        let currentDate = new Date(today);
        while (true) {
            const dateString = currentDate.toISOString().split('T')[0];
            if (taskDates.has(dateString)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }
    const dayStreak = calculateStreak(allTimeTaskData, todayDate);

    // User-defined values for "Tasks Done" and "Daily Average"
    const tasksDoneThisWeek = 22;
    const weeklyGoal = 25;
    const tasksDonePercentage = Math.round((tasksDoneThisWeek / weeklyGoal) * 100);
    const dailyAverage = (tasksDoneThisWeek / 7).toFixed(1);

    const currentYear = new Date().getFullYear();
    const totalTasksThisYear = allTimeTaskData
        .filter(task => new Date(task.date).getFullYear() === currentYear)
        .reduce((sum, task) => sum + task.value, 0);

    const statusData = [
        { icon: CheckCheck, value: tasksDoneThisWeek.toString(), title: "Tasks Done", subtitle: `of ${weeklyGoal} this week`, percentage: tasksDonePercentage },
        { icon: Link, value: dayStreak.toString(), title: "Day Streak", subtitle: "current streak", color: { bg: '#EFF6FF', iconBg: '#DBEAFE', icon: '#3B82F6', text: '#1E40AF', subtext: '#1D4ED8' } },
        { icon: TrendingUp, value: dailyAverage, title: "Daily Average", subtitle: "tasks per day", color: { bg: '#F5F5F4', iconBg: '#E7E5E4', icon: '#78716C', text: '#44403C', subtext: '#57534E' } },
        { icon: Clock, value: "3.5h", title: "Longest Focus", subtitle: "in a single session", color: { bg: '#FFFBEB', iconBg: '#FEF3C7', icon: '#F59E0B', text: '#92400E', subtext: '#B45309' } },
        { icon: CalendarDays, value: "Jan 2023", title: "Member Since", subtitle: "joined the platform", color: { bg: '#F0F9FF', iconBg: '#E0F2FE', icon: '#0EA5E9', text: '#0C4A6E', subtext: '#075985' } },
        { icon: Target, value: totalTasksThisYear.toString(), title: "Total Tasks", subtitle: `in ${currentYear}`, color: { bg: '#FEF2F2', iconBg: '#FEE2E2', icon: '#EF4444', text: '#991B1B', subtext: '#B91C1C' } }
    ];

    const categoryProgressData = [
        { label: 'Work', value: 35, gradient: 'from-blue-600 to-blue-300' },
        { label: 'Learning', value: 50, gradient: 'from-green-500 to-green-300' },
        { label: 'Personal', value: 80, gradient: 'from-purple-600 to-purple-300' },
    ];
    
    const navigateWeek = (direction: 'prev' | 'next') => {
        const newWeekStart = new Date(currentWeek);
        newWeekStart.setDate(newWeekStart.getDate() + (direction === 'prev' ? -7 : 7));
        
        if (newWeekStart.getMonth() !== currentMonth.getMonth()) {
            setCurrentMonth(newWeekStart);
        }
        
        setCurrentWeek(newWeekStart);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + (direction === 'prev' ? -1 : 1), 1);
        
        if (getStartOfWeek(currentWeek).getMonth() !== newMonth.getMonth()) {
            setCurrentWeek(newMonth);
        }
        
        setCurrentMonth(newMonth);
    };

    const weeklyTitle = `${getStartOfWeek(currentWeek).toLocaleDateString('en-US', {month: 'short', day: 'numeric' })} - ${getEndOfWeek(currentWeek).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric' })}`;
    const monthlyTitle = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });


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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 h-full">
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
                            
                            <div className="mt-8 flex-grow flex flex-col">
                                <h3 className="text-md font-semibold text-gray-700 mb-3 text-center">Streak Calendar</h3>
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

                    <div className="lg:col-span-2 flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-1/3 flex flex-col gap-6 h-full">
                            <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-4"><h3 className="text-lg font-semibold text-gray-700">Status</h3></div>
                               <div className="grid grid-cols-1 gap-4 flex-grow">
                                   {statusData.map((data, index) => (<StatusCard key={index} {...data} />))}
                               </div>
                            </div>
                        </div>
                        <div className="lg:w-2/3 grid grid-rows-2 gap-4 h-full">
                            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col">
                                <div className="flex justify-between items-center px-2 mb-2">
                                     <h3 className="text-lg font-semibold text-gray-700">Weekly Progress</h3>
                                     <div className="flex items-center">
                                        <button onClick={() => navigateWeek('prev')} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft className="w-4 h-4 text-gray-600"/></button>
                                        <h3 className="text-sm font-semibold text-gray-700 w-48 text-center">{weeklyTitle}</h3>
                                        <button onClick={() => navigateWeek('next')} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight className="w-4 h-4 text-gray-600"/></button>
                                     </div>
                                </div>
                                <AnalyticsChart data={weeklyData} />
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col">
                                 <div className="flex justify-between items-center px-2 mb-2">
                                     <h3 className="text-lg font-semibold text-gray-700">Monthly Progress</h3>
                                     <div className="flex items-center">
                                        <button onClick={() => navigateMonth('prev')} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft className="w-4 h-4 text-gray-600"/></button>
                                        <h3 className="text-sm font-semibold text-gray-700 w-32 text-center">{monthlyTitle}</h3>
                                        <button onClick={() => navigateMonth('next')} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight className="w-4 h-4 text-gray-600"/></button>
                                     </div>
                                </div>
                                <AnalyticsChart data={monthlyData} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Profile;
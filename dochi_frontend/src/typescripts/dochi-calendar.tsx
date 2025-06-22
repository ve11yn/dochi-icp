"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  CalendarIcon,
  CheckSquare,
  Focus,
  User,
  Trash2,
  Settings,
  HelpCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ClipboardList,
  PlusCircle,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import Sidebar from "./sidebar"; // Import the new Sidebar component

// A simple component to display for different pages
function PageContent({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <h1 className="text-2xl font-bold text-gray-500">{`This is the ${title} page`}</h1>
    </div>
  )
}

const initialAppointmentCategories = [
    { name: "Work", color: "#8B5CF6", textColor: "text-white" },
    { name: "Personal", color: "#10B981", textColor: "text-white" },
    { name: "Others", color: "#6B7280", textColor: "text-white" },
    { name: "Urgent", color: "#EF4444", textColor: "text-white" },
];

const colorPalette = ["#8B5CF6", "#10B981", "#6B7280", "#EF4444", "#3B82F6", "#F59E0B", "#EC4899"];


export default function DochiCalendar() {
  const [activeSection, setActiveSection] = useState("Calendar")
  const [selectedDate, setSelectedDate] = useState<string>('2025-06-13')
  const [currentMonth, setCurrentMonth] = useState(5) // June = 5 (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025)
  const [viewMode, setViewMode] = useState<"Month" | "Week">("Month")

  const [currentPage, setCurrentPage] = useState("Calendar")
  const [openDate, setOpenDate] = useState<string | null>(null);

  // State for creating appointment within the dropdown
  const [isCreatingInDropdown, setIsCreatingInDropdown] = useState(false);

  // State for new appointment form
  const [newAptTitle, setNewAptTitle] = useState("");
  const [appointmentCategories, setAppointmentCategories] = useState(initialAppointmentCategories);
  const [newAptCategory, setNewAptCategory] = useState(appointmentCategories[0].name);
  const [newAptStartTime, setNewAptStartTime] = useState("09:00");
  const [newAptEndTime, setNewAptEndTime] = useState("10:00");

  // State for adding/deleting a new category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(colorPalette[0]);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);


  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024)

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  }

  const initialDate = new Date(selectedDate);
  const [weekViewStartDate, setWeekViewStartDate] = useState(getStartOfWeek(initialDate));

  const [appointments, setAppointments] = useState<{ [date: string]: { id: number; title: string; startTime: string; endTime: string; color: string; category: string }[] }>({
    "2025-06-10": [
        { id: 1, title: "Team Meeting", startTime: "10:00 A.M.", endTime: "11:00 A.M.", color: "#8B5CF6", category: "Work" },
        { id: 2, title: "Lunch with Client", startTime: "12:30 P.M.", endTime: "1:30 P.M.", color: "#6B7280", category: "Others" },
    ],
    "2025-06-13": [
        { id: 3, title: "Project Deadline", startTime: "9:00 A.M.", endTime: "10:30 A.M.", color: "#EF4444", category: "Urgent" },
    ],
    "2025-06-20": [
         { id: 4, title: "Appointment 1", startTime: "9.00 A.M.", endTime: "9.30 A.M.", color: "#10B981", category: "Personal" },
         { id: 5, title: "Appointment 2", startTime: "10.30 A.M.", endTime: "13.00 P.M.", color: "#8B5CF6", category: "Work" },
         { id: 6, title: "Appointment 3", startTime: "16.00 P.M.", endTime: "17.30 P.M.", color: "#6B7280", category: "Others" },
    ],
    "2025-07-10": [
        { id: 7, title: "Dentist Appointment", startTime: "14:00 P.M.", endTime: "15:00 P.M.", color: "#10B981", category: "Personal" },
    ]
  });

    const handleDeleteAppointment = (e: React.MouseEvent, dateStr: string, appointmentId: number) => {
        e.stopPropagation();
        setAppointments(prev => {
            const dayAppointments = prev[dateStr];
            if (!dayAppointments) return prev;

            const updatedAppointments = dayAppointments.filter(apt => apt.id !== appointmentId);
            const newAppointmentsState = { ...prev };

            if (updatedAppointments.length === 0) {
                delete newAppointmentsState[dateStr];
                setOpenDate(null);
            } else {
                newAppointmentsState[dateStr] = updatedAppointments;
            }
            return newAppointmentsState;
        });
    };

    const handleSaveNewAppointment = () => {
        if (!newAptTitle || !openDate) return;

        const newId = Date.now();
        const categoryDetails = appointmentCategories.find(c => c.name === newAptCategory);

        const formatTime = (time: string) => {
            let [hours, minutes] = time.split(':').map(Number);
            const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
            hours = hours % 12 || 12;
            return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        };

        const newAppointment = {
            id: newId,
            title: newAptTitle,
            startTime: formatTime(newAptStartTime),
            endTime: formatTime(newAptEndTime),
            category: newAptCategory,
            color: categoryDetails?.color || '#6B7280',
        };

        setAppointments(prev => {
            const updated = { ...prev };
            const dayApts = updated[openDate] ? [...updated[openDate], newAppointment] : [newAppointment];
            updated[openDate] = dayApts;
            return updated;
        });

        setIsCreatingInDropdown(false);
        setNewAptTitle("");
        setNewAptCategory(appointmentCategories[0].name);
    };

    const handleAddNewCategory = () => {
        if(!newCategoryName) return;

        const newCategory = {
            name: newCategoryName,
            color: newCategoryColor,
            textColor: "text-white"
        };
        setAppointmentCategories([...appointmentCategories, newCategory]);
        setNewAptCategory(newCategory.name);
        setNewCategoryName("");
        setIsAddingCategory(false);
        setIsColorPaletteOpen(false);
    };

    const handleDeleteCategory = (categoryNameToDelete: string) => {
        if (appointmentCategories.length <= 1) return; // Prevent deleting the last category
        setAppointmentCategories(appointmentCategories.filter(c => c.name !== categoryNameToDelete));
    };

    const toggleDeleteMode = () => {
        setIsDeletingCategory(!isDeletingCategory);
        setIsAddingCategory(false);
    }

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const daysOfWeekShort = ["S", "M", "T", "W", "T", "F", "S"]
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
  ]

  const getDaysInMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    const days = []
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isPrevMonth: true, isNextMonth: false })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true, isPrevMonth: false, isNextMonth: false })
    }
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ day, isCurrentMonth: false, isPrevMonth: false, isNextMonth: true })
    }
    return days
  }

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth, currentYear), [currentMonth, currentYear]);
  const miniCalendarDays = useMemo(() => getDaysInMonth(currentMonth, currentYear), [currentMonth, currentYear]);

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split('.').map(Number);
    if(time.includes(':')) [hours, minutes] = time.split(':').map(Number);

    if (period === 'P.M.' && hours !== 12) {
      hours += 12;
    }
    if (period === 'A.M.' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + (minutes || 0);
  };

  const sortedEventsForSelectedDate = useMemo(() => {
    return [...(appointments[selectedDate] || [])].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [appointments, selectedDate]);


  const handleDateClick = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean, isNextMonth: boolean, isMiniCalendar: boolean) => {
    let targetYear = currentYear;
    let targetMonth = currentMonth;

    if (isPrevMonth) {
      if (currentMonth === 0) {
        targetMonth = 11;
        targetYear = currentYear - 1;
      } else {
        targetMonth = currentMonth - 1;
      }
    } else if (isNextMonth) {
      if (currentMonth === 11) {
        targetMonth = 0;
        targetYear = currentYear + 1;
      } else {
        targetMonth = currentMonth + 1;
      }
    }

    const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    setSelectedDate(dateStr);
    setCurrentMonth(targetMonth);
    setCurrentYear(targetYear);

    const newDate = new Date(targetYear, targetMonth, day);
    setWeekViewStartDate(getStartOfWeek(newDate));
    setIsCreatingInDropdown(false);

    if (isMiniCalendar) {
      setOpenDate(null);
    } else {
      setOpenDate(openDate === dateStr ? null : dateStr);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    let newMonth, newYear;
    if (direction === "prev") {
        newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    } else {
        newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setOpenDate(null);
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(weekViewStartDate);
    newWeekStart.setDate(newWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setWeekViewStartDate(newWeekStart);
  }

  const weekDays = useMemo(() => {
    const week = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekViewStartDate);
        day.setDate(weekViewStartDate.getDate() + i);
        week.push(day);
    }
    return week;
  }, [weekViewStartDate]);

  const handleNavClick = (page: string) => {
    setActiveSection(page);
    setCurrentPage(page);
    if (windowWidth < 1024) {
    }
  }

  const [selectedYear, selectedMonth, selectedDayNum] = selectedDate.split('-').map(Number);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
        <style>{`
            @keyframes slide-down {
                from {
                    opacity: 0;
                    transform: translateY(-5px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .animate-dropdown {
                animation: slide-down 0.2s ease-out forwards;
            }
        `}</style>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-8 py-4 h-16 flex items-center flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800">{currentPage}</h1>
        </header>

        <div
          className="flex-1 overflow-auto p-8"
          style={{ background: 'linear-gradient(to bottom right, rgba(223, 240, 255, 0.8), rgba(255, 212, 242, 0.8))'}}
        >
          {currentPage === "Calendar" ? (
            <div className="flex flex-col lg:flex-row lg:space-x-8 h-full">
              <div className="w-full lg:w-72 flex flex-col space-y-6 flex-shrink-0 mb-8 lg:mb-0">
                {/* Mini Calendar */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigateMonth("prev")} className="p-1 rounded hover:bg-gray-100">
                      <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <h3 className="text-sm font-semibold text-gray-700">{monthNames[currentMonth]} {currentYear}</h3>
                    <button onClick={() => navigateMonth("next")} className="p-1 rounded hover:bg-gray-100">
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 text-xs text-center text-gray-400 font-medium">
                    {daysOfWeekShort.map((day) => <div key={day}>{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1 mt-2">
                    {miniCalendarDays.slice(0, 42).map((dayObj, index) => {
                      let cellMonth = currentMonth;
                      let cellYear = currentYear;
                      if (dayObj.isPrevMonth) {
                          cellMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                          cellYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                      } else if (dayObj.isNextMonth) {
                          cellMonth = currentMonth === 11 ? 0 : currentMonth + 1;
                          cellYear = currentMonth === 11 ? currentYear + 1 : currentYear;
                      }
                      const cellDateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
                      const isSelected = selectedDate === cellDateStr;

                      return (
                        <div
                          key={index}
                          className="h-8 flex items-center justify-center text-xs cursor-pointer"
                          onClick={() => handleDateClick(dayObj.day, dayObj.isCurrentMonth, dayObj.isPrevMonth, dayObj.isNextMonth, true)}
                        >
                          <div
                            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200
                              ${isSelected
                                ? "bg-[#FFD4F2] text-purple-700 font-semibold"
                                : dayObj.isCurrentMonth ? "text-gray-600 hover:bg-gray-100" : "text-gray-300"
                              }`}
                          >
                            {dayObj.day}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Events List Card */}
                 <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0">
                    <CardHeader className="p-4 border-b border-gray-200 flex justify-center items-center">
                        <CardTitle className="text-sm font-semibold flex items-center text-gray-700">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Events for {monthNames[selectedMonth - 1]} {selectedDayNum}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2 flex-1 overflow-y-auto">
                        {sortedEventsForSelectedDate.length > 0 ? (
                        <div className="relative">
                            <div className="space-y-2">
                            {sortedEventsForSelectedDate.map((appointment) => (
                                <div key={appointment.id} className={`flex items-start p-2 rounded-lg`}>
                                    <div className="relative w-full">
                                        <div className="absolute top-2 -left-px w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: `var(--color-background)` }}>
                                            <div style={{ backgroundColor: appointment.color }} className="w-full h-full rounded-full"></div>
                                        </div>
                                        <div className="pl-6">
                                        <p className="text-sm font-semibold text-gray-800">{appointment.title}</p>
                                        <p className="text-xs text-gray-400">{appointment.startTime} – {appointment.endTime}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        ) : (
                        <p className="text-center text-gray-500 text-sm py-4">No events for this day.</p>
                        )}
                    </CardContent>
                </div>
              </div>

              {/* Main Calendar View */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-lg border border-black/10 h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
                      <Button
                        variant='ghost'
                        size="sm"
                        onClick={() => setViewMode("Month")}
                        className={`rounded-full px-4 py-1 text-xs font-semibold transition-none ${viewMode === 'Month' ? 'bg-white text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
                      >
                        Month
                      </Button>
                      <Button
                        variant='ghost'
                        size="sm"
                        onClick={() => setViewMode("Week")}
                        className={`rounded-full px-4 py-1 text-xs font-semibold transition-none ${viewMode === 'Week' ? 'bg-white text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
                      >
                        Week
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4">
                        {viewMode === 'Week' && (
                             <div className="flex items-center space-x-2">
                                <button onClick={() => navigateWeek("prev")} className="p-1 rounded hover:bg-gray-100">
                                <ChevronLeft className="w-5 h-5 text-gray-500" />
                                </button>
                                <button onClick={() => navigateWeek("next")} className="p-1 rounded hover:bg-gray-100">
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        )}
                        <div className="text-lg font-semibold text-gray-800 mr-4">{viewMode === 'Week' ? `${monthNames[weekViewStartDate.getMonth()]} ${weekViewStartDate.getFullYear()}`: currentYear}</div>
                    </div>
                  </div>

                  {viewMode === "Month" ? (
                    <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: 'auto repeat(6, 1fr)' }}>
                      {daysOfWeek.map((day) => (
                        <div key={day} className="p-4 text-center border-b border-r border-gray-200">
                          <p className="font-semibold text-gray-600 text-sm">{day}</p>
                        </div>
                      ))}
                      {calendarDays.map((dayObj, index) => {
                        let cellMonth = currentMonth;
                        let cellYear = currentYear;
                        if (dayObj.isPrevMonth) {
                            cellMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                            cellYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                        } else if (dayObj.isNextMonth) {
                            cellMonth = currentMonth === 11 ? 0 : currentMonth + 1;
                            cellYear = currentMonth === 11 ? currentYear + 1 : currentYear;
                        }
                        const cellDateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;

                        const dayAppointments = appointments[cellDateStr] ? [...appointments[cellDateStr]].sort((a,b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)) : [];
                        const isDropdownOpen = openDate === cellDateStr;
                        const isSelected = selectedDate === cellDateStr;
                        const positionClassX = index % 7 > 3 ? 'right-0' : 'left-0';
                        const positionClassY = index >= 28 ? 'bottom-full mb-2' : 'top-full mt-2';

                        return (
                          <div
                            key={index}
                            className="p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors relative"
                            onClick={() => handleDateClick(dayObj.day, dayObj.isCurrentMonth, dayObj.isPrevMonth, dayObj.isNextMonth, false)}
                          >
                            <div className="flex flex-col h-full">
                                <p className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full self-start
                                 ${isSelected
                                    ? "bg-[#FFD4F2] text-purple-700"
                                    : dayObj.isCurrentMonth ? "text-gray-700" : "text-gray-300"
                                  }`}>
                                {dayObj.day}
                              </p>

                              {dayObj.isCurrentMonth && dayAppointments.length > 0 && !isDropdownOpen && (
                                <div className="flex items-center space-x-1 mt-1">
                                  {dayAppointments.slice(0, 3).map(apt => (
                                     <div key={apt.id} style={{backgroundColor: apt.color}} className={`w-1.5 h-1.5 rounded-full`}></div>
                                  ))}
                                </div>
                              )}

                            {isDropdownOpen && (
                                <div className={`absolute ${positionClassX} ${positionClassY} w-[300px] bg-white backdrop-blur-md shadow-xl rounded-lg border border-black/5 z-20 animate-dropdown`} onClick={e => e.stopPropagation()}>
                                    {isCreatingInDropdown ? (
                                        <div className="p-3">
                                            <p className="text-sm font-bold p-1 mb-2">New Appointment</p>
                                            <div className="space-y-3 p-1">
                                                <input value={newAptTitle} onChange={(e) => setNewAptTitle(e.target.value)} type="text" placeholder="Appointment Name" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-sm"/>
                                                <div>
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                        {appointmentCategories.map(cat => (
                                                            <button key={cat.name} onClick={() => isDeletingCategory ? handleDeleteCategory(cat.name) : setNewAptCategory(cat.name)} className={`px-3 py-1 text-xs rounded-full transition-all relative group ${newAptCategory === cat.name && !isDeletingCategory ? `font-semibold shadow-md` : 'bg-white text-gray-700 hover:bg-gray-100 border'}`} style={newAptCategory === cat.name && !isDeletingCategory ? {backgroundColor: cat.color, color: 'white'} : {}}>
                                                                {cat.name}
                                                                {isDeletingCategory && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</div>}
                                                            </button>
                                                        ))}
                                                        <button onClick={() => { setIsAddingCategory(!isAddingCategory); setIsDeletingCategory(false); setIsColorPaletteOpen(false); }} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600">+</button>
                                                        <button onClick={toggleDeleteMode} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDeletingCategory ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}><Trash2 className="w-3.5 h-3.5"/></button>
                                                    </div>
                                                    {isAddingCategory && (
                                                        <div className="p-2 mt-2 space-y-3 border-t border-pink-100 relative">
                                                            <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} type="text" placeholder="New Category Name" className="block w-full px-3 py-1 bg-white border border-gray-300 rounded-md text-xs"/>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => setIsColorPaletteOpen(!isColorPaletteOpen)} style={{backgroundColor: newCategoryColor}} className="w-6 h-6 rounded-full border-2 border-white shadow"></button>
                                                                <Button size="sm" onClick={handleAddNewCategory} className="bg-[#FFD4F2] hover:bg-[#FFD4F2]/90 text-purple-6    00">Add Category</Button>
                                                            </div>
                                                            {isColorPaletteOpen && (
                                                                <div className="p-2 rounded-md bg-white shadow-md border absolute z-10 flex flex-wrap gap-2">
                                                                    {colorPalette.map(color => (
                                                                        <button key={color} onClick={() => setNewCategoryColor(color)} style={{backgroundColor: color}} className={`w-6 h-6 rounded-full border-2 ${newCategoryColor === color ? 'border-blue-500' : 'border-transparent'}`}></button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <input value={newAptStartTime} onChange={e => setNewAptStartTime(e.target.value)} type="time" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"/>
                                                    <input value={newAptEndTime} onChange={e => setNewAptEndTime(e.target.value)} type="time" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"/>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-1 mt-3">
                                                <Button size="sm" variant="ghost" onClick={() => setIsCreatingInDropdown(false)}>Cancel</Button>
                                                <Button size="sm" onClick={handleSaveNewAppointment} className="bg-pink-500 hover:bg-pink-600 text-white">Save</Button>
                                            </div>
                                        </div>
                                    ) : (
                                      <div className="p-2">
                                        <div className="flex justify-between items-center mb-2 px-1">
                                            <h4 className="text-xs font-bold">Appointments</h4>
                                            <button onClick={() => setIsCreatingInDropdown(true)} className="text-purple-600 hover:text-purple-800">
                                                <PlusCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <ul className="space-y-1">
                                            {dayAppointments.length > 0 ? dayAppointments.map(apt => (
                                                <li key={apt.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-white/50 group">
                                                    <div style={{backgroundColor: apt.color}} className={`w-2 h-2 rounded-full flex-shrink-0`}></div>
                                                    <span className="text-xs font-semibold text-gray-800 flex-1 truncate">{apt.title}</span>
                                                    <span className="text-xs text-gray-400 ml-auto">{apt.startTime}</span>
                                                    <button onClick={(e) => handleDeleteAppointment(e, cellDateStr, apt.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3.5 h-3.5"/>
                                                    </button>
                                                </li>
                                            )) : <li className="text-xs text-center text-gray-400 py-2">No events. Add one!</li>}
                                        </ul>
                                      </div>
                                    )}
                                </div>
                            )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : ( // Week View
                    <div className="flex-1 flex flex-col overflow-auto">
                       <div className="grid grid-cols-8 flex-shrink-0">
                          <div className="p-4 border-b border-r border-gray-200"></div>
                          {weekDays.map((date, index) => {
                             const cellDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                             const isSelected = selectedDate === cellDateStr;
                             return (
                                <div key={index} className="p-4 text-center border-b border-r border-gray-200">
                                   <p className="text-xs text-gray-500">{daysOfWeek[date.getDay()].substring(0,3).toUpperCase()}</p>
                                   <p className={`font-semibold text-lg ${isSelected ? 'text-purple-600' : 'text-gray-700'}`}>{date.getDate()}</p>
                                </div>
                             )
                          })}
                       </div>
                       <div className="flex-1 grid grid-cols-8 relative">
                          {/* Hour Lines */}
                          <div className="col-span-1">
                            {Array.from({ length: 24 }, (_, hour) => (
                               <div key={hour} className="h-16 border-r border-b border-gray-200 flex justify-end items-start p-1">
                                  <p className="text-xs text-gray-400 -mt-2">{hour > 0 ? `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'AM' : 'PM'}` : ''}</p>
                               </div>
                            ))}
                          </div>
                          {/* Day Columns */}
                          {weekDays.map((day, dayIndex) => {
                            const dayDateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                            const dayAppointments = appointments[dayDateStr] || [];
                            return (
                                <div key={dayIndex} className="col-span-1 border-r relative">
                                    {/* Hour cells for grid lines */}
                                    {Array.from({ length: 24 }).map((_, hourIndex) => (
                                        <div key={hourIndex} className="h-16 border-b border-gray-200"></div>
                                    ))}
                                    {/* Appointments */}
                                    {dayAppointments.map(apt => {
                                        const startMinutes = timeToMinutes(apt.startTime);
                                        const endMinutes = apt.endTime ? timeToMinutes(apt.endTime) : startMinutes + 60;
                                        const durationMinutes = Math.max(30, endMinutes - startMinutes);

                                        const top = (startMinutes / (24*60)) * 100;
                                        const height = (durationMinutes / (24*60)) * 100;

                                        return (
                                            <div key={apt.id}
                                                 style={{ top: `${top}%`, height: `${height}%`, minHeight: '20px', backgroundColor: apt.color }}
                                                 className={`absolute left-2 right-2 p-2 rounded-lg text-white flex flex-col justify-center`}>
                                                <p className="text-xs font-bold truncate">{apt.title}</p>
                                                <p className="text-xs truncate">{apt.startTime} - {apt.endTime}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                          })}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <PageContent title={currentPage} />
          )}
        </div>
      </main>
    </div>
  )
}
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
  Edit2, // Added for edit icon
} from "lucide-react"
import React, { useState, useEffect, useMemo, useRef } from "react"
import Sidebar from "./sidebar"; 
import Header from "./header"

// Type Definitions
interface Appointment {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  completed: boolean; // Added for dot indicator logic
}

function PageContent({ title }: { title:string }) {
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

// Extracted CreationForm as a standalone component to prevent performance issues
const CreationForm = ({
    newAptTitle, setNewAptTitle, appointmentCategories, newAptCategory, setNewAptCategory,
    isDeletingCategory, handleDeleteCategory, isAddingCategory, setIsAddingCategory,
    toggleDeleteMode, newCategoryName, setNewCategoryName, newCategoryColor, setNewCategoryColor,
    handleAddNewCategory, newAptStartTime, setNewAptStartTime, newAptEndTime, setNewAptEndTime,
    handleSaveNewAppointment, setCreationDropdown, setEditingAppointmentId, setIsCreatingInDropdown
}) => (
    <div className="p-2.5 pt-2">
        <div className="space-y-2 p-1">
            <input value={newAptTitle} onChange={(e) => setNewAptTitle(e.target.value)} type="text" placeholder="Appointment Name" className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm"/>
            <div>
              <div className="flex flex-wrap gap-2 items-center">
                  {appointmentCategories.map(cat => (
                      <button key={cat.name} onClick={() => isDeletingCategory ? handleDeleteCategory(cat.name) : setNewAptCategory(cat.name)} className={`px-3 py-1 text-xs rounded-full transition-all relative group ${newAptCategory === cat.name && !isDeletingCategory ? `font-semibold shadow-md` : 'bg-white text-gray-700 hover:bg-gray-100 border'}`} style={newAptCategory === cat.name && !isDeletingCategory ? {backgroundColor: cat.color, color: 'white'} : {}}>
                          {cat.name}
                          {isDeletingCategory && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</div>}
                      </button>
                  ))}
                  {isAddingCategory ? (
                      <button onClick={() => setIsAddingCategory(false)} className="w-6 h-6 rounded-full flex items-center justify-center bg-red-100 text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                      </button>
                  ) : (
                      <button onClick={() => { setIsAddingCategory(true); }} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors">+</button>
                  )}
                  <button onClick={toggleDeleteMode} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDeletingCategory ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
              {isAddingCategory && (
                  <div className="p-2 mt-2 space-y-2.5 border-t">
                      <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} type="text" placeholder="New Category Name" className="block w-full px-3 py-1 bg-white border border-gray-300 rounded-md text-xs"/>
                      <div className="flex items-center gap-2">
                          <input
                              type="color"
                              value={newCategoryColor}
                              onChange={(e) => setNewCategoryColor(e.target.value)}
                              className="h-6 w-6 p-0 border-none rounded-md cursor-pointer bg-white"
                          />
                           <input
                              type="text"
                              value={newCategoryColor}
                              onChange={(e) => setNewCategoryColor(e.target.value)}
                              placeholder="#RRGGBB"
                              className="block w-full px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-mono"
                          />
                      </div>
                      <Button size="sm" onClick={handleAddNewCategory} className="bg-violet-500 hover:bg-violet-600 text-white w-full">Add Category</Button>
                  </div>
              )}
            </div>
            <div className="flex gap-2">
                <input value={newAptStartTime} onChange={e => setNewAptStartTime(e.target.value)} type="time" className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"/>
                <input value={newAptEndTime} onChange={e => setNewAptEndTime(e.target.value)} type="time" className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"/>
            </div>
        </div>
        <div className="flex justify-end gap-1 mt-2">
            <Button size="sm" variant="ghost" onClick={() => { setCreationDropdown(null); setEditingAppointmentId(null); setIsCreatingInDropdown(false); }}>Cancel</Button>
            <Button size="sm" onClick={handleSaveNewAppointment} className="bg-violet-500 hover:bg-violet-600 text-white">Save</Button>
        </div>
    </div>
);


export default function DochiCalendar() {
  const [activeSection, setActiveSection] = useState("Calendar")
  const [selectedDate, setSelectedDate] = useState<string>('2025-06-13')
  const [currentMonth, setCurrentMonth] = useState(5) // June = 5 (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025)
  const [viewMode, setViewMode] = useState<"Month" | "Week">("Week")

  const [currentPage, setCurrentPage] = useState("Calendar")
  const [openDate, setOpenDate] = useState<string | null>(null);

  // State for creating/editing appointments
  const [isCreatingInDropdown, setIsCreatingInDropdown] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [creationDropdown, setCreationDropdown] = useState<{ x: number, y: number, date: string, startTime: string } | null>(null);
  const [eventPopover, setEventPopover] = useState<{ x: number, y: number, appointment: Appointment, date: string } | null>(null);


  // State for new appointment form
  const [newAptTitle, setNewAptTitle] = useState("");
  const [appointmentCategories, setAppointmentCategories] = useState(initialAppointmentCategories);
  const [newAptCategory, setNewAptCategory] = useState(appointmentCategories[0].name);
  const [newAptStartTime, setNewAptStartTime] = useState("09:00");
  const [newAptEndTime, setNewAptEndTime] = useState("10:00");

  // State for adding/deleting a new category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6");
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024)
  const calendarGridRef = useRef<HTMLDivElement>(null);

  // Reset all temporary states when view or page changes
  useEffect(() => {
    setOpenDate(null);
    setEventPopover(null);
    setCreationDropdown(null);
    setIsAddingCategory(false);
    setIsDeletingCategory(false);
    setIsCreatingInDropdown(false);
    setEditingAppointmentId(null);
  }, [viewMode, currentPage]);


  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    // Assuming week starts on Monday, adjust if needed
    return d;
  }

  const initialDate = new Date(selectedDate);
  const [weekViewStartDate, setWeekViewStartDate] = useState(getStartOfWeek(initialDate));

  const [appointments, setAppointments] = useState<{ [date: string]: Appointment[] }>({
    "2025-06-10": [
        { id: 1, title: "Product Design Course", startTime: "09:30", endTime: "12:00", color: "#10B981", category: "Personal", completed: false },
    ],
    "2025-06-09": [
        { id: 2, title: "Conversational Interview", startTime: "12:30", endTime: "14:00", color: "#8B5CF6", category: "Work", completed: false },
    ],
    "2025-06-11": [
        { id: 3, title: "Usability testing", startTime: "09:00", endTime: "11:00", color: "#8B5CF6", category: "Work", completed: true },
        { id: 4, title: "App Design", startTime: "13:00", endTime: "15:30", color: "#10B981", category: "Personal", completed: false },
    ],
    "2025-06-13": [
         { id: 5, title: "Frontend developement", startTime: "10:00", endTime: "13:00", color: "#3B82F6", category: "Work", completed: false },
    ],
    "2025-07-10": [
        { id: 7, title: "Dentist Appointment", startTime: "2:00 P.M.", endTime: "3:00 P.M.", color: "#10B981", category: "Personal", completed: false },
    ]
  });

  const formatTimeForInput = (time: string) => {
    if (!time) return "00:00";
    if (time.includes("A.M.") || time.includes("P.M.")) {
      let [t, period] = time.split(' ');
      let [hours, minutes] = t.split(':').map(Number);
      if (period.toLowerCase().startsWith('p') && hours < 12) hours += 12;
      if (period.toLowerCase().startsWith('a') && hours === 12) hours = 0;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    const [hour, minute] = time.split(':');
    return `${hour.padStart(2, '0')}:${minute || '00'}`;
  };

  const handleSaveNewAppointment = () => {
    const targetDate = creationDropdown?.date || openDate || eventPopover?.date;
    if (!newAptTitle || !targetDate) return;
  
    const categoryDetails = appointmentCategories.find(c => c.name === newAptCategory);
  
    const formatTime12hr = (time: string) => {
      let [hours, minutes] = time.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
  
    if (editingAppointmentId) {
      // Update existing appointment
      setAppointments(prev => {
        const newState = { ...prev };
        const dayAppointments = newState[targetDate] || [];
        const updatedAppointments = dayAppointments.map(apt => {
          if (apt.id === editingAppointmentId) {
            return {
              ...apt,
              title: newAptTitle,
              startTime: formatTime12hr(newAptStartTime),
              endTime: formatTime12hr(newAptEndTime),
              category: newAptCategory,
              color: categoryDetails?.color || '#6B7280',
            };
          }
          return apt;
        }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        newState[targetDate] = updatedAppointments;
        return newState;
      });
    } else {
      // Create new appointment
      const newAppointment: Appointment = {
        id: Date.now(),
        title: newAptTitle,
        startTime: formatTime12hr(newAptStartTime),
        endTime: formatTime12hr(newAptEndTime),
        category: newAptCategory,
        color: categoryDetails?.color || '#6B7280',
        completed: false,
      };
  
      setAppointments(prev => {
        const updated = { ...prev };
        const dayApts = updated[targetDate] ? [...updated[targetDate], newAppointment] : [newAppointment];
        updated[targetDate] = dayApts.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        return updated;
      });
    }
  
    // Reset form and close dropdowns/popovers
    setIsCreatingInDropdown(false);
    setCreationDropdown(null);
    setEventPopover(null);
    setEditingAppointmentId(null);
    setNewAptTitle("");
    setNewAptCategory(appointmentCategories[0].name);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (creationDropdown && !target.closest('.creation-dropdown')) {
        setCreationDropdown(null);
      }
      if (eventPopover && !target.closest('.event-popover')) {
        setEventPopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [creationDropdown, eventPopover]);


    const handleDeleteAppointment = (e: React.MouseEvent, dateStr: string, appointmentId: number) => {
        e.stopPropagation();
        setAppointments(prev => {
            const dayAppointments = prev[dateStr];
            if (!dayAppointments) return prev;

            const updatedAppointments = dayAppointments.filter(apt => apt.id !== appointmentId);
            const newAppointmentsState = { ...prev };

            if (updatedAppointments.length === 0) {
                delete newAppointmentsState[dateStr];
            } else {
                newAppointmentsState[dateStr] = updatedAppointments;
            }
            setOpenDate(null);
            setEventPopover(null);
            return newAppointmentsState;
        });
    };

    const handleEditAppointment = (apt: Appointment, date: string) => {
      setEditingAppointmentId(apt.id);
      setNewAptTitle(apt.title);
      setNewAptCategory(apt.category);
      setNewAptStartTime(formatTimeForInput(apt.startTime));
      setNewAptEndTime(formatTimeForInput(apt.endTime));
      
      setIsCreatingInDropdown(true);

      if (viewMode === 'Week' && eventPopover) {
          const popoverPosition = { x: eventPopover.x, y: eventPopover.y };
          setCreationDropdown({ ...popoverPosition, date: date, startTime: apt.startTime });
          setEventPopover(null);
      }
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
    };

    const handleDeleteCategory = (categoryNameToDelete: string) => {
        if (appointmentCategories.length <= 1) return; // Prevent deleting the last category
        setAppointmentCategories(appointmentCategories.filter(c => c.name !== categoryNameToDelete));
    };

    const toggleDeleteMode = () => {
        setIsDeletingCategory(!isDeletingCategory);
        setIsAddingCategory(false);
    }

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
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
      const timeLower = timeStr.toLowerCase();
      
      if (timeLower.includes('a.m.') || timeLower.includes('p.m.')) {
          let [time, period] = timeLower.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (period.startsWith('p') && hours !== 12) hours += 12;
          if (period.startsWith('a') && hours === 12) hours = 0;
          return hours * 60 + (minutes || 0);
      }
      
      let [hours, minutes] = timeStr.split(':').map(Number);
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

    if (isMiniCalendar) {
        setOpenDate(null);
        setEventPopover(null);
    } else {
        if (openDate === dateStr) {
            setOpenDate(null);
        } else {
            setEventPopover(null);
            setOpenDate(dateStr);
        }
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
    setCreationDropdown(null);
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(weekViewStartDate);
    newWeekStart.setDate(newWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setWeekViewStartDate(newWeekStart);
    setCreationDropdown(null);
    setEventPopover(null);
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

  const newWeekRangeString = useMemo(() => {
    const startDate = weekDays[0];
    const endDate = weekDays[6];
    const startMonth = monthNames[startDate.getMonth()];
    
    return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
  }, [weekDays]);

  const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
    return weekNo;
  };

  const handleNavClick = (page: string) => {
    setActiveSection(page);
    setCurrentPage(page);
  }

  const [selectedYear, selectedMonth, selectedDayNum] = selectedDate.split('-').map(Number);

  const hexToRgba = (hex: string, opacity: number) => {
    if (!hex || hex.length < 4) return 'rgba(107, 114, 128, 0.2)'; // default gray
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const handleGridClick = (e: React.MouseEvent, dayDateStr: string) => {
    if ((e.target as HTMLElement).closest('.event-block')) {
        return;
    }

    const grid = calendarGridRef.current;
    if (!grid) return;

    // Calculate hour based on the vertical click position
    const gridRect = grid.getBoundingClientRect();
    const relativeY = e.clientY - gridRect.top;
    const hour = Math.floor(relativeY / (gridRect.height / 24));
    
    // Set form defaults
    setNewAptTitle('');
    setEditingAppointmentId(null);
    setNewAptStartTime(formatTimeForInput(`${hour}:00`));
    setNewAptEndTime(formatTimeForInput(`${hour + 1}:00`));

    // Position popover next to cursor, with boundary checks
    const popupWidth = 300;
    let popupX = e.clientX + 15;
    if (popupX + popupWidth > window.innerWidth) {
        popupX = e.clientX - popupWidth - 15;
    }

    setIsCreatingInDropdown(true);
    setCreationDropdown({
        x: popupX,
        y: e.clientY,
        date: dayDateStr,
        startTime: formatTimeForInput(`${hour}:00`),
    });
  };

  const handleEventClick = (e: React.MouseEvent<HTMLDivElement>, apt: Appointment, date: string) => {
    e.stopPropagation();
    const eventRect = e.currentTarget.getBoundingClientRect();
    
    const top = eventRect.top + (eventRect.height / 2);
    const left = eventRect.right;
    
    setOpenDate(null);
    setCreationDropdown(null);
    setEventPopover({
        x: left + 5,
        y: top,
        appointment: apt,
        date: date,
    });
  };

  const AppointmentListPopover = ({date}) => {
      const dayAppointments = appointments[date] || [];
      const creationFormProps = {
        newAptTitle, setNewAptTitle, appointmentCategories, newAptCategory, setNewAptCategory,
        isDeletingCategory, handleDeleteCategory, isAddingCategory, setIsAddingCategory,
        toggleDeleteMode, newCategoryName, setNewCategoryName, newCategoryColor, setNewCategoryColor,
        handleAddNewCategory, newAptStartTime, setNewAptStartTime, newAptEndTime, setNewAptEndTime,
        handleSaveNewAppointment, setCreationDropdown, setEditingAppointmentId, setIsCreatingInDropdown, editingAppointmentId
      };

      return (
          <div className="p-2.5">
              <div className="flex justify-between items-center mb-2 px-2">
                  <h4 className="text-sm font-bold">{isCreatingInDropdown ? (editingAppointmentId ? 'Edit Appointment' : 'New Appointment') : 'Appointments'}</h4>
                  {isCreatingInDropdown ? (
                      <button onClick={() => setIsCreatingInDropdown(false)} className="p-1 rounded-full hover:bg-red-100 text-red-500">
                          <X className="w-4 h-4"/>
                      </button>
                  ) : (
                      <button onClick={() => { setEditingAppointmentId(null); setNewAptTitle(''); setIsCreatingInDropdown(true); }} className="text-purple-600 hover:text-purple-800">
                          <PlusCircle className="w-4 h-4" />
                      </button>
                  )}
              </div>
              {isCreatingInDropdown ? <CreationForm {...creationFormProps} /> : (
                <ul className="space-y-1">
                    {dayAppointments.length > 0 ? dayAppointments.map(apt => (
                        <li key={apt.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-50 group">
                            <div style={{backgroundColor: apt.color}} className={`w-2 h-2 rounded-full flex-shrink-0`}></div>
                            <span className="text-xs font-semibold text-gray-800 flex-1 truncate">{apt.title}</span>
                            <span className="text-xs text-gray-400 ml-auto">{apt.startTime}</span>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditAppointment(apt, date)} className="text-gray-400 hover:text-blue-500 p-1"><Edit2 className="w-3.5 h-3.5"/></button>
                              <button onClick={(e) => handleDeleteAppointment(e, date, apt.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                            </div>
                        </li>
                    )) : <li className="text-xs text-center text-gray-400 py-2">No events. Add one!</li>}
                </ul>
              )}
            </div>
      )
  }
  
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
            input[type="color"] {
              -webkit-appearance: none;
              border: none;
              width: 24px;
              height: 24px;
            }
            input[type="color"]::-webkit-color-swatch-wrapper {
              padding: 0;
            }
            input[type="color"]::-webkit-color-swatch {
              border: 1px solid #d1d5db;
              border-radius: 0.375rem;
            }
        `}</style>

      <main className="flex-1 flex flex-col min-w-0">
        <Header currentPage="Calendar"/>

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
                      const dayAppointments = appointments[cellDateStr];
                      const firstUpcomingAppointment = dayAppointments?.find(apt => !apt.completed) || dayAppointments?.[0];

                      return (
                        <div
                          key={index}
                          className="h-10 flex items-center justify-center text-xs cursor-pointer"
                          onClick={() => handleDateClick(dayObj.day, dayObj.isCurrentMonth, dayObj.isPrevMonth, dayObj.isNextMonth, true)}
                        >
                          <div className={`w-7 h-7 flex flex-col items-center justify-center rounded-md transition-colors duration-200 relative ${isSelected ? "text-purple-700 font-semibold" : dayObj.isCurrentMonth ? "text-gray-600 hover:bg-gray-100" : "text-gray-300" }`}>
                            <span>{dayObj.day}</span>
                            {firstUpcomingAppointment && (
                              <div className="w-1.5 h-1.5 rounded-full absolute bottom-[-2px]" style={{ backgroundColor: firstUpcomingAppointment.color }}></div>
                            )}
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
                                        <p className={`text-sm font-semibold text-gray-800 ${appointment.completed ? 'line-through' : ''}`}>{appointment.title}</p>
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
                <div className="bg-white rounded-xl border border-black/10 h-full flex flex-col">
                  {/* DYNAMIC HEADER */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
                      <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
                          <Button variant='ghost' size="sm" onClick={() => setViewMode("Month")} className={`rounded-full px-4 py-1 text-xs font-semibold transition-none ${viewMode === 'Month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
                              Month
                          </Button>
                          <Button variant='ghost' size="sm" onClick={() => setViewMode("Week")} className={`rounded-full px-4 py-1 text-xs font-semibold transition-none ${viewMode === 'Week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
                              Week
                          </Button>
                      </div>

                      {viewMode === 'Week' ? (
                          <div className="flex items-center space-x-2 sm:space-x-4">
                              <div className="flex items-center space-x-1">
                                  <button onClick={() => navigateWeek("prev")} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                                  <button onClick={() => navigateWeek("next")} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
                              </div>
                              <h2 className="text-base sm:text-lg font-semibold text-gray-700 hidden md:block">{newWeekRangeString}</h2>
                              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded-md hidden lg:block">Week {getWeekNumber(weekDays[0])}</span>
                          </div>
                      ) : (
                           <div className="flex items-center space-x-4">
                               <div className="flex items-center space-x-2">
                                  <button onClick={() => navigateMonth("prev")} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                                  <button onClick={() => navigateMonth("next")} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
                              </div>
                              <div className="text-lg font-semibold text-gray-800">{monthNames[currentMonth]} {currentYear}</div>
                          </div>
                      )}
                  </div>

                  {viewMode === "Month" ? (
                    <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: 'auto repeat(6, 1fr)' }}>
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (<div key={day} className="p-4 text-center border-b border-r border-gray-200"><p className="font-semibold text-gray-600 text-sm">{day}</p></div>))}
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
                        const isDropdownOpen = openDate === cellDateStr;
                        const isSelected = selectedDate === cellDateStr;
                        const positionClassX = index % 7 > 3 ? 'right-0' : 'left-0';
                        const positionClassY = index >= 28 ? 'bottom-12' : 'top-12';

                        return (
                          <div key={cellDateStr} className="p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors relative" onClick={() => handleDateClick(dayObj.day, dayObj.isCurrentMonth, dayObj.isPrevMonth, dayObj.isNextMonth, false)}>
                            <div className="flex flex-col h-full">
                                <p className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full self-start ${isSelected ? "bg-[#FFD4F2] text-purple-700" : dayObj.isCurrentMonth ? "text-gray-700" : "text-gray-300"}`}>{dayObj.day}</p>
                                {dayObj.isCurrentMonth && (appointments[cellDateStr] || []).length > 0 && !isDropdownOpen && (<div className="flex items-center space-x-1 mt-1">{(appointments[cellDateStr] || []).slice(0, 3).map(apt => (<div key={apt.id} style={{backgroundColor: apt.color}} className={`w-1.5 h-1.5 rounded-full`}></div>))}</div>)}
                            </div>
                            {isDropdownOpen && (
                                <div className={`creation-dropdown absolute ${positionClassX} ${positionClassY} w-[300px] bg-white backdrop-blur-md shadow-xl rounded-lg border border-black/5 z-20 animate-dropdown`} onClick={e => e.stopPropagation()}>
                                  <AppointmentListPopover date={cellDateStr} />
                                </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : ( // NEW WEEK VIEW
                    <div className="flex-1 flex flex-col overflow-auto" ref={calendarGridRef}>
                        <div className="grid grid-cols-[auto_1fr] flex-shrink-0 sticky top-0 bg-white z-10 border-b border-gray-200">
                            <div className="w-16"></div>
                            <div className="grid grid-cols-7">
                                {weekDays.map((day) => {
                                    const today = new Date();
                                    const isToday = day.getFullYear() === today.getFullYear() && day.getMonth() === today.getMonth() && day.getDate() === today.getDate();
                                    return (
                                        <div key={day.toISOString()} className="py-3 text-center border-r border-gray-200">
                                            <p className="text-xs text-gray-400 font-medium">{daysOfWeek[day.getDay()]}</p>
                                            <p className={`text-2xl mt-1 font-bold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{day.getDate()}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-[auto_1fr] relative">
                            <div className="w-16">
                                {Array.from({ length: 24 }, (_, hour) => (
                                    <div key={hour} className="h-16 border-r border-gray-200 relative">
                                        <p className="text-xs text-gray-400 absolute -top-2 left-4">
                                            {hour > 0 ? `${String(hour).padStart(2, '0')}:00` : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 col-span-1">
                                {weekDays.map((day) => {
                                    const dayDateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                                    const dayAppointments = (appointments[dayDateStr] || []).sort((a,b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
                                    return (
                                        <div key={day.toISOString()} className="col-span-1 border-r border-gray-200 relative cursor-pointer" onClick={(e) => handleGridClick(e, dayDateStr)}>
                                            {Array.from({ length: 24 }).map((_, hourIndex) => (
                                                <div key={hourIndex} className="h-16 border-b border-gray-200"></div>
                                            ))}
                                            {dayAppointments.map(apt => {
                                                const startMinutes = timeToMinutes(apt.startTime);
                                                const endMinutes = apt.endTime ? timeToMinutes(apt.endTime) : startMinutes + 60;
                                                const durationMinutes = Math.max(30, endMinutes - startMinutes);
                                                const top = (startMinutes / (24 * 60)) * 100;
                                                const height = (durationMinutes / (24 * 60)) * 100;
                                                
                                                return (
                                                    <div 
                                                        key={apt.id} 
                                                        onClick={(e) => handleEventClick(e, apt, dayDateStr)} 
                                                        style={{ 
                                                            top: `${top}%`, 
                                                            height: `${height}%`, 
                                                            backgroundColor: hexToRgba(apt.color, 0.2),
                                                            borderColor: apt.color
                                                        }} 
                                                        className={`event-block absolute left-2 right-2 p-2 rounded-md border-l-4 flex flex-col justify-center overflow-hidden`}
                                                    >
                                                        <p className="text-sm font-bold text-gray-800 truncate">{apt.title}</p>
                                                        <p className="text-xs text-gray-500 truncate">{apt.startTime} - {apt.endTime}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <PageContent title={currentPage} />
          )}

          {/* Popovers for Week View are now fixed to the viewport */}
          {creationDropdown && (
            <div className="creation-dropdown fixed w-[300px] bg-white backdrop-blur-md shadow-xl rounded-lg border border-black/5 z-20 animate-dropdown transform -translate-y-1/2" style={{ top: creationDropdown.y, left: creationDropdown.x }}>
                  <AppointmentListPopover date={creationDropdown.date} />
            </div>
          )}

          {eventPopover && (
              <div className="event-popover fixed w-[300px] bg-white backdrop-blur-md shadow-xl rounded-lg border border-black/5 z-20 animate-dropdown transform -translate-y-1/2" style={{ top: eventPopover.y, left: eventPopover.x }}>
                <AppointmentListPopover date={eventPopover.date} />
              </div>
          )}
        </div>
      </main>
    </div>
  )
}
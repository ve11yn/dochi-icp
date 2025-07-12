"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit2,
  PlusCircle,
  Trash2,
  X,
  Loader2
} from "lucide-react";
import React, { useState, useEffect, useMemo, useRef, memo, useCallback } from "react";
import Header from "./header";
import { calendarService, Appointment, Category } from '../services/calendarServices'; // Import the service

// --- Helper function to format dates as YYYY-MM-DD ---
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const today = new Date();

// --- Type Definitions ---
interface CalendarDay {
    day: number;
    isCurrentMonth: boolean;
    isPrevMonth: boolean;
    isNextMonth: boolean;
}

interface CreationFormProps {
    newAptTitle: string;
    setNewAptTitle: (title: string) => void;
    appointmentCategories: Category[];
    newAptCategory: string;
    setNewAptCategory: (category: string) => void;
    isDeletingCategory: boolean;
    handleDeleteCategory: (categoryName: string) => void;
    isAddingCategory: boolean;
    setIsAddingCategory: (isAdding: boolean) => void;
    toggleDeleteMode: () => void;
    newCategoryName: string;
    setNewCategoryName: (name: string) => void;
    newCategoryColor: string;
    setNewCategoryColor: (color: string) => void;
    handleAddNewCategory: () => void;
    newAptStartTime: string;
    setNewAptStartTime: (time: string) => void;
    newAptEndTime: string;
    setNewAptEndTime: (time: string) => void;
    handleSaveNewAppointment: () => void;
    closeAllPopups: () => void;
    editingAppointmentId: number | null;
}

interface AppointmentListPopoverProps {
    date: string;
    appointments: { [date: string]: Appointment[] };
    isCreatingInDropdown: boolean;
    setIsCreatingInDropdown: (isCreating: boolean) => void;
    editingAppointmentId: number | null;
    setEditingAppointmentId: (id: number | null) => void;
    handleEditAppointment: (apt: Appointment, date: string) => void;
    handleDeleteAppointment: (e: React.MouseEvent, dateStr: string, appointmentId: number) => void;
    creationFormProps: CreationFormProps;
    closeAllPopups: () => void;
}

// --- SUB-COMPONENTS ---

const CreationForm: React.FC<CreationFormProps> = memo(({
    newAptTitle, setNewAptTitle, appointmentCategories, newAptCategory, setNewAptCategory,
    isDeletingCategory, handleDeleteCategory, isAddingCategory, setIsAddingCategory,
    toggleDeleteMode, newCategoryName, setNewCategoryName, newCategoryColor, setNewCategoryColor,
    handleAddNewCategory, newAptStartTime, setNewAptStartTime, newAptEndTime, setNewAptEndTime,
    handleSaveNewAppointment, closeAllPopups
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
                      <button onClick={() => setIsAddingCategory(false)} className="w-6 h-6 rounded-full flex items-center justify-center bg-red-100 text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  ) : (
                      <button onClick={() => setIsAddingCategory(true)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors">+</button>
                  )}
                  <button onClick={toggleDeleteMode} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDeletingCategory ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
              {isAddingCategory && (
                  <div className="p-2 mt-2 space-y-2.5 border-t">
                      <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} type="text" placeholder="New Category Name" className="block w-full px-3 py-1 bg-white border border-gray-300 rounded-md text-xs"/>
                      <div className="flex items-center gap-2">
                          <input type="color" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} className="h-6 w-6 p-0 border-none rounded-md cursor-pointer bg-white" />
                          <input type="text" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} placeholder="#RRGGBB" className="block w-full px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-mono" />
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
            <Button size="sm" variant="ghost" onClick={closeAllPopups}>Cancel</Button>
            <Button size="sm" onClick={handleSaveNewAppointment} className="bg-violet-500 hover:bg-violet-600 text-white">Save</Button>
        </div>
    </div>
));

const AppointmentListPopover: React.FC<AppointmentListPopoverProps> = ({
    date, appointments, isCreatingInDropdown, setIsCreatingInDropdown, editingAppointmentId, setEditingAppointmentId,
    handleEditAppointment, handleDeleteAppointment, creationFormProps, closeAllPopups
}) => {
    const dayAppointments = appointments[date] || [];
    const { setNewAptTitle } = creationFormProps;

    return (
        <div className="p-2.5">
            <div className="flex justify-between items-center mb-2 px-2">
                <h4 className="text-sm font-bold">{isCreatingInDropdown ? (editingAppointmentId ? 'Edit Appointment' : 'New Appointment') : 'Appointments'}</h4>
                {isCreatingInDropdown ? (
                    <button onClick={closeAllPopups} className="p-1 rounded-full hover:bg-red-100 text-red-500"><X className="w-4 h-4"/></button>
                ) : (
                    <button onClick={() => { setEditingAppointmentId(null); setNewAptTitle(''); setIsCreatingInDropdown(true); }} className="text-purple-600 hover:text-purple-800"><PlusCircle className="w-4 h-4" /></button>
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
};

// --- MAIN PAGE COMPONENT ---
export default function DochiCalendar() {
  // --- States ---
  const [appointments, setAppointments] = useState<{ [date: string]: Appointment[] }>({});
  const [appointmentCategories, setAppointmentCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState<"Week" | "Month">("Month");
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [isCreatingInDropdown, setIsCreatingInDropdown] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [creationDropdown, setCreationDropdown] = useState<{ x: number, y: number, date: string, startTime: string } | null>(null);
  const [eventPopover, setEventPopover] = useState<{ x: number, y: number, appointment: Appointment, date: string } | null>(null);
  const [newAptTitle, setNewAptTitle] = useState("");
  const [newAptCategory, setNewAptCategory] = useState("");
  const [newAptStartTime, setNewAptStartTime] = useState("09:00");
  const [newAptEndTime, setNewAptEndTime] = useState("10:00");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6");
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const calendarGridRef = useRef<HTMLDivElement>(null);

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const [weekViewStartDate, setWeekViewStartDate] = useState(getStartOfWeek(today));

  // --- Fetch data from backend on component mount ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [fetchedAppointments, fetchedCategories] = await Promise.all([
          calendarService.getAppointments(),
          calendarService.getCategories(),
        ]);
        setAppointments(fetchedAppointments);
        setAppointmentCategories(fetchedCategories);
        if (fetchedCategories.length > 0 && !newAptCategory) {
          setNewAptCategory(fetchedCategories[0].name);
        }
      } catch (err) {
        console.error("Failed to load calendar data:", err);
        setError("Could not load calendar data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);


  // --- Utility Functions ---
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };
  
  const formatTimeForInput = (time: string): string => {
    if (!time) return "00:00";
    const [hour, minute] = time.split(':');
    return `${String(hour).padStart(2, '0')}:${String(minute || '00').padStart(2, '0')}`;
  };

  const hexToRgba = (hex: string, opacity: number): string => {
    if (!hex || hex.length < 4) return 'rgba(107, 114, 128, 0.2)';
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const closeAllPopups = useCallback(() => {
    setCreationDropdown(null);
    setEventPopover(null);
    setEditingAppointmentId(null);
    setIsCreatingInDropdown(false);
    setOpenDate(null);
  }, []);

  // --- Event Handlers & Logic (Updated to call the service) ---
  const handleSaveNewAppointment = async () => {
    const targetDate = creationDropdown?.date || openDate || eventPopover?.date;
    if (!newAptTitle || !targetDate) return;

    try {
      if (editingAppointmentId) {
        const updates = {
          title: newAptTitle,
          startTime: newAptStartTime,
          endTime: newAptEndTime,
          category: newAptCategory,
          color: appointmentCategories.find(c => c.name === newAptCategory)?.color || '#6B7280',
        };
        const updatedAppointment = await calendarService.updateAppointment(targetDate, editingAppointmentId, updates);
        setAppointments(prev => ({
          ...prev,
          [targetDate]: (prev[targetDate] || []).map(apt => apt.id === editingAppointmentId ? updatedAppointment : apt),
        }));
      } else {
        const newAppointmentData = {
          title: newAptTitle,
          startTime: newAptStartTime,
          endTime: newAptEndTime,
          category: newAptCategory,
          color: appointmentCategories.find(c => c.name === newAptCategory)?.color || '#6B7280',
        };
        const createdAppointment = await calendarService.createAppointment(targetDate, newAppointmentData as any);
        setAppointments(prev => ({
          ...prev,
          [targetDate]: [...(prev[targetDate] || []), createdAppointment],
        }));
      }
      
      closeAllPopups();
      setNewAptTitle("");
      if (appointmentCategories.length > 0) {
        setNewAptCategory(appointmentCategories[0].name);
      }
    } catch (err) {
      console.error("Failed to save appointment:", err);
      setError("Failed to save appointment.");
    }
  };

  const handleDeleteAppointment = async (e: React.MouseEvent, dateStr: string, appointmentId: number) => {
    e.stopPropagation();
    try {
      await calendarService.deleteAppointment(dateStr, appointmentId);
      setAppointments(prev => {
        const newDayApts = (prev[dateStr] || []).filter(apt => apt.id !== appointmentId);
        if (newDayApts.length === 0) {
          const newState = { ...prev };
          delete newState[dateStr];
          return newState;
        }
        return { ...prev, [dateStr]: newDayApts };
      });
      closeAllPopups();
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      setError("Failed to delete appointment.");
    }
  };
    
  const handleEditAppointment = (apt: Appointment, date: string) => {
    closeAllPopups();
    setEditingAppointmentId(apt.id);
    setNewAptTitle(apt.title);
    setNewAptCategory(apt.category);
    setNewAptStartTime(formatTimeForInput(apt.startTime));
    setNewAptEndTime(formatTimeForInput(apt.endTime));
    
    if (viewMode === 'Week') {
        const eventElement = document.querySelector(`[data-apt-id="${apt.id}"]`);
        if (eventElement) {
            const eventRect = eventElement.getBoundingClientRect();
            const top = eventRect.top + (eventRect.height / 2);
            const left = eventRect.right + 5;
            setCreationDropdown({ x: left, y: top, date: date, startTime: apt.startTime });
        }
    } else {
        setOpenDate(date);
    }
    setIsCreatingInDropdown(true);
  };

  const handleAddNewCategory = async () => {
    if(!newCategoryName) return;
    try {
        const newCategoryData = {
            name: newCategoryName,
            color: newCategoryColor,
            textColor: "text-white"
        };
        const createdCategory = await calendarService.createCategory(newCategoryData);
        setAppointmentCategories([...appointmentCategories, createdCategory]);
        setNewAptCategory(createdCategory.name);
        setNewCategoryName("");
        setIsAddingCategory(false);
    } catch (err) {
        console.error("Failed to add category:", err);
        setError("Failed to add new category.");
    }
  };

  const handleDeleteCategory = async (categoryNameToDelete: string) => {
    if (appointmentCategories.length <= 1) return;
    try {
        await calendarService.deleteCategory(categoryNameToDelete);
        setAppointmentCategories(appointmentCategories.filter(c => c.name !== categoryNameToDelete));
    } catch(err) {
        console.error("Failed to delete category:", err);
        setError("Failed to delete category.");
    }
  };
  
  const toggleDeleteMode = () => setIsDeletingCategory(!isDeletingCategory);
  
  const getDaysInMonth = (month: number, year: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    const days: CalendarDay[] = []
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

  const sortedEventsForSelectedDate = useMemo(() => {
    return [...(appointments[selectedDate] || [])].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [appointments, selectedDate]);

  const popoverProps: Omit<AppointmentListPopoverProps, 'date'> = {
    appointments,
    isCreatingInDropdown,
    setIsCreatingInDropdown,
    editingAppointmentId,
    setEditingAppointmentId,
    handleEditAppointment,
    handleDeleteAppointment,
    closeAllPopups,
    creationFormProps: {
        newAptTitle, setNewAptTitle, appointmentCategories, newAptCategory, setNewAptCategory,
        isDeletingCategory, handleDeleteCategory, isAddingCategory, setIsAddingCategory,
        toggleDeleteMode, newCategoryName, setNewCategoryName, newCategoryColor, setNewCategoryColor,
        handleAddNewCategory, newAptStartTime, setNewAptStartTime, newAptEndTime, setNewAptEndTime,
        handleSaveNewAppointment, closeAllPopups,
        editingAppointmentId
    }
  };

  const handleDateClick = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean, isNextMonth: boolean, isMiniCalendar: boolean) => {
    let targetYear = currentYear;
    let targetMonth = currentMonth;

    if (isPrevMonth) {
      targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    } else if (isNextMonth) {
      targetMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      targetYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    }

    const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    setSelectedDate(dateStr);
    setCurrentMonth(targetMonth);
    setCurrentYear(targetYear);

    setWeekViewStartDate(getStartOfWeek(new Date(targetYear, targetMonth, day)));

    if (!isMiniCalendar) {
        if (openDate === dateStr) {
            closeAllPopups();
        } else {
            closeAllPopups();
            setOpenDate(dateStr);
        }
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = direction === "prev" ? (currentMonth === 0 ? 11 : currentMonth - 1) : (currentMonth === 11 ? 0 : currentMonth + 1);
    const newYear = direction === "prev" && currentMonth === 0 ? currentYear - 1 : (direction === "next" && currentMonth === 11 ? currentYear + 1 : currentYear);
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    closeAllPopups();
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(weekViewStartDate);
    newWeekStart.setDate(newWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setWeekViewStartDate(newWeekStart);
    closeAllPopups();
  };

  const handleGridClick = (e: React.MouseEvent, dayDateStr: string) => {
    if ((e.target as HTMLElement).closest('.event-block')) return;

    if (creationDropdown) {
        closeAllPopups();
        return;
    }
    
    closeAllPopups();

    const grid = calendarGridRef.current;
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    const relativeY = e.clientY - gridRect.top;
    const hour = Math.floor(relativeY / (gridRect.height / 24));
    
    setNewAptTitle('');
    setEditingAppointmentId(null);
    setNewAptStartTime(formatTimeForInput(`${hour}:00`));
    setNewAptEndTime(formatTimeForInput(`${hour + 1}:00`));

    const popupWidth = 300;
    const popupX = e.clientX + 15 + popupWidth > window.innerWidth ? e.clientX - popupWidth - 15 : e.clientX + 15;

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

    if (eventPopover?.appointment.id === apt.id) {
        closeAllPopups();
        return;
    }
    
    closeAllPopups();

    const eventRect = e.currentTarget.getBoundingClientRect();
    const top = eventRect.top + (eventRect.height / 2);
    const left = eventRect.right + 5;
    
    setEventPopover({ x: left, y: top, appointment: apt, date: date });
  };
    
  const handleSetViewMode = (mode: "Week" | "Month") => {
    closeAllPopups();
    setViewMode(mode);
  };

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const daysOfWeekShort = ["S", "M", "T", "W", "T", "F", "S"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [selectedYear, selectedMonth, selectedDayNum] = selectedDate.split('-').map(Number);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekViewStartDate);
    day.setDate(weekViewStartDate.getDate() + i);
    return day;
  }), [weekViewStartDate]);

  const newWeekRangeString = useMemo(() => {
    const startDate = weekDays[0];
    const endDate = weekDays[6];
    const startMonthName = monthNames[startDate.getMonth()];
    const endMonthName = monthNames[endDate.getMonth()];
    if(startMonthName === endMonthName){
      return `${startMonthName} ${startDate.getDate()} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
    }
    return `${startMonthName} ${startDate.getDate()} - ${endMonthName} ${endDate.getDate()}, ${endDate.getFullYear()}`;
  }, [weekDays, monthNames]);

  const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  };
  
  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-white">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600"/>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-red-50 text-red-700">
            Error: {error}
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
        <style>{`
            @keyframes slide-down { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            .animate-dropdown { animation: slide-down 0.2s ease-out forwards; }
            input[type="color"] { -webkit-appearance: none; border: none; width: 24px; height: 24px; }
            input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
            input[type="color"]::-webkit-color-swatch { border: 1px solid #d1d5db; border-radius: 0.375rem; }
        `}</style>

      <main className="flex-1 flex flex-col min-w-0">
        <Header currentPage="Calendar"/>
        <div className="flex-1 overflow-auto p-8" style={{ background: 'linear-gradient(to bottom right, rgba(223, 240, 255, 0.8), rgba(255, 212, 242, 0.8))'}}>
            <div className="flex flex-col lg:flex-row lg:space-x-8 h-full">
              <div className="w-full lg:w-72 flex flex-col space-y-6 flex-shrink-0 mb-8 lg:mb-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigateMonth("prev")} className="p-1 rounded hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                    <h3 className="text-sm font-semibold text-gray-700">{monthNames[currentMonth]} {currentYear}</h3>
                    <button onClick={() => navigateMonth("next")} className="p-1 rounded hover:bg-gray-100"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 text-xs text-center text-gray-400 font-medium">
                    {daysOfWeekShort.map((day) => <div key={day}>{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1 mt-2">
                    {miniCalendarDays.slice(0, 42).map((dayObj, index) => {
                      const cellMonth = dayObj.isPrevMonth ? (currentMonth === 0 ? 11 : currentMonth - 1) : (dayObj.isNextMonth ? (currentMonth === 11 ? 0 : currentMonth + 1) : currentMonth);
                      const cellYear = dayObj.isPrevMonth && currentMonth === 0 ? currentYear - 1 : (dayObj.isNextMonth && currentMonth === 11 ? currentYear + 1 : currentYear);
                      const cellDateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
                      const dayAppointments = appointments[cellDateStr];
                      return (
                        <div key={index} className="h-10 flex items-center justify-center text-xs cursor-pointer" onClick={() => handleDateClick(dayObj.day, dayObj.isCurrentMonth, dayObj.isPrevMonth, dayObj.isNextMonth, true)}>
                          <div className={`w-7 h-7 flex flex-col items-center justify-center rounded-md transition-colors duration-200 relative ${selectedDate === cellDateStr ? "text-purple-700 font-semibold" : dayObj.isCurrentMonth ? "text-gray-600 hover:bg-gray-100" : "text-gray-300"}`}>
                            <span>{dayObj.day}</span>
                            {dayAppointments?.[0] && (<div className="w-1.5 h-1.5 rounded-full absolute bottom-[-2px]" style={{ backgroundColor: dayAppointments[0].color }}></div>)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                 <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0">
                    <CardHeader className="p-4 border-b border-gray-200 flex justify-center items-center"><CardTitle className="text-sm font-semibold flex items-center text-gray-700"><ClipboardList className="w-4 h-4 mr-2" />Events for {monthNames[selectedMonth - 1]} {selectedDayNum}</CardTitle></CardHeader>
                    <CardContent className="p-4 space-y-2 flex-1 overflow-y-auto">{sortedEventsForSelectedDate.length > 0 ? (<div className="relative"><div className="space-y-2">{sortedEventsForSelectedDate.map((appointment) => (<div key={appointment.id} className={`flex items-start p-2 rounded-lg`}><div className="relative w-full"><div className="absolute top-2 -left-px w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: `var(--color-background)` }}><div style={{ backgroundColor: appointment.color }} className="w-full h-full rounded-full"></div></div><div className="pl-6"><p className={`text-sm font-semibold text-gray-800 ${appointment.completed ? 'line-through' : ''}`}>{appointment.title}</p><p className="text-xs text-gray-400">{appointment.startTime} – {appointment.endTime}</p></div></div></div>))}</div></div>) : (<p className="text-center text-gray-500 text-sm py-4">No events for this day.</p>)}</CardContent>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-xl border border-black/10 h-full flex flex-col">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
                      <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
                          <Button variant='ghost' size="sm" onClick={() => handleSetViewMode("Month")} className={`rounded-full px-4 py-1 text-xs font-semibold transition-none ${viewMode === 'Month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Month</Button>
                          <Button variant='ghost' size="sm" onClick={() => handleSetViewMode("Week")} className={`rounded-full px-4 py-1 text-xs font-semibold transition-none ${viewMode === 'Week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Week</Button>
                      </div>
                      {viewMode === 'Week' ? (<div className="flex items-center space-x-2 sm:space-x-4"><div className="flex items-center space-x-1"><button onClick={() => navigateWeek("prev")} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button><button onClick={() => navigateWeek("next")} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-5 h-5 text-gray-500" /></button></div><h2 className="text-base sm:text-lg font-semibold text-gray-700 hidden md:block">{newWeekRangeString}</h2><span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded-md hidden lg:block">Week {getWeekNumber(weekDays[0])}</span></div>) : (<div className="flex items-center space-x-4"><div className="flex items-center space-x-2"><button onClick={() => navigateMonth("prev")} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button><button onClick={() => navigateMonth("next")} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight className="w-5 h-5 text-gray-500" /></button></div><div className="text-lg font-semibold text-gray-800">{monthNames[currentMonth]} {currentYear}</div></div>)}
                  </div>

                  {viewMode === "Month" ? (
                    <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: 'auto repeat(6, 1fr)' }}>
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (<div key={day} className="p-4 text-center border-b border-r border-gray-200"><p className="font-semibold text-gray-600 text-sm">{day}</p></div>))}
                      {calendarDays.map((dayObj, index) => {
                        const cellMonth = dayObj.isPrevMonth ? (currentMonth === 0 ? 11 : currentMonth - 1) : (dayObj.isNextMonth ? (currentMonth === 11 ? 0 : currentMonth + 1) : currentMonth);
                        const cellYear = dayObj.isPrevMonth && currentMonth === 0 ? currentYear - 1 : (dayObj.isNextMonth && currentMonth === 11 ? currentYear + 1 : currentYear);
                        const cellDateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
                        return (
                          <div key={cellDateStr} className="p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors relative" onClick={() => handleDateClick(dayObj.day, dayObj.isCurrentMonth, dayObj.isPrevMonth, dayObj.isNextMonth, false)}>
                            <div className="flex flex-col h-full">
                                <p className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full self-start ${selectedDate === cellDateStr ? "bg-[#FFD4F2] text-purple-700" : dayObj.isCurrentMonth ? "text-gray-700" : "text-gray-300"}`}>{dayObj.day}</p>
                                {dayObj.isCurrentMonth && (appointments[cellDateStr] || []).length > 0 && openDate !== cellDateStr && (<div className="flex items-center space-x-1 mt-1">{(appointments[cellDateStr] || []).slice(0, 3).map(apt => (<div key={apt.id} style={{backgroundColor: apt.color}} className={`w-1.5 h-1.5 rounded-full`}></div>))}</div>)}
                            </div>
                            {openDate === cellDateStr && (<div className={`creation-dropdown absolute ${index % 7 > 3 ? 'right-0' : 'left-0'} ${index >= 28 ? 'bottom-12' : 'top-12'} w-[300px] bg-white backdrop-blur-md shadow-xl rounded-lg border border-black/5 z-20 animate-dropdown`} onClick={e => e.stopPropagation()}><AppointmentListPopover date={cellDateStr} {...popoverProps} /></div>)}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col overflow-auto" ref={calendarGridRef}>
                        <div className="grid grid-cols-[auto_1fr] flex-shrink-0 sticky top-0 bg-white z-10 border-b border-gray-200">
                            <div className="w-16"></div><div className="grid grid-cols-7">{weekDays.map((day) => (<div key={day.toISOString()} className="py-3 text-center border-r border-gray-200"><p className="text-xs text-gray-400 font-medium">{daysOfWeek[day.getDay()]}</p><p className={`text-2xl mt-1 font-bold ${formatDate(day) === formatDate(new Date()) ? 'text-indigo-600' : 'text-gray-700'}`}>{day.getDate()}</p></div>))}</div>
                        </div>
                        <div className="flex-1 grid grid-cols-[auto_1fr] relative">
                            <div className="w-16">{Array.from({ length: 24 }, (_, hour) => (<div key={hour} className="h-16 border-r border-gray-200 relative"><p className="text-xs text-gray-400 absolute -top-2 left-4">{hour > 0 ? `${String(hour).padStart(2, '0')}:00` : ''}</p></div>))}</div>
                            <div className="grid grid-cols-7 col-span-1">
                                {weekDays.map((day) => {
                                    const dayDateStr = formatDate(day);
                                    const dayAppointments = (appointments[dayDateStr] || []).sort((a,b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
                                    return (
                                        <div key={day.toISOString()} className="col-span-1 border-r border-gray-200 relative cursor-pointer" onClick={(e) => handleGridClick(e, dayDateStr)}>
                                            {Array.from({ length: 24 }).map((_, hourIndex) => (<div key={hourIndex} className="h-16 border-b border-gray-200"></div>))}
                                            {dayAppointments.map(apt => {
                                                const startMinutes = timeToMinutes(apt.startTime); const endMinutes = apt.endTime ? timeToMinutes(apt.endTime) : startMinutes + 60; const durationMinutes = Math.max(30, endMinutes - startMinutes); const top = (startMinutes / 1440) * 100; const height = (durationMinutes / 1440) * 100;
                                                return (<div key={apt.id} data-apt-id={apt.id} onClick={(e) => handleEventClick(e, apt, dayDateStr)} style={{ top: `${top}%`, height: `${height}%`, backgroundColor: hexToRgba(apt.color, 0.2), borderColor: apt.color}} className={`event-block absolute left-2 right-2 p-2 rounded-md border-l-4 flex flex-col justify-center overflow-hidden`}><p className="text-sm font-bold text-gray-800 truncate">{apt.title}</p><p className="text-xs text-gray-500 truncate">{apt.startTime} - {apt.endTime}</p></div>)
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
          {creationDropdown && (<div className="creation-dropdown fixed w-[300px] bg-white backdrop-blur-md shadow-xl rounded-lg border border-black/5 z-20 animate-dropdown transform -translate-y-1/2" style={{ top: creationDropdown.y, left: creationDropdown.x }} onClick={e => e.stopPropagation()}><AppointmentListPopover date={creationDropdown.date} {...popoverProps}/></div>)}
          {eventPopover && (<div className="event-popover fixed w-[300px] bg-white backdrop-blur-md shadow-xl rounded-lg border border-black/5 z-20 animate-dropdown transform -translate-y-1/2" style={{ top: eventPopover.y, left: eventPopover.x }} onClick={e => e.stopPropagation()}><AppointmentListPopover date={eventPopover.date} {...popoverProps} /></div>)}
        </div>
      </main>
    </div>
  )
}

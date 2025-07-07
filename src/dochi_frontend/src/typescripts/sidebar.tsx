import { useState, useEffect } from "react";
import {
    CalendarIcon,
    CheckSquare,
    Focus,
    User,
    Trash2,
    Settings,
    HelpCircle,
    MoreHorizontal,
    Menu,
    X,
} from "lucide-react";
import Dochi from "./dochi";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
    activeSection: string;
    handleNavClick: (page: string) => void;
}

// Fixed routes with all navigation items
const routes: Record<string, string> = {
    "To-Do": "/toDo",
    "Calendar": "/calendar",
    "Focus": "/focus",
    "Dochi": "/dochiLLM",
    "Bin": "/bin",
    "Settings": "/settings",
    "Support": "/support",
    "Profile": "/profile"
};

export default function Sidebar({ activeSection, handleNavClick }: SidebarProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false);
            }
            if (window.innerWidth < 1024 && window.innerWidth >= 768) {
                setSidebarCollapsed(true);
            } else if (window.innerWidth >= 1024) {
                setSidebarCollapsed(false);
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call on initial mount
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle navigation with proper error handling
    const handleNavigation = (key: string) => {
        handleNavClick(key);
        
        // Only navigate if route exists
        if (routes[key]) {
            navigate(routes[key]);
        }
        
        // Close mobile menu after navigation
        if (windowWidth < 1024) {
            setMobileMenuOpen(false);
        }
    };

    return (
        <>
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}
            <div
                className={`
          ${windowWidth < 1024
                        ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                        }`
                        : `${sidebarCollapsed ? "w-20" : "w-64"} transition-all duration-300`
                    } bg-white border-r border-gray-200 flex flex-col h-screen
        `}
            >
                {/* Sidebar Header */}
                <div className={`flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0 ${sidebarCollapsed && windowWidth >= 1024 ? 'justify-center' : 'justify-between'}`}>
                    <div
                        className={`flex items-center space-x-2 transition-opacity duration-200 ease-in-out overflow-hidden ${sidebarCollapsed && windowWidth >= 1024 ? "opacity-0 w-0" : "opacity-100 w-auto"
                            }`}
                    >
                        <Dochi size={50}/>
                        <span className="text-lg font-bold text-gray-800 whitespace-nowrap">Dochi.</span>
                    </div>
                    <button
                        onClick={() => {
                            if (windowWidth < 1024) {
                                setMobileMenuOpen(!mobileMenuOpen);
                            } else {
                                setSidebarCollapsed(!sidebarCollapsed);
                            }
                        }}
                        className="p-3 rounded-md hover:bg-gray-100"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
                    </button>
                </div>

                {/* Main Navigation */}
                <div className={`flex-1 px-4 py-6 space-y-2`}>
                    {(!sidebarCollapsed || windowWidth < 1024) && (
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">MAIN</h3>
                    )}
                    {[
                        { key: "To-Do", icon: CheckSquare, label: "To-Do" },
                        { key: "Calendar", icon: CalendarIcon, label: "Calendar" },
                        { key: "Focus", icon: Focus, label: "Focus" },
                        { key: "Dochi", icon: User, label: "Dochi" },
                        { key: "Bin", icon: Trash2, label: "Bin" },
                    ].map(({ key, icon: Icon, label }) => (
                        <div
                            key={key}
                            className={`flex items-center rounded-lg cursor-pointer transition-colors duration-200
                ${sidebarCollapsed && windowWidth >= 1024 ? "justify-center h-10 w-10 mx-auto" : "space-x-3 h-10 px-4"}
                ${activeSection === key ? "bg-[#FFD4F2] text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
                            onClick={() => handleNavigation(key)}
                            title={sidebarCollapsed && windowWidth >= 1024 ? label : ""}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {(!sidebarCollapsed || windowWidth < 1024) && <span className="text-sm font-medium">{label}</span>}
                        </div>
                    ))}
                </div>

                {/* Bottom Navigation */}
                <div className="px-4 py-4 border-t border-gray-200">
                    <div className="space-y-2">
                        {[
                            { key: "Settings", icon: Settings, label: "Settings" },
                            { key: "Support", icon: HelpCircle, label: "Support" },
                        ].map(({ key, icon: Icon, label }) => (
                            <div
                                key={key}
                                className={`flex items-center rounded-lg cursor-pointer transition-colors duration-200
                  ${sidebarCollapsed && windowWidth >= 1024 ? "justify-center h-10 w-10 mx-auto" : "space-x-3 h-10 px-4"}
                  ${activeSection === key ? "bg-[#FFD4F2] text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
                                onClick={() => handleNavigation(key)}
                                title={sidebarCollapsed && windowWidth >= 1024 ? label : ""}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {(!sidebarCollapsed || windowWidth < 1024) && <span className="text-sm font-medium">{label}</span>}
                            </div>
                        ))}
                        
                        {/* Profile Section */}
                        <div
                            className={`flex items-center rounded-lg cursor-pointer transition-colors duration-200
                ${sidebarCollapsed && windowWidth >= 1024 ? "justify-center h-10 w-10 mx-auto" : "h-10 px-4"}
                ${activeSection === 'Profile' ? "bg-[#FFD4F2] text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
                            onClick={() => handleNavigation("Profile")}
                            title={sidebarCollapsed && windowWidth >= 1024 ? "Profile" : ""}
                        >
                            <div className={`flex items-center w-full ${sidebarCollapsed && windowWidth >= 1024 ? "justify-center" : "justify-between"}`}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-[#FFD4F2] rounded-full flex-shrink-0"></div>
                                    {(!sidebarCollapsed || windowWidth < 1024) && <span className="text-sm font-medium">Username</span>}
                                </div>
                                {(!sidebarCollapsed || windowWidth < 1024) && <MoreHorizontal className="w-4 h-4 text-gray-400" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
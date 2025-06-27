// App.jsx - Updated with sidebar layout
import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import all your page components
import Landing from './typescripts/landing';
import DochiCalendar from './typescripts/calendar';
import ToDo from './typescripts/to-do';
import Focus from './typescripts/focus';
import DochiLLM from './typescripts/dochi-llm';
import Bin from './typescripts/bin';
import Settings from './typescripts/settings';
import Support from './typescripts/support';
import Profile from './typescripts/profile';
import Sidebar from './typescripts/sidebar';

// Map routes to section names for sidebar
const routeToSection: Record<string, string> = {
  '/toDo': 'To-Do',
  '/calendar': 'Calendar',
  '/focus': 'Focus',
  '/dochiLLM': 'Dochi',
  '/bin': 'Bin',
  '/settings': 'Settings',
  '/support': 'Support',
  '/profile': 'Profile',
};

function App() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('To-Do');

  // Update active section based on current route
  useEffect(() => {
    const section = routeToSection[location.pathname];
    if (section) {
      setActiveSection(section);
    }
  }, [location.pathname]);

  const handleNavClick = (page: string) => {
    setActiveSection(page);
  };

  const showSidebar = location.pathname !== '/' && location.pathname !== '/colorPalette';

  return (
    <div className="w-full flex h-screen bg-gray-50">
      {showSidebar && (
        <Sidebar 
          activeSection={activeSection}
          handleNavClick={handleNavClick}
        />
      )}
      
      <div className={`${showSidebar ? 'flex-1' : 'w-full'} overflow-auto`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/toDo" element={<ToDo />} />
          <Route path="/calendar" element={<DochiCalendar />} />
          <Route path="/focus" element={<Focus/>}/>
          <Route path="/dochiLLM" element={<DochiLLM/>}/>
          <Route path="/bin" element={<Bin/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/support" element={<Support/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
// toDo.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import Header from './header';

const ToDo = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('To-Do');

  const handleNavClick = (page: string) => {
    setActiveSection(page);
  };

  return (
    <div className="flex h-screen">

      
      <div className="flex-1 min-h-full bg-gradient-to-br from-blue-100/80 to-pink-200/80">
        <Header currentPage='To-Do'/>
        <div className="px-8 pb-8">
        
        </div>
      </div>
    </div>
  );
};

export default ToDo;
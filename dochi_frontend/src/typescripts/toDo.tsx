// toDo.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './sidebar';

const ToDo = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('To-Do');

  const handleNavClick = (page: string) => {
    setActiveSection(page);
  };

  return (
    <div className="flex h-screen">

      
      {/* Main content area */}
      <div className="flex-1 min-h-full bg-gradient-to-br from-blue-100/80 to-pink-200/80">
        {/* Header */}
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">To-Do List</h1>
          <p className="text-gray-600">Manage your tasks efficiently</p>
        </div>
        
        {/* Content */}
        <div className="px-8 pb-8">
          {/* Your sticky notes component here */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Your todo content goes here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToDo;
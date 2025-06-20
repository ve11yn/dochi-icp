import { Routes, Route } from 'react-router-dom';

// Import all your page components here
import Landing from './typescripts/landing';
import ToDo from './typescripts/to-do';
import DochiCalendar from './typescripts/dochi-calendar';

function App() {
  return (
    <div className="w-full min-h-screen">
      <Routes>
        {/* All routes from both files are now here */}
        <Route path="/" element={<Landing />} />
        <Route path="/toDo" element={<ToDo />} />
        <Route path="/calendar" element={<DochiCalendar />} />

        {/* This is the catch-all 404 page */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
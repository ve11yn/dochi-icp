import { Routes, Route } from 'react-router-dom';

// Import all your page components here
import Landing from './typescripts/landing';
// import ToDo from './typescripts/to-do';
import DochiCalendar from './typescripts/dochi-calendar';
import ToDo from './typescripts/toDo';
import Focus from './typescripts/focus';
import DochiLLM from './typescripts/dochi-llm';
import Bin from './typescripts/bin';
import Settings from './typescripts/settings';
import Support from './typescripts/support';
import Profile from './typescripts/profile';

function App() {
  return (
    <div className="w-full min-h-screen">
      <Routes>
        {/* All routes from both files are now here */}
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
  );
}

export default App;
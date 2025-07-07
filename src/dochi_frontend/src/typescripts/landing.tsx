import React, { useEffect, useRef, useState } from "react";
import Dochi from "./dochi";
import GradientBackground from "./gradient-bg";
import FlippedGradientBackground from "./gradient-bg-flipped";
import NavLanding from "./nav-landing";
import { ArrowRight, Check, Database, Fingerprint, Key, Link, Lock, MoreHorizontal, Pause, Play, Plus, RotateCcw, Router, Send, ShieldCheck, Sparkles } from "lucide-react";
import { HiLink } from "react-icons/hi";
import { BsDatabaseFillLock, BsDatabaseLock } from "react-icons/bs";


const StaticTodoCard: React.FC = () => {
  const [mainChecked, setMainChecked] = useState(false);
  const [subtasks, setSubtasks] = useState([
    { id: 1, text: "Algebra: Ch. 4 reading", checked: false },
    { id: 2, text: "Physics: Ex. 4.1 & 4.2", checked: false },
    { id: 3, text: "History: Review notes", checked: true },
    { id: 4, text: "Bio: Cell diagram", checked: true }
  ]);

  const toggleSubtask = (id: number) => {
    setSubtasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, checked: !task.checked } : task
      )
    );
  };

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white rounded-xl shadow border border-blue-200 p-3">
      <div className="flex items-start gap-2">
        <div
          className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center mt-0.5 cursor-pointer transition-colors ${
            mainChecked
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 hover:border-blue-400'
          }`}
          onClick={() => setMainChecked(!mainChecked)}
        >
          {mainChecked && <Check size={9} className="text-white" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <h3 className={`font-semibold text-sm ${mainChecked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              Do Homework
            </h3>
            <span className="px-1 py-0 bg-red-100 text-red-700 rounded text-[10px] font-semibold">
              High
            </span>
          </div>

          <div className="mb-2">
            <span className="px-1 py-0 bg-blue-100 text-blue-700 rounded border border-blue-500 text-[10px] font-medium">
              Learning
            </span>
          </div>

          <div className="mb-2">
            <p className="text-sm font-semibold text-gray-500 mb-1">Subtasks:</p>
            <div className="space-y-1">
              {subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-1.5">
                  <div
                    className={`w-3 h-3 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      subtask.checked
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                    onClick={() => toggleSubtask(subtask.id)}
                  >
                    {subtask.checked && <Check size={7} className="text-white" />}
                  </div>
                  <span className={`text-[11px] ${subtask.checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {subtask.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-gray-400">
            6/26/2025
          </div>
        </div>
      </div>
    </div>
  );
};


const CalendarDemo: React.FC = () => {
  
  const calendarDays = [
    { number: null, isOtherMonth: true },
    { number: null, isOtherMonth: true },
    { number: null, isOtherMonth: true },
    { number: 1, isSelected: false, hasEvent: false },
    { number: 2, isSelected: false, hasEvent: false },
    { number: 3, isSelected: false, hasEvent: false },
    { number: 4, isSelected: false, hasEvent: false },
    
    { number: 5, isSelected: false, hasEvent: false },
    { number: 6, isSelected: false, hasEvent: false },
    { number: 7, isSelected: false, hasEvent: false },
    { number: 8, isSelected: false, hasEvent: false },
    { number: 9, isSelected: false, hasEvent: false },
    { number: 10, isSelected: true, hasEvent: false },
    { number: 11, isSelected: false, hasEvent: false },
    
    { number: 12, isSelected: false, hasEvent: false },
    { number: 13, isSelected: false, hasEvent: true },
    { number: 14, isSelected: false, hasEvent: false },
    { number: 15, isSelected: false, hasEvent: false },
    { number: 16, isSelected: false, hasEvent: false },
    { number: 17, isSelected: false, hasEvent: false },
    { number: 18, isSelected: false, hasEvent: false },
    
    { number: 19, isSelected: false, hasEvent: false },
    { number: 20, isSelected: false, hasEvent: false },
    { number: 21, isSelected: false, hasEvent: false },
    { number: 22, isSelected: false, hasEvent: false },
    { number: 23, isSelected: false, hasEvent: false },
    { number: 24, isSelected: false, hasEvent: false },
    { number: 25, isSelected: false, hasEvent: false },
    
    { number: 26, isSelected: false, hasEvent: false },
    { number: 27, isSelected: false, hasEvent: false },
    { number: 28, isSelected: false, hasEvent: false },
    { number: 29, isSelected: false, hasEvent: false },
    { number: 30, isSelected: false, hasEvent: false },
    { number: 31, isSelected: false, hasEvent: false },
    { number: null, isOtherMonth: true }
  ];

  const appointments = [
    { id: 1, title: "Team Meeting", time: "10:00 A.M.", color: "bg-[#C07A65]" },
    { id: 2, title: "Lunch with Client", time: "12:30 P.M.", color: "bg-gray-500" }
  ];

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-3 relative">

      <div className="opacity-60">
           <div className="text-center mb-3">
            <h2 className="text-sm font-semibold text-gray-900">June 2025</h2>
          </div>

          <div className="grid grid-cols-7 gap-[1px] bg-gray-100 p-1 rounded-lg">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`h-8 flex items-center justify-center text-xs relative ${
                  day.number === null
                    ? 'bg-gray-100'
                    : day.isSelected
                    ? 'bg-[#C07A65] text-white rounded-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {day.number}
                {day.hasEvent && (
                  <span className="absolute top-[2px] right-[2px] w-1 h-1 bg-red-400 rounded-full"></span>
                )}
              </div>
            ))}
          </div>
      </div>
   

      <div className="absolute -ml-20 top-16 w-60 bg-white rounded-lg shadow-2xl border border-gray-200 p-2 z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900">Appointments</h3>
          <div className="w-5 h-5 bg-[#C07A65] rounded-full flex items-center justify-center cursor-pointer">
            <Plus size={12} className="text-white" />
          </div>
        </div>
        
        <div className="space-y-1">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${appointment.color}`}></div>
              <div className="flex-1">
                <span className="text-[11px] font-medium text-gray-900">{appointment.title}</span>
              </div>
              <span className="text-[11px] text-gray-500">{appointment.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const DochiIntroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-100 bg-gradient-to-b from-white via-pink-50/30 to-white flex flex-col items-center justify-center py-20 px-8">
      <div className="text-center w-full mb-4 max-w-4xl mx-auto z-10">
        <h2 
          className={`text-5xl md:text-6xl lg:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-br bg-black text-center transition-all duration-1000 ease-out transform ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}
        >
          Meet Dochi,
        </h2>
        
        <p 
          className={`text-lg text-gray-500 max-w-md mx-auto mt-2 font-light transition-all duration-1000 ease-out transform delay-300 z-10 ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}
        >
          Your productivity companion.
        </p>
      </div>

      <div 
        className={`flex-shrink-0 relative transition-all duration-1500 ease-out transform delay-500 ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-12 opacity-0 scale-95'
        }`}
      >
        <div className="absolute inset-0 -z-10">
          <div 
            className={`absolute -top-20 -left-20 w-32 h-32 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full opacity-60 transition-all duration-2000 ease-out delay-1000 ${
              isVisible ? 'animate-bounce' : ''
            }`}
            style={{
              animationDuration: '6s',
              animationIterationCount: 'infinite'
            }}
          />
          <div 
            className={`absolute -bottom-32 -right-24 w-24 h-24 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full opacity-60 transition-all duration-2000 ease-out delay-1200 ${
              isVisible ? 'animate-pulse' : ''
            }`}
            style={{
              animationDuration: '8s',
              animationIterationCount: 'infinite'
            }}
          />
          <div 
            className={`absolute top-1/2 -left-16 w-16 h-16 bg-gradient-to-br from-yellow-200/40 to-orange-200/40 rounded-full opacity-60 transition-all duration-2000 ease-out delay-1400 ${
              isVisible ? 'animate-ping' : ''
            }`}
            style={{
              animationDuration: '7s',
              animationIterationCount: 'infinite'
            }}
          />
          <div 
            className={`absolute -top-8 right-12 w-20 h-20 bg-gradient-to-br from-green-200/40 to-teal-200/40 rounded-full opacity-60 transition-all duration-2000 ease-out delay-1600 ${
              isVisible ? 'animate-bounce' : ''
            }`}
            style={{
              animationDuration: '9s',
              animationIterationCount: 'infinite'
            }}
          />
        </div>

        <div className="hover:scale-105 transition-transform duration-500 ease-out cursor-pointer">
          <Dochi size={400} />
        </div>

        <div 
          className={`absolute inset-0 -z-20 bg-gradient-to-r from-pink-300/20 via-purple-300/20 to-blue-300/20 rounded-full blur-3xl transition-all duration-2000 ease-out delay-800 ${
            isVisible ? 'opacity-100 scale-150' : 'opacity-0 scale-100'
          }`}
        />
        <div 
          className={`absolute inset-0 -z-30 bg-gradient-to-br from-white/80 via-pink-50/60 to-white/80 rounded-full blur-2xl transition-all duration-2500 ease-out delay-1000 ${
            isVisible ? 'opacity-100 scale-200' : 'opacity-0 scale-100'
          }`}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-5">
        <p 
          className={`text-base md:text-lg text-gray-600 leading-relaxed text-center font-light transition-all duration-1200 ease-out transform delay-1000 ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}
        >
          <span className="font-medium text-gray-700">Dochi's mood changes with your progress</span> — stay productive, 
          and Dochi stays happy. Skip your tasks, and Dochi turns grumpy — a little nudge to keep you 
          on track, every day.
        </p>
      </div>

      <div 
        className={`mt-16 transition-all duration-1000 ease-out delay-1500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-sm mb-3 font-light">Scroll for more</span>
          <div className="w-1 h-12 bg-gradient-to-b from-pink-300/60 to-transparent rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};




const DochiChatDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  
  const messages = [
    { id: 1, text: "I want to stop procrastinating. Any tips?", isUser: true },
    { id: 2, text: "Sure! Start with small daily goals. Use the Pomodoro method — 25 mins focus, 5 mins break.", isUser: false }
  ];

  const handleSend = () => {
    if (inputValue.trim()) {
      setInputValue('');
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-[#e5cadd]">
  <div className="bg-[#B17298] px-4 py-3 flex items-center justify-between rounded-t-2xl">
    <div className="flex items-center gap-2">
      <h3 className="text-white font-semibold text-sm">Ask Dochi 💬</h3>
    </div>
    <button className="text-white hover:bg-white/10 rounded-full p-1 transition-colors">
      <MoreHorizontal size={14} />
    </button>
  </div>

  <div className="p-3 space-y-2 min-h-[150px] max-h-[250px] overflow-y-auto bg-[#F5EAF2]">
    {messages.map((msg) => (
      <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
        {!msg.isUser && (
          <div className="flex-shrink-0 mr-2">
            <Dochi size={35} />
          </div>
        )}
        <div
          className={`max-w-[75%] px-2 py-1 text-[11px] rounded-2xl ${
            msg.isUser
              ? 'bg-[#B17298] text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
          }`}
        >
          {msg.text}
        </div>
      </div>
    ))}
  </div>

  <div className="border-t border-[#e5cadd] p-2 bg-white">
    <div className="flex items-center gap-2 bg-[#f7f2f5] rounded-full px-2 py-1 border border-[#e5cadd]">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type something sweet..."
        className="flex-1 bg-transparent text-[11px] text-gray-700 placeholder-gray-400 outline-none"
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button
        onClick={handleSend}
        className={`p-1.5 rounded-full transition-colors ${
          inputValue.trim()
            ? 'bg-[#B17298] text-white hover:bg-[#9d5f87]'
            : 'bg-gray-200 text-gray-400'
        }`}
        disabled={!inputValue.trim()}
      >
        <Send size={12} />
      </button>
    </div>
  </div>
</div>


  );
};

const DochiFocusTimer = ({ 
  initialMinutes = 0.2, 
  size = 200,
  onTimerComplete = () => {} 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [totalTime] = useState(initialMinutes * 60);

  // Calculate progress percentage for the ring
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * (size / 2 - 8); // radius accounting for stroke width

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsActive(false);
            onTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onTimerComplete]);

  const handleDochiClick = () => {
    if (timeLeft === totalTime) {
      // Start timer if not started
      setIsActive(true);
    } else {
      // Toggle play/pause if timer is running
      setIsActive(!isActive);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  return (
    <div className="flex flex-col items-center gap-4 max-w-[500px]">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="absolute inset-0 transform -rotate-90"
          width={size}
          height={size}
        >
           <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E4F6FB" />
              <stop offset="100%" stopColor="#FFD4F2" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            stroke="#E5E7EB"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            stroke="url(#progressGradient)"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            className="transition-all duration-300 ease-in-out"
            strokeLinecap="round"
          />
        </svg>

        <div 
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          onClick={handleDochiClick}
        >
          <div>
            <Dochi size={size * 0.7} />
          </div>
          
          <div className="text-xs font-mono -mt-5 font-bold text-gray-700">
            {formatTime(timeLeft)}
          </div>
          
          <div className="text-[10px] text-gray-500 mt-1">
            {timeLeft === totalTime ? 'Click to start' : 
             isActive ? 'Focus time' : 
             timeLeft === 0 ? 'Complete!' : 'Paused'}
          </div>
        </div>
      </div>
    </div>
  );
};

const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};


const AnimatedFeatureRow = ({ children, reverse = false, delay = 0 }) => {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`flex flex-row items-center gap-20 mb-25 transition-all duration-1000 ease-out ${
        reverse ? 'flex-row-reverse' : ''
      } ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-12 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  description: string;
  bgColor: string;  // ← Specify as string type
  iconColor: string;
  accentColor: string;
  delay?: number;
}



const FeatureCard = ({ 
 icon: Icon, 
  title, 
  description, 
  bgColor, 
  iconColor, 
  accentColor,
  delay = 0 
}: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cardRef, isVisible] = useScrollAnimation();

  return (
    <div
      ref={cardRef}
      className={`group relative w-80 h-72 rounded-3xl p-8 cursor-pointer overflow-hidden transition-all duration-700 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-12 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background with gradient overlay */}
      <div className={`absolute inset-0 ${bgColor} transition-all duration-500`} />
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500`} 
      />
      
      {/* Floating background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-8 -right-8 w-24 h-24 ${accentColor} rounded-full opacity-10 group-hover:scale-150 group-hover:opacity-20 transition-all duration-700`} />
        <div className={`absolute -bottom-12 -left-8 w-32 h-32 ${accentColor} rounded-full opacity-5 group-hover:scale-125 group-hover:opacity-15 transition-all duration-700 delay-100`} />
      </div>

      {/* Large decorative icon */}
      <div className={`absolute top-4 right-4 ${iconColor} opacity-30 group-hover:opacity-40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
        <Icon size={120} />
      </div>

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Title - always visible */}
        <div className={`transition-all duration-500 ${isHovered ? 'transform -translate-y-2' : ''}`}>
          <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
            {title}
          </h3>
          <div className={`w-12 h-1 ${accentColor} rounded-full transition-all duration-500 ${isHovered ? 'w-20' : ''}`} />
        </div>

        {/* Description - appears on hover */}
        <div className={`transition-all duration-500 ${
          isHovered 
            ? 'opacity-100 translate-y-0 max-h-40' 
            : 'opacity-0 translate-y-4 max-h-0 overflow-hidden'
        }`}>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {description}
          </p>
          <div className="flex items-center text-xs font-medium text-gray-800 group-hover:text-gray-900">
            <span>Learn more</span>
            <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>

      {/* Hover border effect */}
      <div className={`absolute inset-0 rounded-3xl border-2 transition-all duration-500 ${
        isHovered 
          ? `border-gray-300/60 shadow-2xl scale-105` 
          : 'border-transparent shadow-lg'
      }`} />
    </div>
  );
};

const AboutSection = () => {
  const [headerRef, headerVisible] = useScrollAnimation();

const features = [
  {
    icon: Link,
    title: "Passwordless Access with Internet Identity",
    description: "Authenticate securely using cryptographic proofs—no usernames or passwords required. Internet Identity enables seamless and private access across Dochi's ecosystem.",
    bgColor: "bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100",
    iconColor: "text-pink-300",
    accentColor: "bg-none",
    delay: 200,
    link: "https://internetcomputer.org/docs/current/developer-docs/integrations/internet-identity/"
  },
  {
    icon: Database,
    title: "Blockchain-Based Data Storage",
    description: "Store and manage your data directly on the blockchain—censorship-resistant, tamper-proof, and always accessible. You retain full control and ownership.",
    bgColor: "bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-100",
    iconColor: "text-blue-300",
    accentColor: "bg-none",
    delay: 400,
    link: "https://internetcomputer.org/how-it-works"
  },
  {
    icon: Sparkles,
    title: "Private AI Assistance with LLM Canisters",
    description: "Dochi leverages smart canisters to provide AI-powered features while keeping your data private, run entirely on-chain for transparency and trust.",
    bgColor: "bg-gradient-to-br from-cyan-100 via-sky-50 to-cyan-100",
    iconColor: "text-cyan-300",
    accentColor: "bg-none",
    delay: 600,
    link: "https://wiki.internetcomputer.org/wiki/Canister"
  }
];

  return (
    <section className="relative py-20 px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white" />
        <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/10 to-pink-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '15s', animationDelay: '5s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-1000 ease-out ${
            headerVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}
        >
          <p className="text-lg text-gray-500 font-light mb-3 tracking-wide">Powered by</p>
          <h1 className="text-5xl md:text-6xl font-light italic text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 mb-4">
            Internet Computer.
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 via-blue-400 to-cyan-400 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-items-center">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              bgColor={feature.bgColor}
              iconColor={feature.iconColor}
              accentColor={feature.accentColor}
              delay={feature.delay}
            />
          ))}
        </div>

        <div 
          className={`text-center mt-16 transition-all duration-1000 ease-out delay-800 ${
            headerVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}
        >
          <p className="text-sm text-gray-600 font-light mb-6 max-w-2xl mx-auto leading-relaxed">
            Experience the future of productivity apps. Built on decentralized infrastructure, 
            powered by AI, and designed with your privacy in mind.
          </p>
       <a
          href="https://internetcomputer.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="group px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <span className="flex items-center">
              Explore the Technology
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </a>

        </div>
      </div>
    </section>
  );
};
  

function Landing() {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you can add your API call to submit the email
      // For now, we'll just show an alert
      console.log('Subscribing email:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Thank you! We'll notify ${email} about our updates.`);
      
      // Clear the form
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white">
        <GradientBackground>
            <NavLanding/>

            <section id="top" className="pt-70 px-8 pb-40">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl font-medium text-gray-900">
                        Level Up Your <span className="bg- font-light">Productivity</span>
                    </h1>
                    <h1 className="text-5xl font-medium text-gray-900 mb-6">
                        Powered by the <span className="text-gray-900 font-light italic">Chain</span>.
                    </h1>

                    <p>
                        With private storage, secure identity, and AI integration
                    </p>
                
                    <p className="mb-6">stay focused and in control — always.</p>

                    <div className="flex gap-4 justify-center">
                    
                        <button className="bg-none border border-gray-900 border-1 text-gray-900 px-5 my-1 py-2 rounded-lg font-medium hover:bg-white transition-colors">
                        📄 View Docs
                        </button>

                        <button className="bg-white text-gray-900 px-5 my-1 py-2 rounded-lg font-medium hover:bg-white transition-colors">
                        Get Started
                        </button>
                    </div>
                </div>
            </section>


            <section id="features" className="py-16 px-8 mt-10 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col items-center gap-0 mb-35">
                        {/* <div className="text-center w-full">
                       <h2 className="text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-br from-[#5C7BAA] to-[#B17298] text-center">
                          Meet Dochi!
                        </h2>

                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                          Your productivity companion.
                        </p>
                      </div>

                            <div className="flex-shrink-0 -mb-10">
                                <Dochi size={400}/>
                            </div>
                       
                        <div className="flex flex-row justify-center align-center">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Dochi's mood changes with your progress — stay productive, 
                                and Dochi stays happy. Skip your tasks, and Dochi turns grumpy — a little nudge to keep you 
                                on track, every day.
                            </p>
                        </div>
                         */}

                         <DochiIntroSection/>
                    </div>
                      <div className="text-center w-full mb-20">
                        <h2 className="text-4xl md:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-center pb-4">
                        Ready to get <span className="italic">things done</span> together?
                      </h2>
                      <p className="text-lg text-gray-500 max-w-md mx-auto font-light">
                        Here's what Dochi can help you with.
                      </p>
                    </div>

                    {/* Feature 1: Todo Card */}
                    <AnimatedFeatureRow delay={200}>
                      <div className="w-[400px] flex-shrink-0 group">
                        <div className="transform group-hover:scale-105 transition-transform duration-500">
                          <StaticTodoCard />
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-light italic text-transparent bg-clip-text bg-gradient-to-r from-[#5C7BAA] to-[#7B9BCF] mb-4">
                          Capture tasks & thoughts.
                        </h2>
                        <p className="text-base text-gray-600 leading-relaxed font-light">
                          Manage your to-dos and take notes in one clean workspace — securely stored in canisters on the Internet Computer.
                        </p>
                      </div>
                    </AnimatedFeatureRow>

                    {/* Feature 2: Chat */}
                    <AnimatedFeatureRow reverse delay={400}>
                      <div className="flex-1 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-light italic text-transparent bg-clip-text bg-gradient-to-r from-[#B17298] to-[#D18FBD] mb-4">
                          Ask Dochi.
                        </h2>
                        <p className="text-base text-gray-600 leading-relaxed font-light">
                          Your private chatbot assistant — powered by decentralized AI and LLM Canisters — ready to answer questions, organize your tasks, summarize notes, and guide your productivity.
                        </p>
                      </div>
                      <div className="w-[400px] flex-shrink-0 group">
                        <div className="transform group-hover:scale-105 transition-transform duration-500">
                          <DochiChatDemo />
                        </div>
                      </div>
                    </AnimatedFeatureRow>

                    {/* Feature 3: Focus Timer */}
                    <AnimatedFeatureRow delay={600}>
                      <div className="w-[400px] flex-shrink-0 group">
                        <div className="transform group-hover:scale-105 transition-transform duration-500">
                          <DochiFocusTimer />
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-light italic text-transparent bg-clip-text bg-gradient-to-r from-[#64A7BB] to-[#84C7DB] mb-4">
                          Start a Focus Session.
                        </h2>
                        <p className="text-base text-gray-600 leading-relaxed font-light">
                          Structured focus sessions with timers to help you dive deep, eliminate distractions, and make meaningful progress.
                        </p>
                      </div>
                    </AnimatedFeatureRow>

                    {/* Feature 4: Calendar */}
                    <AnimatedFeatureRow reverse delay={800}>
                      <div className="flex-1 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-light italic text-transparent bg-clip-text bg-gradient-to-r from-[#C07A65] to-[#E09A85] mb-4">
                          Plan Your Day.
                        </h2>
                        <p className="text-base text-gray-600 leading-relaxed font-light">
                          Decentralized scheduling with support for event planning and time-blocking — featuring recurring events, reminders, and seamless coordination across your devices.
                        </p>
                      </div>
                      <div className="w-[400px] flex-shrink-0 group">
                        <div className="transform group-hover:scale-105 transition-transform duration-500">
                          <CalendarDemo />
                        </div>
                      </div>
                    </AnimatedFeatureRow>
                  </div>
                </section>


               <section id="about" className="py-16 px-8 pb-40 bg-white">
                <div>
                  <AboutSection/>
                </div>
            </section>


        <section id="contact" className="py-8 px-8 bg-white">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand Column */}
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                            <Dochi size={40} />
                            <h1 className="text-xl font-bold text-gray-900">Dochi.</h1>
                        </div>
                        
                        <div className="flex gap-3 justify-center md:justify-start">
                              {/* Twitter/X Icon */}
                            <a href="#" className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            
                            {/* Telegram Icon */}
                            <a href="#" className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                            </a>
                
                            {/* Instagram Icon */}
                            <a href="#" className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors">
                                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Contact Column */}
                    <div className="text-center md:text-left">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Contact Us</h3>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-600">dochi@email.com</p>
                            <p className="text-xs text-gray-600">+68 812 890 522 08</p>
                        </div>
                    </div>

                    {/* Subscribe Column */}
                    <div className="text-center md:text-left">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Subscribe</h3>
                        <p className="text-xs text-gray-600 mb-3">
                            Get notified about our new solutions
                        </p>

                        <div className="relative max-w-xs mx-auto md:mx-0">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 outline-none bg-white text-xs text-gray-700 placeholder-gray-400 focus:border-gray-500 transition-colors"
                                placeholder="your@email.com"
                                required
                                disabled={isSubmitting}
                            />
                            
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget.closest('div');
                                    const input = form?.querySelector('input') as HTMLInputElement;
                                    if (input) {
                                        const syntheticEvent = {
                                            preventDefault: () => {},
                                            currentTarget: { querySelector: () => input }
                                        } as unknown as React.FormEvent<HTMLFormElement>;
                                        handleSubmit(syntheticEvent);
                                    }
                                }}
                                disabled={isSubmitting || !email}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-gray-600">
                                        <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
  
                {/* Divider */}
                <div className="w-full h-px bg-gray-200 mb-4"></div>
                
                <div className="text-center">
                    <p className="text-xs text-gray-500">© 2025 ChingChongFan Inc. All rights reserved</p>
                </div>
            </div>

            
        </section>
        </GradientBackground>
      </div>    
    </>
  )
}

export default Landing;
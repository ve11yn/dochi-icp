import Header from "./header";
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Music, RotateCcw, Pause, Play } from 'lucide-react';
import Dochi from "./dochi";
import { addFocusTime, getTodayDate } from '../services/focusServices';

// Import the focus session context
const useFocusSession = () => {
  // This would normally come from your App context
  // For now, we'll create a local implementation
  const [isSessionActive, setIsSessionActive] = useState(false);
  return { isSessionActive, setIsSessionActive };
};


const Focus: React.FC = () => {
  const { isSessionActive, setIsSessionActive } = useFocusSession();
  const [sessionState, setSessionState] = useState<
    "idle" | "running" | "paused" | "completed"
  >("idle");
  const [selectedDuration, setSelectedDuration] = useState(45); // Duration in minutes
  const [customDuration, setCustomDuration] = useState("45"); // Custom duration input
  const [timeLeft, setTimeLeft] = useState(45 * 60); // Time in seconds
  const [originalTime, setOriginalTime] = useState(45 * 60); // Original time in seconds
  const [isDochiHovered, setIsDochiHovered] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState("");
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const affirmations = [
    "Hey! Don't look at me!",
    "You can do this!",
    "Stay focused, you're amazing!",
    "Great progress so far!",
    "Keep up the excellent work!",
    "You're in the zone!",
    "Focus is your superpower!",
    "You've got this handled!",
    "Concentration level: Expert!",
    "Success is just ahead!",
    "Your dedication is inspiring!",
  ];

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  useEffect(() => {
    if (musicEnabled && sessionState === "running") {
      if (!audioContext) {
        const ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        setAudioContext(ctx);

        // Create pink noise (calming sound)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.1;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start();

        audioRef.current = source as any;
      }
    } else if (audioRef.current && audioContext) {
      (audioRef.current as AudioBufferSourceNode).stop();
      audioContext.close();
      setAudioContext(null);
      audioRef.current = null;
    }
  }, [musicEnabled, sessionState, audioContext]);
  // Add this useEffect after your existing useEffects
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts (page navigation)
      if (audioRef.current && audioContext) {
        try {
          (audioRef.current as AudioBufferSourceNode).stop();
        } catch (e) {
          // Source might already be stopped
        }
        audioContext.close();
        setAudioContext(null);
        audioRef.current = null;
      }
    };
  }, [audioContext]);
  // Update time when duration changes
  useEffect(() => {
    if (sessionState === "idle") {
      const duration = parseInt(customDuration) || 45;
      const newTime = duration * 60;
      setTimeLeft(newTime);
      setOriginalTime(newTime);
      setSelectedDuration(duration);
    }
  }, [customDuration, sessionState]);

  // Update session active state when session state changes
  useEffect(() => {
    setIsSessionActive(sessionState === "running" || sessionState === "paused");
  }, [sessionState, setIsSessionActive]);

  // Timer logic
  useEffect(() => {
    if (sessionState === "running") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setSessionState("completed");
            playCompletionSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionState]);

  // Affirmation rotation (every 10 minutes = 600 seconds)
  useEffect(() => {
    if (sessionState === "running") {
      const elapsedSeconds = originalTime - timeLeft;
      const affirmationIndex =
        Math.floor(elapsedSeconds / 60) % affirmations.length;
      setCurrentAffirmation(affirmations[affirmationIndex]);
    }
  }, [timeLeft, sessionState, originalTime]);

  // Update your timer completion in the useEffect
  useEffect(() => {
    if (sessionState === "running") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setSessionState("completed");
            playCompletionSound();

            // Save focus time to IC
            const today = getTodayDate();
            addFocusTime(today, selectedDuration).then((success) => {
              if (success) {
                console.log("Focus session saved to IC!");
              } else {
                console.error("Failed to save to IC");
              }
            });

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionState, selectedDuration]);

  const playCompletionSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  // Replace your music button onClick with this function
  const handleMusicToggle = () => {
    if (musicEnabled && audioRef.current && audioContext) {
      // Stop current audio before toggling
      try {
        (audioRef.current as AudioBufferSourceNode).stop();
      } catch (e) {
        // Source might already be stopped
      }
      audioContext.close();
      setAudioContext(null);
      audioRef.current = null;
    }
    setMusicEnabled(!musicEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")} : ${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleDochiClick = () => {
    if (sessionState === "idle") {
      setSessionState("running");
      setCurrentAffirmation(affirmations[0]);
    } else if (sessionState === "running" || sessionState === "paused") {
      setShowStopConfirm(true);
    }
  };

  const handlePause = () => {
    if (sessionState === "running") {
      setSessionState("paused");
    } else if (sessionState === "paused") {
      setSessionState("running");
    }
  };

  const handleRestart = () => {
    setSessionState("idle");
    const duration = parseInt(customDuration) || 45;
    const newTime = duration * 60;
    setTimeLeft(newTime);
    setOriginalTime(newTime);
    setCurrentAffirmation("");
    setShowStopConfirm(false);
  };

  const handleStopConfirm = () => {
    setSessionState("idle");
    const duration = parseInt(customDuration) || 45;
    const newTime = duration * 60;
    setTimeLeft(newTime);
    setOriginalTime(newTime);
    setCurrentAffirmation("");
    setShowStopConfirm(false);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (sessionState === "idle") {
      setCustomDuration(e.target.value);
    }
  };

  const progress = ((originalTime - timeLeft) / originalTime) * 100;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header currentPage="Focus" />
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(223, 240, 255, 0.8), rgba(255, 212, 242, 0.8))",
        }}
      >
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex gap-4 z-10">
          <button
            onClick={handleMusicToggle} // Change this line
            className={`p-3 rounded-full transition-all duration-300 ${
              musicEnabled
                ? "bg-pink-200 text-purple-500 shadow-lg"
                : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
            title="white noise"
          >
            <Music size={20} />
          </button>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`p-3 rounded-full transition-all duration-300 ${
              !notificationsEnabled
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
            title="turn off notifications"
          >
            <Bell size={20} />
          </button>
        </div>

        {/* Main Content - Single Page Layout */}
        <div className="flex flex-col items-center justify-center h-full px-4">
          {/* Affirmation Text */}
          {sessionState === "running" && currentAffirmation && (
            <div className="mb-4 text-center">
              <p className="text-lg font-medium text-gray-700 animate-fade-in">
                {currentAffirmation}
              </p>
            </div>
          )}

          {/* Completion Message */}
          {sessionState === "completed" && (
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Great Job!
              </h2>
              <p className="text-base text-gray-600">
                You have focused for {selectedDuration} minutes.
              </p>
            </div>
          )}

          {/* Timer Circle with Dochi */}
          <div className="relative mb-6">
            {/* Animated Ring */}
            <div className="relative">
              <svg width="280" height="280" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 120 * (1 - progress / 100)
                  }`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter:
                      sessionState === "running"
                        ? "drop-shadow(0 0 15px rgb(255, 255, 255))"
                        : "none",
                  }}
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#B8D4F0" />
                    <stop offset="50%" stopColor="#E8C5E8" />
                    <stop offset="100%" stopColor="#D4B8F0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Dochi in center */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                onMouseEnter={() => setIsDochiHovered(true)}
                onMouseLeave={() => setIsDochiHovered(false)}
                onClick={handleDochiClick}
              >
                <Dochi size={240} />
              </div>
            </div>
          </div>

          {/* Timer Display */}
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg mb-6">
            <span className="text-3xl font-mono text-gray-800">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Control Buttons */}
          {(sessionState === "running" || sessionState === "paused") && (
            <div className="flex gap-4 mb-4">
              <button
                onClick={handlePause}
                className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300"
                title={sessionState === "running" ? "Pause" : "Resume"}
              >
                {sessionState === "running" ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} />
                )}
              </button>
            </div>
          )}

          {/* New Session Button for Completed State */}
          {sessionState === "completed" && (
            <button
              onClick={handleRestart}
              className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 mb-4"
              title="Restart"
            >
              <RotateCcw size={20} />
            </button>
          )}

          {/* Start Instructions */}
          {sessionState === "idle" && (
            <div className="text-center">
              {/* Duration Selection */}
              <div className="mb-4">
                <p className="text-base text-gray-700 mb-3 font-medium">
                  Set your focus duration:
                </p>
                <div className="flex items-center justify-center gap-3">
                  <input
                    type="number"
                    value={customDuration}
                    onChange={handleDurationChange}
                    placeholder="45"
                    min="1"
                    max="300"
                    disabled={sessionState !== "idle"}
                    className={`w-16 px-3 py-2 border-2 rounded-xl text-center text-base font-medium focus:outline-none transition-all duration-200 ${
                      sessionState === "idle"
                        ? "border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white hover:border-purple-400"
                        : "border-gray-300 bg-gray-100 cursor-not-allowed"
                    }`}
                  />
                  <span className="text-base text-gray-600 font-medium">
                    minutes
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stop Confirmation Modal */}
        {showStopConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                Want to stop your session?
              </h3>
              <p className="text-gray-600 mb-4 text-center text-sm">
                You've been focusing for{" "}
                {Math.floor((originalTime - timeLeft) / 60)} minutes.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStopConfirm(false)}
                  className="flex-1 py-2 px-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200 text-sm"
                >
                  Continue
                </button>
                <button
                  onClick={handleStopConfirm}
                  className="flex-1 py-2 px-3 bg-pink-200 text-purple-800 rounded-xl hover:bg-pink-300 transition-colors duration-200 text-sm"
                >
                  Stop Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSS for animations */}
        <style>{`
       @keyframes fade-in {
         from {
           opacity: 0;
           transform: translateY(-10px);
         }
         to {
           opacity: 1;
           transform: translateY(0);
         }
       }
       .animate-fade-in {
         animation: fade-in 0.5s ease-out;
       }
     `}</style>
      </div>
    </div>
  );
}

export default Focus;
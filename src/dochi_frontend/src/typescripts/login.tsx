// Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dochi from './dochi';
import { loginService } from '../services/loginService';
import NameModal from './name-modal'; // Import the actual NameModal component

// Types
interface User {
  name: string;
  principal: string;
  createdAt: bigint;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Initialize on component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await loginService.initialize();
      const isAuth = await loginService.isAuthenticated();

      if (isAuth) {
        const currentUser = await loginService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setError('Failed to initialize authentication');
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await loginService.login();

      if (result.success) {
        setIsAuthenticated(true);

        if (result.isFirstTime) {
          setShowNameModal(true);
        } else {
          setUser(result.user!);
          // Redirect to todo page after successful login
          navigate('/toDo');
        }
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!userName.trim()) {
      setError("Please enter a valid name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Creating profile with name:", userName.trim());

      // Call the fixed createProfile method
      const result = await loginService.createProfile(userName.trim());

      console.log("Create profile result:", result);

      if (result.success && result.user) {
        setUser(result.user);
        setShowNameModal(false);
        setUserName("");
        // Redirect to todo page after profile creation
        navigate('/toDo');
      } else {
        setError(result.error || "Failed to create profile");
        console.error("Profile creation failed:", result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(`Failed to create profile: ${errorMessage}`);
      console.error("Error creating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await loginService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setShowNameModal(false);
      setUserName('');
      setError('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden font-sans w-full m-0 p-0">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, #f0f8ff, #e6f3ff, #f0e6ff, #fff0f8, #e6ffe6)",
          backgroundSize: "300% 300%",
          animation: "gradientShift 15s ease-in-out infinite",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      25% { background-position: 100% 0%; }
      50% { background-position: 100% 100%; }
      75% { background-position: 0% 100%; }
      100% { background-position: 0% 50%; }
    }
  `,
          }}
        />
      </div>

      {/* Floating Dochi Characters */}
      <div
        className="absolute top-[10%] left-[7%] opacity-60"
        style={{
          animation: "float 12s ease-in-out infinite -2s",
        }}
      >
        <Dochi size={180} />
      </div>
      <div
        className="absolute bottom-[8%] right-[5%] opacity-60"
        style={{
          animation: "float 12s ease-in-out infinite -6s",
        }}
      >
        <Dochi size={240} />
      </div>

      <div className="flex flex-col items-center justify-center h-screen p-5 relative z-10">
        {!isAuthenticated ? (
          <div className="text-center max-w-md w-full">
            <h1 className="text-6xl text-gray-800 mb-8 drop-shadow-sm font-extralight">
              <span className="font-semibold">Get</span> Started.
            </h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              className="bg-white text-black border-none py-4 px-20 text-lg rounded-2xl cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Internet Identity Login"}
            </button>
          </div>
        ) : (
          <div className="text-center max-w-lg w-full bg-white bg-opacity-90 backdrop-blur-lg p-8 rounded-3xl shadow-lg">
            <div className="flex justify-center mb-6">
              <Dochi size={80} />
            </div>
            <h1 className="text-4xl text-gray-800 mb-4">
              Welcome{user ? `, ${user.name}` : ""}! 👋
            </h1>
            <p className="text-gray-600 text-sm mb-2 break-all">
              Principal: {loginService.getPrincipal()}
            </p>
            {user && (
              <p className="text-gray-500 text-sm mb-8">
                Member since: {new Date(Number(user.createdAt)).toLocaleDateString()}
              </p>
            )}
            <button
              className="bg-gradient-to-r from-red-400 to-red-500 text-white border-none py-3 px-8 text-base font-semibold rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Use the actual NameModal component */}
      <NameModal
        showNameModal={showNameModal}
        userName={userName}
        setUserName={setUserName}
        handleNameSubmit={handleNameSubmit}
        isLoading={isLoading}
        error={error}
      />

      {/* Global animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(2deg);
          }
          50% {
            transform: translateY(-10px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
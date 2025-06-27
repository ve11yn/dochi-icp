import React, { useEffect } from 'react';
import Dochi from './dochi';

interface NameModalProps {
  showNameModal: boolean;
  userName: string;
  setUserName: (name: string) => void;
  handleNameSubmit: () => void;
  isLoading: boolean;
  error: string;
}

const NameModal: React.FC<NameModalProps> = ({
  showNameModal,
  userName,
  setUserName,
  handleNameSubmit,
  isLoading,
  error,
}) => {
  const isNameValid = userName.trim().length > 0 && userName.trim().length <= 50;

  useEffect(() => {
    console.log('NameModal state:', {
      showNameModal,
      userName,
      isLoading,
      error
    });
  }, [showNameModal, userName, isLoading, error]);

  useEffect(() => {
    if (showNameModal) {
      console.log('Network status when modal opened:', {
        online: navigator.onLine,
        canisterId: import.meta.env.VITE_LOGIN_CANISTER_ID
      });
    }
  }, [showNameModal]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 backdrop-blur-lg z-50 items-center justify-center ${
        showNameModal ? "flex" : "hidden"
      }`}
    >
      <div
        className="bg-white rounded-3xl p-10 max-w-md w-11/12 shadow-2xl"
        style={{
          animation: "modalSlideIn 0.3s ease-out",
        }}
      >
        <div className="flex items-center justify-center mb-6">
          <Dochi size={150} />
        </div>
        <h2 className="text-2xl text-gray-800 mb-4 text-center">
          What should <span className='font-semibold'>Dochi</span> call you?
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
            {import.meta.env.DEV && (
              <div className="mt-2 p-2 bg-red-50 text-xs overflow-auto max-h-20">
                Debug: {JSON.stringify({
                  userNameLength: userName.length,
                  userNameTrimmed: userName.trim(),
                  isLoading,
                  showNameModal
                })}
              </div>
            )}
          </div>
        )}

        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          maxLength={50}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isNameValid && !isLoading) {
              e.preventDefault();
              handleNameSubmit();
            }
          }}
          className="w-full p-4 border-2 border-gray-200 rounded-xl text-base mb-2 outline-none transition-colors focus:border-indigo-400"
          disabled={isLoading}
        />
        
        {!isNameValid && userName.length > 0 && (
          <p className="text-red-500 text-xs mt-1">
            Name must be between 1-50 characters
          </p>
        )}

        <p className="text-gray-600 text-[0.7rem] mb-8 leading-relaxed text-center">
          This stays private and is only used to personalize your experience
        </p>
        
        <div className="flex justify-end">
          <button
            className={`bg-gradient-to-r from-[#F8E1F1] to-[#D1DFF9] text-gray-700 border-none py-3 px-8 text-base font-semibold rounded-2xl cursor-pointer transition-all ${
              !isLoading && isNameValid 
                ? 'hover:translate-x-1 hover:shadow-lg' 
                : ''
            } ${
              isLoading ? 'opacity-80' : ''
            }`}
            onClick={handleNameSubmit}
            disabled={!isNameValid || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Next →'
            )}
          </button>
        </div>
        
        <style>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-50px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default NameModal;
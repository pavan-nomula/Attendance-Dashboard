import React from 'react';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-500">
      {/* Container for the stunning animation */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulsating ring */}
        <div className="absolute h-32 w-32 animate-[ping_2s_linear_infinite] rounded-full border-4 border-blue-400 opacity-20"></div>
        
        {/* Middle spinning gradient ring */}
        <div className="h-24 w-24 animate-spin rounded-full border-t-4 border-b-4 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
        
        {/* Inner static logo/text */}
        <div className="absolute font-bold text-blue-600 text-xl tracking-wider">
          VIT
        </div>
      </div>
      
      {/* Loading Text with glowing effect */}
      <div className="mt-12 flex flex-col items-center gap-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
          {message}
        </h2>
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-[bounce_1s_infinite_100ms]"></div>
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-[bounce_1s_infinite_200ms]"></div>
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-[bounce_1s_infinite_300ms]"></div>
        </div>
      </div>

      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 h-64 w-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 h-64 w-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
  );
};

export default LoadingScreen;

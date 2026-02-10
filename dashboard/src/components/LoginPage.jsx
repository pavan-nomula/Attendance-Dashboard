import React from 'react';
import { Link } from 'react-router-dom';


const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center p-8">
      {/* Header Section */}
      <header className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 flex items-center justify-start">
        {/* College Logo and Name */}
        <div className="flex items-center space-x-4">
          {/* VIT Logo */}
          <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
            VIT
          </div>
          {/* College Name and Subtitle */}
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Vishnu Institute of Technology
            </h1>
            <p className="text-sm text-blue-600">
              Smart Attendance Dashboard
            </p>
          </div>
        </div>
      </header>

      {/* --- Login Categories Section --- */}
      <main className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Incharge Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Incharge Login</h2>
          <p className="text-gray-600 text-base mb-6">Access dashboard</p>
          <Link to="/incharge-login">
            <button className="bg-blue-600 text-white font-medium py-2 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md cursor-pointer">
              Login
            </button>
          </Link>
        </div>

        {/* Faculty Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Faculty Login</h2>
          <p className="text-gray-600 text-base mb-6">Mark attendance</p>
          {/* The other buttons are also updated for consistency */}
          <Link to="/faculty-login">
            <button className="bg-blue-600 text-white font-medium py-2 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md cursor-pointer">
              Login
            </button>
          </Link>
        </div>

        {/* Student Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Login</h2>
          <p className="text-gray-600 text-base mb-6">View attendance</p>
          {/* The other buttons are also updated for consistency */}
          <Link to="/student-login">
            <button className="bg-blue-600 text-white font-medium py-2 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md cursor-pointer">
              Login
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
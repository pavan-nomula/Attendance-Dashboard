import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import InchargeLoginPage from './components/InchargeLoginPage';
import FacultyLoginPage from './components/FacultyLoginPage';
import StudentLoginPage from './components/StudentLoginPage';
import InchargeDashboard from './components/InchargeDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import LiveStudentMonitor from './components/LiveStudentMonitor';
import ChangePasswordPage from './components/ChangePasswordPage';
import LoadingScreen from './components/LoadingScreen';

const App = () => {
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    // Simulate initial system check/auth verification
    const timer = setTimeout(() => {
      setGlobalLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (globalLoading) {
    return <LoadingScreen message="Initializing System Security..." />;
  }

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/incharge-login" element={<InchargeLoginPage />} />
        <Route path="/faculty-login" element={<FacultyLoginPage />} />
        <Route path="/student-login" element={<StudentLoginPage />} />
        <Route path="/incharge-dashboard" element={<InchargeDashboard />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/live-monitor" element={<LiveStudentMonitor />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

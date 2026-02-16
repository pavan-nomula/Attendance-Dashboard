import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, removeToken, removeStoredUser } from '../services/api';
import { attendanceAPI, timetableAPI, permissionsAPI, reportsAPI } from '../services/api';
import LoadingScreen from './LoadingScreen';


const FacultyDashboard = () => {
  const [user, setUser] = useState(null);
  const [currentClass, setCurrentClass] = useState({});
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [permissionRequests, setPermissionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [facultyStats, setFacultyStats] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = getStoredUser();
    // Allow both 'faculty' and 'incharge' to access this dashboard
    if (!storedUser || !['faculty', 'incharge'].includes(storedUser.role)) {
      navigate('/');
      return;
    }
    setUser(storedUser);
    loadDashboardData(storedUser.id);

    // Refresh attendance every 30 seconds
    const interval = setInterval(() => {
      if (selectedPeriod !== null) {
        loadTodayAttendance(selectedPeriod);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate, selectedPeriod]);

  const loadDashboardData = async (facultyId) => {
    try {
      setLoading(true);

      // Load timetable
      const mySchedule = await timetableAPI.getMySchedule();
      setSchedule(mySchedule || []);

      const todaySchedule = (mySchedule || []).filter(item => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return item.day_of_week === days[new Date().getDay()];
      });

      // Find current class based on time
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentClassItem = todaySchedule.find(item => {
        return currentTime >= item.start_time && currentTime <= item.end_time;
      });

      if (currentClassItem) {
        setCurrentClass({
          subject: currentClassItem.subject,
          time: currentClassItem.time,
          location: currentClassItem.location,
          period_id: currentClassItem.period_id
        });
        setSelectedPeriod(currentClassItem.period_id);
        await loadTodayAttendance(currentClassItem.period_id);
      }

      // Load pending permission requests
      const permissionsData = await permissionsAPI.getAll();
      setPermissionRequests(permissionsData.rows || []);

      // Load faculty statistics
      const statsData = await reportsAPI.getFacultyStats();
      setFacultyStats(statsData.rows || []);

      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setLoading(false);
    }
  };

  const loadTodayAttendance = async (periodId) => {
    try {
      const attendanceData = await attendanceAPI.getToday(periodId);
      const formattedStudents = attendanceData.rows.map(item => ({
        id: item.student_id,
        name: item.name,
        email: item.email,
        status: item.status === 'P' ? 'Present' : 'Absent',
        marked_at: item.marked_at
      }));
      setStudents(formattedStudents);
    } catch (err) {
      console.error('Error loading attendance:', err);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      await attendanceAPI.markManual(studentId, selectedPeriod, status === 'Present' ? 'P' : 'A');
      await loadTodayAttendance(selectedPeriod);
      alert(`Attendance marked as ${status}`);
    } catch (err) {
      alert(`Failed to mark attendance: ${err.message}`);
    }
  };

  const handleApprovePermission = async (permissionId, status) => {
    try {
      await permissionsAPI.update(permissionId, status);
      const permissionsData = await permissionsAPI.getAll();
      setPermissionRequests(permissionsData.rows || []);
      alert(`Permission request ${status} successfully`);
    } catch (err) {
      alert(`Failed to update permission: ${err.message}`);
    }
  };

  const handleLogout = () => {
    removeToken();
    removeStoredUser();
    navigate('/');
  };

  const getStatusColor = (status) => {
    if (status === "Present" || status === "Approved") return 'text-green-500';
    if (status === "Absent" || status === "Late" || status === "Rejected") return 'text-red-500';
    if (status === "Pending") return 'text-yellow-500';
    return 'text-gray-800';
  };

  if (loading) {
    return <LoadingScreen message="Loading Faculty Dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header Section */}
      <header className="w-full bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="bg-blue-600 rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center text-white font-bold text-xl">
            VIT
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 leading-tight">
              Vishnu Institute of Technology
            </h1>
            <p className="text-sm text-blue-600">
              Smart Attendance Dashboard
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 gap-3 w-full md:w-auto">
          <span className="text-gray-600 text-sm md:text-base text-center md:text-left">
            Logged in as: <span className="font-medium text-blue-600">{user?.name || 'Faculty'}</span>
          </span>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Class Analytics */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Class Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facultyStats.map((stat, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{stat.subject} - Period {stat.period_id}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Classes:</span>
                  <span className="font-medium">{stat.total_classes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Present:</span>
                  <span className="font-medium text-green-600">{stat.total_present || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Absent:</span>
                  <span className="font-medium text-red-600">{stat.total_absent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unique Students:</span>
                  <span className="font-medium">{stat.unique_students || 0}</span>
                </div>
                {stat.total_classes > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(stat.total_present / stat.total_classes) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Attendance: {((stat.total_present / stat.total_classes) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {facultyStats.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-4">No class statistics available</p>
          )}
        </div>
      </div>

      {/* Live Class Attendance Section */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Live Class Attendance</h2>
          <button
            onClick={() => {
              // Export attendance to CSV
              const csv = [
                ['Student ID', 'Name', 'Email', 'Status', 'Marked At'],
                ...students.map(s => [s.id, s.name, s.email, s.status, s.marked_at || 'N/A'])
              ].map(row => row.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `attendance-${currentClass.subject || 'class'}-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div className="space-y-1">
            <p className="text-gray-600 text-sm">Subject: <span className="font-medium text-gray-800">{currentClass.subject || "No Class Active"}</span></p>
            <p className="text-gray-600 text-sm">Time: <span className="font-medium text-gray-800">{currentClass.time || "N/A"}</span></p>
            <p className="text-gray-600 text-sm">Location: <span className="font-medium text-gray-800">{currentClass.location || "N/A"}</span></p>
          </div>
          <button
            onClick={() => {
              alert('Attendance finalized for this period!');
            }}
            className="w-full sm:w-auto bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-medium transition-colors text-sm"
          >
            Finalize Attendance
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-gray-500 font-medium">STUDENT ID</th>
                <th className="py-2 px-4 text-gray-500 font-medium">STUDENT NAME</th>
                <th className="py-2 px-4 text-gray-500 font-medium">STATUS</th>
                <th className="py-2 px-4 text-gray-500 font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4 text-gray-800">{student.id}</td>
                    <td className="py-2 px-4 text-gray-800">{student.name}</td>
                    <td className={`py-2 px-4 ${getStatusColor(student.status)}`}>{student.status}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'Present')}
                        className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 mr-2"
                      >
                        Mark Present
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'Absent')}
                        className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700"
                      >
                        Mark Absent
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">No students in this class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Weekly Schedule</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-gray-500 font-medium">DAY</th>
                <th className="py-2 px-4 text-gray-500 font-medium">TIME</th>
                <th className="py-2 px-4 text-gray-500 font-medium">SUBJECT</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length > 0 ? (
                schedule
                  .sort((a, b) => {
                    const days = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
                    return (days[a.day_of_week] || 0) - (days[b.day_of_week] || 0) || a.start_time.localeCompare(b.start_time);
                  })
                  .map((classInfo, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4 text-gray-800 font-medium">{classInfo.day_of_week}</td>
                      <td className="py-2 px-4 text-gray-800">{classInfo.start_time} - {classInfo.end_time}</td>
                      <td className="py-2 px-4 text-gray-800 font-semibold">{classInfo.subject}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">No classes scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Requests Section */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pending Permission Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-gray-500 font-medium">STUDENT NAME</th>
                <th className="py-2 px-4 text-gray-500 font-medium">REASON</th>
                <th className="py-2 px-4 text-gray-500 font-medium">DATE RANGE</th>
                <th className="py-2 px-4 text-gray-500 font-medium">STATUS</th>
                <th className="py-2 px-4 text-gray-500 font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {permissionRequests.length > 0 ? (
                permissionRequests.map((request) => (
                  <tr key={request._id} className="border-b">
                    <td className="py-2 px-4 text-gray-800">{request.student_name || 'N/A'}</td>
                    <td className="py-2 px-4 text-gray-800">{request.reason || 'N/A'}</td>
                    <td className="py-2 px-4 text-gray-800">
                      {request.start_date ? new Date(request.start_date).toLocaleDateString() : 'N/A'}
                      {request.end_date && ` - ${new Date(request.end_date).toLocaleDateString()}`}
                    </td>
                    <td className={`py-2 px-4 font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </td>
                    <td className="py-2 px-4">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprovePermission(request._id, 'approved')}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprovePermission(request._id, 'rejected')}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">No pending permission requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
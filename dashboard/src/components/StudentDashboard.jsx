import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, removeToken, removeStoredUser } from '../services/api';
import { reportsAPI, permissionsAPI, complaintsAPI, timetableAPI, usersAPI } from '../services/api';
import LoadingScreen from './LoadingScreen';


const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [classesAttended, setClassesAttended] = useState(0);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [permissionRequests, setPermissionRequests] = useState([]);
  const [complaintText, setComplaintText] = useState('');
  const [submittedComplaints, setSubmittedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionReason, setPermissionReason] = useState('');
  const [permissionStartDate, setPermissionStartDate] = useState('');
  const [permissionEndDate, setPermissionEndDate] = useState('');
  const [subjectWiseData, setSubjectWiseData] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate('/');
      return;
    }
    setUser(storedUser);
    loadDashboardData(storedUser.id);
  }, [navigate]);

  const loadDashboardData = async (studentId) => {
    try {
      setLoading(true);

      // Load attendance percentage
      const attendanceData = await reportsAPI.getAttendancePercent(studentId);
      setAttendancePercentage(attendanceData.percent || 0);
      setTotalClasses(attendanceData.total || 0);
      setClassesAttended(attendanceData.present || 0);

      // Load attendance history
      const historyData = await reportsAPI.getAttendanceHistory(studentId);
      const formattedHistory = historyData.rows.map(item => ({
        subject: item.subject || 'N/A',
        date: new Date(item.date).toLocaleDateString(),
        time: item.start_time ? `${item.start_time} - ${item.end_time}` : 'N/A',
        status: item.status === 'P' ? 'Present' : 'Absent'
      }));
      setAttendanceLog(formattedHistory);

      // Load permission requests
      const permissionsData = await permissionsAPI.getMine();
      const formattedPermissions = permissionsData.rows.map(item => ({
        id: item.id,
        reason: item.reason || 'N/A',
        date: `${item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A'}${item.end_date ? ' - ' + new Date(item.end_date).toLocaleDateString() : ''}`,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1)
      }));
      setPermissionRequests(formattedPermissions);

      // Load complaints
      const complaintsData = await complaintsAPI.getMine();
      const formattedComplaints = complaintsData.rows.map(item => ({
        id: item.id,
        text: item.message,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        date: new Date(item.created_at).toLocaleDateString()
      }));
      setSubmittedComplaints(formattedComplaints);

      // Load subject-wise attendance
      const subjectData = await reportsAPI.getSubjectWise(studentId);
      setSubjectWiseData(subjectData.rows || []);

      // Load timetable
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayDay = days[new Date().getDay()];
      const timetableData = await timetableAPI.getAll(todayDay);
      setTimetable(timetableData || []);

      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      alert('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    removeStoredUser();
    navigate('/');
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'present' || statusLower === 'approved' || statusLower === 'resolved') return 'text-green-500';
    if (statusLower === 'absent' || statusLower === 'late' || statusLower === 'rejected' || statusLower === 'dismissed') return 'text-red-500';
    if (statusLower === 'pending') return 'text-yellow-500';
    return 'text-gray-800';
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (complaintText.trim() === '') {
      alert("Please enter your complaint or suggestion.");
      return;
    }

    try {
      await complaintsAPI.create(complaintText);
      alert("Your complaint has been submitted successfully!");
      setComplaintText('');
      // Reload complaints
      const complaintsData = await complaintsAPI.getMine();
      const formattedComplaints = complaintsData.rows.map(item => ({
        id: item.id,
        text: item.message,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        date: new Date(item.created_at).toLocaleDateString()
      }));
      setSubmittedComplaints(formattedComplaints);
    } catch (err) {
      alert(`Failed to submit complaint: ${err.message}`);
    }
  };

  const handleSubmitPermission = async (e) => {
    e.preventDefault();
    if (!permissionReason.trim()) {
      alert("Please enter a reason for leave.");
      return;
    }
    if (!permissionStartDate) {
      alert("Please select a start date.");
      return;
    }

    try {
      await permissionsAPI.create(
        permissionReason,
        permissionStartDate,
        permissionEndDate || permissionStartDate
      );
      alert("Permission request submitted successfully!");
      setPermissionReason('');
      setPermissionStartDate('');
      setPermissionEndDate('');
      // Reload permissions
      const permissionsData = await permissionsAPI.getMine();
      const formattedPermissions = permissionsData.rows.map(item => ({
        id: item.id,
        reason: item.reason || 'N/A',
        date: `${item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A'}${item.end_date ? ' - ' + new Date(item.end_date).toLocaleDateString() : ''}`,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1)
      }));
      setPermissionRequests(formattedPermissions);
    } catch (err) {
      alert(`Failed to submit permission request: ${err.message}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      await usersAPI.changePassword(user.id, newPassword);
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(`Failed to change password: ${err.message}`);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading Student Dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header Section */}
      <header className="w-full bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
            VIT
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Vishnu Institute of Technology
            </h1>
            <p className="text-sm text-blue-600">
              Smart Attendance Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            Logged in as: <span className="font-medium text-blue-600">{user?.name || 'Student'}</span>
          </span>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Change Password
          </button>
          <button onClick={handleLogout} className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Logout
          </button>
        </div>
      </header>

      {/* Attendance Overview Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800">{totalClasses}</h2>
          <p className="text-gray-600 mt-1">Total Classes</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-4xl font-bold text-green-500">{classesAttended}</h2>
          <p className="text-gray-600 mt-1">Classes Attended</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center relative">
          <h2 className="text-4xl font-bold text-blue-500">{attendancePercentage.toFixed(2)}%</h2>
          <p className="text-gray-600 mt-1">Attendance Percentage</p>
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${attendancePercentage >= 75 ? 'bg-green-500' :
                attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
            ></div>
          </div>
          {attendancePercentage < 75 && (
            <p className="text-xs text-red-600 mt-2">⚠️ Below 75% - Action Required</p>
          )}
        </div>
      </div>

      {/* Subject-wise Attendance Breakdown */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Subject-wise Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectWiseData.length > 0 ? (
            subjectWiseData.map((subject, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{subject.subject || 'N/A'}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Present:</span>
                    <span className="font-medium">{subject.present_classes || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">{subject.total_classes || 0}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Percentage:</span>
                      <span className={`font-bold ${(subject.percentage || 0) >= 75 ? 'text-green-600' :
                        (subject.percentage || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {subject.percentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${(subject.percentage || 0) >= 75 ? 'bg-green-500' :
                          (subject.percentage || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${Math.min(subject.percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-4">No subject-wise data available</p>
          )}
        </div>
      </div>

      {/* Today's Timetable */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Today's Timetable</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-gray-500 font-medium">TIME</th>
                <th className="py-2 px-4 text-gray-500 font-medium">SUBJECT</th>
                <th className="py-2 px-4 text-gray-500 font-medium">FACULTY</th>
              </tr>
            </thead>
            <tbody>
              {timetable.length > 0 ? (
                timetable.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4 text-gray-800">{item.start_time} - {item.end_time}</td>
                    <td className="py-2 px-4 text-gray-800 font-medium">{item.subject}</td>
                    <td className="py-2 px-4 text-gray-800">{item.faculty_name || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">No classes scheduled for today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Attendance Log */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Your Attendance Log</h2>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="border rounded-lg px-3 py-1 text-sm"
              placeholder="From"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="border rounded-lg px-3 py-1 text-sm"
              placeholder="To"
            />
            <button
              onClick={async () => {
                if (dateRange.from && dateRange.to) {
                  await loadDashboardData(user.id);
                }
              }}
              className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700"
            >
              Filter
            </button>
            <button
              onClick={() => {
                // Export to CSV
                const csv = [
                  ['Subject', 'Date', 'Time', 'Status'],
                  ...attendanceLog.map(log => [log.subject, log.date, log.time, log.status])
                ].map(row => row.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `attendance-report-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
              }}
              className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-gray-500 font-medium">SUBJECT</th>
                <th className="py-2 px-4 text-gray-500 font-medium">DATE</th>
                <th className="py-2 px-4 text-gray-500 font-medium">TIME</th>
                <th className="py-2 px-4 text-gray-500 font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLog.length > 0 ? (
                attendanceLog.map((log, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4 text-gray-800">{log.subject}</td>
                    <td className="py-2 px-4 text-gray-800">{log.date}</td>
                    <td className="py-2 px-4 text-gray-800">{log.time}</td>
                    <td className={`py-2 px-4 font-medium ${getStatusColor(log.status)}`}>{log.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">No attendance data to display.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Request Form and Status Tracker */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Leave & Permission Requests</h2>
        {/* Form to submit a new request */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-800 mb-2">Submit New Request</h3>
          <form onSubmit={handleSubmitPermission} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Reason for leave"
              value={permissionReason}
              onChange={(e) => setPermissionReason(e.target.value)}
              required
              className="flex-1 p-2 border rounded-lg"
            />
            <input
              type="date"
              value={permissionStartDate}
              onChange={(e) => setPermissionStartDate(e.target.value)}
              required
              className="flex-1 p-2 border rounded-lg"
            />
            <input
              type="date"
              value={permissionEndDate}
              onChange={(e) => setPermissionEndDate(e.target.value)}
              placeholder="End date (optional)"
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* Table to track request status */}
        <div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Your Submitted Requests</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left table-auto">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-gray-500 font-medium">REASON</th>
                  <th className="py-2 px-4 text-gray-500 font-medium">DATE</th>
                  <th className="py-2 px-4 text-gray-500 font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {permissionRequests.length > 0 ? (
                  permissionRequests.map((request, index) => (
                    <tr key={request.id || index} className="border-b">
                      <td className="py-2 px-4 text-gray-800">{request.reason}</td>
                      <td className="py-2 px-4 text-gray-800">{request.date}</td>
                      <td className={`py-2 px-4 font-medium ${getStatusColor(request.status)}`}>{request.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">No submitted requests to display.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Complaints / Suggestions Section */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Complaints / Suggestions</h2>
        <form onSubmit={handleSubmitComplaint}>
          <textarea
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="Write your complaint or suggestion here..."
            rows="4"
            className="w-full p-2 border rounded-lg mb-4"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit Complaint
          </button>
        </form>
        <div className="mt-6">
          <h3 className="text-xl font-medium text-gray-800 mb-2">Your Submitted Complaints</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left table-auto">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-gray-500 font-medium">COMPLAINT</th>
                  <th className="py-2 px-4 text-gray-500 font-medium">STATUS</th>
                  <th className="py-2 px-4 text-gray-500 font-medium">DATE</th>
                </tr>
              </thead>
              <tbody>
                {submittedComplaints.length > 0 ? (
                  submittedComplaints.map((complaint, index) => (
                    <tr key={complaint.id || index} className="border-b">
                      <td className="py-2 px-4 text-gray-800">{complaint.text}</td>
                      <td className={`py-2 px-4 font-medium ${getStatusColor(complaint.status)}`}>{complaint.status}</td>
                      <td className="py-2 px-4 text-gray-800">{complaint.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">No submitted complaints to display.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
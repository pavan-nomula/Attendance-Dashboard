import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, removeToken, removeStoredUser } from '../services/api';
import { attendanceAPI, usersAPI, permissionsAPI, complaintsAPI, reportsAPI, timetableAPI, hardwareAPI } from '../services/api';
import LoadingScreen from './LoadingScreen';


const InchargeDashboard = () => {
  const navigate = useNavigate();

  /* =========================
     INCHARGE INFO
  ========================= */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     STATS
  ========================= */
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);

  /* =========================
     CORE DATA (NO DUMMY)
  ========================= */
  const [attendanceFeed, setAttendanceFeed] = useState([]);
  const [permissionRequests, setPermissionRequests] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [rejectedLeaves, setRejectedLeaves] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [liveStats, setLiveStats] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserUID, setNewUserUID] = useState('');
  const [newUserRegNo, setNewUserRegNo] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [userFilter, setUserFilter] = useState('');

  /* =========================
     COMPLAINTS / SUGGESTIONS (NEW)
  ========================= */
  /* =========================
     COMPLAINTS / SUGGESTIONS (NEW)
  ========================= */
  const [complaints, setComplaints] = useState([]);

  /* =========================
     TIMETABLE
  ========================= */
  const [timetable, setTimetable] = useState([]);
  const [ttDay, setTtDay] = useState('Monday');
  const [ttSubject, setTtSubject] = useState('');
  const [ttStartTime, setTtStartTime] = useState('');
  const [ttEndTime, setTtEndTime] = useState('');
  const [ttFacultyName, setTtFacultyName] = useState('');
  const [ttFacultyEmail, setTtFacultyEmail] = useState('');

  /* =========================
     FORM STATES
  ========================= */
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [permissionStartTime, setPermissionStartTime] = useState('');
  const [permissionEndTime, setPermissionEndTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [selectedDay, setSelectedDay] = useState('Today');

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser || !['incharge', 'admin'].includes(storedUser.role)) {
      navigate('/');
      return;
    }
    setUser(storedUser);
    loadDashboardData();

    // Poll for live stats every 5 seconds
    const interval = setInterval(async () => {
      try {
        const liveData = await attendanceAPI.getLiveStats();
        setLiveStats(liveData || []);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all users
      const usersData = await usersAPI.getAll();
      setAllUsers(usersData.rows || []);
      const students = (usersData.rows || []).filter(u => u.role === 'student');
      setTotalStudents(students.length);

      // Load today's attendance
      const attendanceData = await attendanceAPI.getToday();
      const formattedFeed = attendanceData.rows.map(item => ({
        id: item.student_id,
        name: item.name,
        email: item.email,
        status: item.status === 'P' ? 'Present' : 'Absent',
        timestamp: item.marked_at ? new Date(item.marked_at).toLocaleTimeString() : 'N/A',
        accessStatus: 'Active',
        parentNotified: false,
        isManual: item.source === 'web'
      }));
      setAttendanceFeed(formattedFeed);

      // Load Live Hardware Stats (Aggregated Entry/Exit)
      const liveData = await attendanceAPI.getLiveStats();
      setLiveStats(liveData || []);

      const presentCount = formattedFeed.filter(s => s.status === 'Present').length;
      const absentCount = formattedFeed.filter(s => s.status === 'Absent').length;
      setPresentToday(presentCount);
      setAbsentToday(absentCount);

      // Load permission requests
      const permissionsData = await permissionsAPI.getAll();
      setPermissionRequests(permissionsData.rows || []);

      // Load complaints
      const complaintsData = await complaintsAPI.getAll();
      const formattedComplaints = complaintsData.rows.map(item => ({
        id: item._id,
        message: item.message,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        date: new Date(item.createdAt).toLocaleDateString(),
        student_name: item.student_name
      }));
      setComplaints(formattedComplaints);

      // Load overall statistics
      const statsData = await reportsAPI.getOverallStats();
      setOverallStats(statsData);

      // Load Timetable
      const ttData = await timetableAPI.getAll();
      setTimetable(ttData || []);

      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setLoading(false);
    }
  };

  /* =========================
     HELPERS
  ========================= */
  const generateStudentId = () =>
    `V${Math.floor(10000000 + Math.random() * 90000000)}`;

  const formatTo12Hour = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const finalHour = hour % 12 || 12;
    return `${finalHour}:${m} ${ampm}`;
  };

  const getStatusColor = (status = '') => {
    if (status.includes('Present') || status.includes('Approved') || status.includes('Cleaned'))
      return 'text-green-600 font-semibold';
    if (status.includes('Absent') || status.includes('Rejected'))
      return 'text-red-600 font-semibold';
    return 'text-gray-800';
  };

  /* =========================
     MARK ABSENT
  ========================= */
  const markAbsent = async (student) => {
    try {
      await attendanceAPI.markManual(student.id, null, 'A');
      await loadDashboardData();
      alert('Student marked as absent');
    } catch (err) {
      alert(`Failed to mark absent: ${err.message}`);
    }
  };

  const handleApprovePermission = async (permissionId, status) => {
    try {
      await permissionsAPI.update(permissionId, status);
      await loadDashboardData();
      alert(`Permission request ${status} successfully`);
    } catch (err) {
      alert(`Failed to update permission: ${err.message}`);
    }
  };

  const handleUpdateComplaint = async (complaintId, status) => {
    try {
      await complaintsAPI.update(complaintId, status);
      await loadDashboardData();
      alert(`Complaint ${status} successfully`);
    } catch (err) {
      alert(`Failed to update complaint: ${err.message}`);
    }
  };

  const handleAddTimetable = async () => {
    if (!ttDay || !ttSubject || !ttStartTime || !ttEndTime) {
      alert('Please fill day, subject, start time, and end time');
      return;
    }
    try {
      // Automatic Scoping: Use incharge's department/class if available
      await timetableAPI.create(
        ttDay,
        ttSubject,
        ttStartTime,
        ttEndTime,
        ttFacultyEmail,
        ttFacultyName,
        user.department,
        user.class_name
      );
      alert('Timetable entry added');
      // Reload
      const ttData = await timetableAPI.getAll();
      setTimetable(ttData || []);
      // Reset form (optional)
      setTtSubject('');
      setTtStartTime('');
      setTtEndTime('');
      setTtFacultyName('');
      setTtFacultyEmail('');
    } catch (err) {
      alert('Failed to add timetable: ' + err.message);
    }
  };

  const handleSyncHardware = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await hardwareAPI.uploadCSV(file);
      alert(res.message || 'Hardware attendance synced successfully!');
      await loadDashboardData();
    } catch (err) {
      alert(`Failed to sync hardware: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimetable = async (id) => {
    if (!confirm('Delete this schedule entry?')) return;
    try {
      await timetableAPI.delete(id);
      const ttData = await timetableAPI.getAll();
      setTimetable(ttData || []);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleLogout = () => {
    removeToken();
    removeStoredUser();
    navigate('/');
  };

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail) {
      alert('Please fill in name and email');
      return;
    }
    try {
      await usersAPI.create(newUserName, newUserEmail, newUserRole, newUserUID || null, newUserRegNo || null, newUserPassword || null);
      const passwordMessage = newUserPassword
        ? `User created! Password set to: ${newUserPassword}`
        : newUserRole === 'student'
          ? 'User created! Default password: Welcome#4'
          : 'User created!';
      alert(passwordMessage);
      setShowUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('student');
      setNewUserUID('');
      setNewUserRegNo('');
      setNewUserPassword('');
      await loadDashboardData();
    } catch (err) {
      alert(`Failed to create user: ${err.message}`);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await usersAPI.update(editingUser._id, newUserName, newUserEmail, newUserRole, newUserUID || null, newUserRegNo || null);
      alert('User updated successfully!');
      setShowUserModal(false);
      setEditingUser(null);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('student');
      setNewUserUID('');
      setNewUserRegNo('');
      await loadDashboardData();
    } catch (err) {
      alert(`Failed to update user: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersAPI.delete(userId);
      alert('User deleted successfully!');
      await loadDashboardData();
    } catch (err) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const handleMapUID = async (userId, uid) => {
    try {
      await usersAPI.mapUID(userId, uid);
      alert('UID mapped successfully!');
      await loadDashboardData();
    } catch (err) {
      alert(`Failed to map UID: ${err.message}`);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setNewUserName(user.name);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
    setNewUserUID(user.uid || '');
    setNewUserRegNo(user.id_number || '');
    setNewUserPassword('');
    setShowUserModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('student');
    setNewUserUID('');
    setNewUserRegNo('');
    setNewUserPassword('');
    setShowUserModal(true);
  };

  const filteredUsers = allUsers.filter(u => {
    if (!userFilter) return true;
    const filter = userFilter.toLowerCase();
    return u.name.toLowerCase().includes(filter) ||
      u.email.toLowerCase().includes(filter) ||
      u.role.toLowerCase().includes(filter);
  });


  /* =========================
     FILTERS
  ========================= */
  const filteredStudents = attendanceFeed.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* =========================
     UI
  ========================= */
  if (loading) {
    return <LoadingScreen message="Loading Incharge Dashboard..." />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-100">

      {/* HEADER */}
      <header className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="bg-blue-600 rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center text-white font-bold text-xl">
            VIT
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold leading-tight">Vishnu Institute of Technology</h1>
            <p className="text-sm text-blue-600">
              Logged in as: Incharge – {user?.name || 'Admin'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/live-monitor')}
            className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Live Monitor
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard title="Total Students" value={totalStudents} />
        <StatCard title="Present Today" value={presentToday} color="text-green-600" />
        <StatCard title="Absent Today" value={absentToday} color="text-red-600" />
        {overallStats && (
          <>
            <StatCard title="Pending Permissions" value={overallStats.pendingPermissions || 0} color="text-yellow-600" />
            <StatCard title="Pending Complaints" value={overallStats.pendingComplaints || 0} color="text-orange-600" />
          </>
        )}
      </div>

      {/* Student Management */}
      <Section title="Student Management">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search students..."
            className="border p-2 rounded-lg w-full sm:max-w-md bg-white text-sm"
          />
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Add User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Reg No</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">UID</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3 font-mono text-xs">{u.id_number || 'N/A'}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    {u.role === 'student' ? (
                      <input
                        type="text"
                        value={u.uid || ''}
                        onChange={(e) => handleMapUID(u._id, e.target.value)}
                        placeholder="Enter UID"
                        className="border rounded px-2 py-1 text-sm w-32"
                      />
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openEditModal(u)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section >

      {/* User Modal */}
      {
        showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
                <select
                  value={newUserRole}
                  disabled={true}
                  className="w-full border p-2 rounded-lg bg-gray-100 cursor-not-allowed"
                >
                  <option value="student">Student</option>
                </select>
                {!editingUser && (
                  <input
                    type="password"
                    placeholder={newUserRole === 'student' ? 'Password (leave empty for default: Welcome#4)' : 'Password (required)'}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                  />
                )}
                {newUserRole === 'student' && (
                  <>
                    <input
                      type="text"
                      placeholder="Registration Number (e.g. 24PA1A0250)"
                      value={newUserRegNo}
                      onChange={(e) => setNewUserRegNo(e.target.value.toUpperCase())}
                      className="w-full border p-2 rounded-lg font-mono"
                    />
                    <input
                      type="text"
                      placeholder="UID (for Raspberry Pi)"
                      value={newUserUID}
                      onChange={(e) => setNewUserUID(e.target.value)}
                      className="w-full border p-2 rounded-lg"
                    />
                  </>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={editingUser ? handleUpdateUser : handleCreateUser}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Permission Requests */}
      <Section title="Pending Permission Requests">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Date Range</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissionRequests.filter(p => p.status === 'pending').length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">No pending requests</td>
                </tr>
              ) : (
                permissionRequests.filter(p => p.status === 'pending').map((req) => (
                  <tr key={req._id} className="border-b">
                    <td className="p-3">{req.student_name || 'N/A'}</td>
                    <td className="p-3">{req.reason || 'N/A'}</td>
                    <td className="p-3">
                      {req.start_date ? new Date(req.start_date).toLocaleDateString() : 'N/A'}
                      {req.end_date && ` - ${new Date(req.end_date).toLocaleDateString()}`}
                    </td>
                    <td className={`p-3 ${getStatusColor(req.status)}`}>{req.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleApprovePermission(req._id, 'approved')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovePermission(req._id, 'rejected')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* LIVE ATTENDANCE */}
      <Section
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <span className="truncate">Live attendance data</span>
              <span className="ml-2 text-xs font-bold text-emerald-600 tracking-wider">(HARDWARE STREAM ACTIVE)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/live-monitor')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm hover:bg-indigo-700 font-bold animate-pulse"
              >
                OPEN CONSOLE 📡
              </button>
              <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm hover:bg-blue-700 cursor-pointer flex items-center">
                Sync Hardware
                <input type="file" className="hidden" accept=".csv" onChange={handleSyncHardware} />
              </label>
              <button
                onClick={() => {
                  const csv = [
                    ['Student ID', 'Name', 'Entry Time', 'Exit Time', 'Status'],
                    ...liveStats.map(s => [s.name, s.name, s.entryTime, s.exitTime, s.lastStatus])
                  ].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `live-attendance-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm hover:bg-emerald-700 font-medium"
              >
                Export CSV
              </button>
            </div>
          </div>
        }
      >
        <input className="border p-2 rounded-lg mb-4 w-full md:w-1/3 bg-white text-sm" placeholder="Search student..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student Member</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">ID / RegNo</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Entry Time (Login)</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Exit Time</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {liveStats.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-12 text-gray-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full animate-spin"></div>
                      Waiting for hardware scans...
                    </div>
                  </td>
                </tr>
              )}

              {liveStats.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.regNo && s.regNo.toLowerCase().includes(searchQuery.toLowerCase()))).map((s, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs capitalize">
                        {s.name.charAt(0)}
                      </div>
                      <div className="font-semibold text-gray-800">{s.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-gray-500">{s.regNo}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${s.lastStatus === 'IN'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                      {s.lastStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {s.entryTime}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">
                      {s.exitTime === s.entryTime ? '--:--' : s.exitTime}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => markAbsent({ id: s.name, name: s.name })}
                      className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                    >
                      Mark Absent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* TIMETABLE MANAGER */}
      <Section title="Timetable Manager">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
          <select
            value={ttDay}
            onChange={e => setTtDay(e.target.value)}
            className="border p-2 rounded"
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Subject (e.g. Maths)"
            value={ttSubject}
            onChange={e => setTtSubject(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="time"
            value={ttStartTime}
            onChange={e => setTtStartTime(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="time"
            value={ttEndTime}
            onChange={e => setTtEndTime(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Faculty Name (Optional)"
            value={ttFacultyName}
            onChange={e => setTtFacultyName(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Faculty Email (Optional)"
            value={ttFacultyEmail}
            onChange={e => setTtFacultyEmail(e.target.value)}
            className="border p-2 rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTimetable}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
            >
              Add Class
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 text-left">Day</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Faculty</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{t.day_of_week}</td>
                  <td className="p-3">{formatTo12Hour(t.start_time)} - {formatTo12Hour(t.end_time)}</td>
                  <td className="p-3 font-semibold text-blue-600">{t.subject}</td>
                  <td className="p-3">
                    {t.faculty_name || 'N/A'}
                    {t.faculty_id && <span className="text-xs text-gray-500 block">ID: {t.faculty_id}</span>}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteTimetable(t._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {timetable.length === 0 && (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No classes scheduled yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>



      {/* COMPLAINTS & SUGGESTIONS (NEW SECTION) */}
      <Section title="Complaints / Suggestions">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Complaint</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-500">
                    No submitted complaints to display.
                  </td>
                </tr>
              )}

              {complaints.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">
                    <div className="font-medium">{c.student_name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{c.message}</div>
                  </td>
                  <td className={`p-3 font-medium ${getStatusColor(c.status)}`}>{c.status}</td>
                  <td className="p-3">{c.date}</td>
                  <td className="p-3">
                    {c.status.toLowerCase() === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateComplaint(c.id, 'resolved')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm mr-2"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleUpdateComplaint(c.id, 'dismissed')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

    </div >
  );
};

/* =========================
   REUSABLE COMPONENTS
========================= */
const Section = ({ title, children }) => (
  <section className="bg-white rounded-xl shadow-md p-4 md:p-6 mt-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </section>
);

const StatCard = ({ title, value, color = 'text-gray-800' }) => (
  <div className="bg-white rounded-xl shadow-md p-6 text-center">
    <h2 className={`text-3xl font-bold ${color}`}>{value}</h2>
    <p className="text-gray-600 mt-1">{title}</p>
  </div>
);

export default InchargeDashboard;

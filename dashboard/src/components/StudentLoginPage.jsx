import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, setToken, setStoredUser } from '../services/api';

const StudentLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);

      // Check if user is a student
      if (response.user.role !== 'student') {
        setError('This is not a Student account. Please use the correct login page.');
        setLoading(false);
        return;
      }

      // Store token and user
      setToken(response.token);
      setStoredUser(response.user);

      if (response.user.must_change_password) {
        navigate('/change-password');
        return;
      }

      navigate('/student-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 transform transition-transform hover:scale-105 duration-300">

        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            VIT
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Login</h2>
          <p className="text-gray-600">View your attendance records and reports</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="example@vishnu.edu.in"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm space-y-2">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
          <p className="text-gray-600">
            Not a Student?{' '}
            <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
              Go back to main login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default StudentLoginPage;

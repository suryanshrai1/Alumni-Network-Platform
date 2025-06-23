import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());

    let query = supabase.from('users').select('*');

    query = isEmail
      ? query.eq('email', identifier.trim())
      : query.eq('username', identifier.trim());

    const { data: user, error } = await query.single();

    if (error || !user) {
      setMessage('User not found');
      setLoading(false);
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      setMessage('Incorrect password');
      setLoading(false);
    } else {
      setMessage(`Welcome, ${user.full_name}! Redirecting...`);
      localStorage.setItem('alumniUser', JSON.stringify(user));
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-blue-200 px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-xl ring-1 ring-gray-300">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-800 tracking-tight">
          Log In to Alumni Network
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-1">
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="you@example.com or yourusername"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
              onChange={(e) => setIdentifier(e.target.value)}
              required
              value={identifier}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
              onChange={(e) => setPassword(e.target.value)}
              required
              value={password}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className={`w-full py-3 rounded-md text-white font-semibold shadow-md transition-colors duration-300 ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600 font-medium">{message}</p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

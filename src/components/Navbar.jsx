import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      return;
    }

    localStorage.removeItem('alumniUser');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="text-2xl sm:text-3xl font-semibold text-blue-700 tracking-tight cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          🎓 Alumni Network
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 transition"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 transition"
          >
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

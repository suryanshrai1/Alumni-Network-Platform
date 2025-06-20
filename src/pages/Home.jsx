import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 text-center px-4">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
        Welcome to the Alumni Network
      </h1>
      <p className="text-lg text-gray-700 max-w-xl mb-6">
        Stay connected with fellow alumni, attend events, and grow your professional network.
      </p>
      <button
        onClick={handleLoginRedirect}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Get Started / Login
      </button>
    </main>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Page not found.</p>
      <Link to="/" className="text-blue-600 hover:underline text-lg">
        Return Home
      </Link>
    </main>
  );
};

export default NotFound;

import React from 'react';

const Dashboard = () => {
  return (
    <main className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-semibold text-lg text-gray-700 mb-2">Your Profile</h3>
          <p className="text-gray-500">Quick access to your info and updates.</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-semibold text-lg text-gray-700 mb-2">Upcoming Events</h3>
          <p className="text-gray-500">See what's coming up soon.</p>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;

import React from 'react';

const Home = () => {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome Back, Alumni!</h1>
          <p className="text-lg md:text-xl mb-6">Reconnect, network, and give back to your alma mater.</p>
          <a href="/join" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-100 transition">
            Join the Network
          </a>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">Latest News</h3>
            <p className="text-gray-600">Stay updated with campus news and alumni achievements.</p>
            <a href="/news" className="block mt-4 text-blue-600 font-medium hover:underline">Read More</a>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">Upcoming Events</h3>
            <p className="text-gray-600">Join reunions, webinars, and networking meetups.</p>
            <a href="/events" className="block mt-4 text-blue-600 font-medium hover:underline">View Events</a>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">Alumni Stories</h3>
            <p className="text-gray-600">Read inspiring journeys from fellow alumni around the world.</p>
            <a href="/stories" className="block mt-4 text-blue-600 font-medium hover:underline">Explore Stories</a>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-100 py-12">
        <div className="text-center max-w-2xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Want to give back?</h2>
          <p className="text-gray-700 mb-6">Support scholarships, volunteer your time, or mentor a student.</p>
          <a href="/give-back" className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition">
            Get Involved
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;

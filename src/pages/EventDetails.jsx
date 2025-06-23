import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';  // useLocation for retrieving passed state
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EventDetails = () => {
  const location = useLocation();  // Get the state passed from navigate
  const navigate = useNavigate();
  const [event, setEvent] = useState(location.state || null);  // Set event from state or default to null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!event) {
      setError("Event details are not available.");
      return;
    }
  }, [event]);

  const formatDate = (dateStr) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  if (!event) {
    return <div className="text-center text-gray-500">Event data not found.</div>;
  }

  const handleBackToEvents = () => {
    navigate('/dashboard'); 
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8 sm:p-12 my-10 space-y-8">
        {/* Back Button */}
        <button
          onClick={handleBackToEvents}  // Navigate back to Dashboard's event section
          className="bg-indigo-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 mb-6"
        >
          Back to Events
        </button>

        {/* Event Details Container */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">

          {/* Event Title */}
          <h2 className="text-4xl font-extrabold text-indigo-700 mb-4">{event.title}</h2>

          {/* Posted by and Date & Time */}
          <div className="flex justify-between items-center text-gray-700">
            <div className="text-lg font-semibold text-indigo-600">
              <span className="font-semibold">Posted by:</span> {event.postedBy}
            </div>
            <div className="text-lg font-semibold text-indigo-600">
              <span className="font-semibold">Date & Time:</span> {formatDate(event.event_date)}
            </div>
          </div>

          {/* Location */}
          <div className="bg-indigo-50 p-4 rounded-lg text-indigo-700 text-lg">
            <span className="font-semibold">Location:</span> {event.location || 'N/A'}
          </div>

          {/* Event Description */}
          <div className="text-gray-700 leading-relaxed">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Event Description</h3>
            <p className="whitespace-pre-line text-sm sm:text-base">{event.description}</p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetails;

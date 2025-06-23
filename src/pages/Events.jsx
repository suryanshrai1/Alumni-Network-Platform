import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import PostedEvent from '../components/PostedEvents';
import AddEvent from '../components/AddEvent';

const Events = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'post' | 'mine'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all events function
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, location, event_date, user_id')
        .order('event_date', { ascending: true });

      if (error) {
        setError('Failed to load events.');
        setLoading(false);
        return;
      }

      const eventsWithUsers = await Promise.all(
        data.map(async (event) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('full_name, username')
            .eq('id', event.user_id)
            .single();

          return {
            ...event,
            postedBy: userError ? 'Unknown' : (userData.full_name || userData.username),
          };
        })
      );

      setEvents(eventsWithUsers);
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (event) => {
    navigate('/events/details', { state: event });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Called by AddEvent on success to refetch and switch tab
  const onAddEventSuccess = () => {
    fetchEvents();
    setActiveTab('all');
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-10 my-10">
      <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">Events Dashboard</h2>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'post' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Post an Event
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'mine' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          My Posted Events
        </button>
      </div>

      {/* All Events */}
      {activeTab === 'all' && (
        <>
          {loading && <p className="text-gray-500 text-center">Loading events...</p>}
          {error && <p className="text-red-600 text-center font-semibold">{error}</p>}
          {!loading && events.length === 0 && (
            <p className="text-gray-600 text-center italic">No events found.</p>
          )}
          <ul className="space-y-8">
            {events.map((event) => (
              <li
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="border rounded-lg p-6 hover:shadow-xl transition-all duration-300 bg-white cursor-pointer max-h-[300px] flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h3 className="text-2xl font-semibold text-indigo-800">{event.title}</h3>
                  <div className="mt-2 sm:mt-0 p-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium text-sm w-max">
                    {formatDate(event.event_date)}
                  </div>
                </div>
                {event.location && (
                  <p className="mt-3 text-gray-600 italic text-sm">📍 {event.location}</p>
                )}
                <p className="mt-3 text-gray-700 leading-relaxed text-sm overflow-hidden text-ellipsis max-h-16">
                  {event.description || 'No description available.'}
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-semibold text-indigo-700">Posted by:</span>{' '}
                  <span className="italic">{event.postedBy}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Post an Event */}
      {activeTab === 'post' && (
        <AddEvent onSuccess={onAddEventSuccess} />
      )}

      {/* My Posted Events */}
      {activeTab === 'mine' && <PostedEvent />}
    </div>
  );
};

export default Events;

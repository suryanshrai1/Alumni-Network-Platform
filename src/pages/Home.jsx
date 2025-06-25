import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  const [alumni, setAlumni] = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(true);
  const [alumniError, setAlumniError] = useState(null);

  const [alumniPage, setAlumniPage] = useState(0);
  const ALUMNI_PER_PAGE = 3;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, description, location, event_date')
          .order('event_date', { ascending: false })
          .limit(3);
        if (error) throw error;
        setEvents(data || []);
      } catch {
        setEventsError('Failed to load events.');
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchAlumni = async () => {
      setAlumniLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, username, graduation_year, department')
          .order('created_at', { ascending: false })
          .limit(9);
        if (error) throw error;
        setAlumni(data || []);
      } catch {
        setAlumniError('Failed to load alumni.');
      } finally {
        setAlumniLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  useEffect(() => {
    if (alumni.length <= ALUMNI_PER_PAGE) return;
    const interval = setInterval(() => {
      setAlumniPage((prev) => (prev + 1) % Math.ceil(alumni.length / ALUMNI_PER_PAGE));
    }, 6000);
    return () => clearInterval(interval);
  }, [alumni]);

  const handleChatDashboard = () => {
    const user = JSON.parse(localStorage.getItem('alumniUser'));
    if (user) navigate('/dashboard', { state: { defaultTab: 'chat' } });
    else navigate('/login');
  };

  const handleViewEventDetails = () => {
    navigate('/dashboard', { state: { defaultTab: 'events' } });
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

  const displayedAlumni = alumni.slice(
    alumniPage * ALUMNI_PER_PAGE,
    alumniPage * ALUMNI_PER_PAGE + ALUMNI_PER_PAGE
  );

  return (
    <div className="bg-blue-50 text-blue-900 font-sans">
      {/* Hero Section */}
      <section className="relative h-[90vh] bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-fixed bg-cover bg-center opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556740749-887f6717d7e4?crop=entropy&cs=tinysrgb&fit=max&ixid=M3wzNjkzMnwwfDF8c2VhcmNofDExfHxhbHVtbnklMjBuZXR3b3JrfGVufDB8fHx8fDE2ODMwNzExMzA&ixlib=rb-1.2.1&q=80&w=1080')` }}></div>

        {/* Blur Effect */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="relative z-10 container mx-auto h-full flex flex-col justify-center items-center px-6 md:px-10 text-center">
          <h1 className="text-white text-6xl md:text-7xl font-extrabold mb-6 leading-tight animate-fade-in">
            Your Story Continues Here.
          </h1>
          <p className="text-white text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Discover new opportunities, rekindle old friendships, and celebrate the achievements of our alumni family.
          </p>
          <a
            href="/join"
            className="bg-white text-blue-700 font-semibold px-8 py-4 rounded-full shadow-lg transform transition-all hover:bg-blue-100 hover:scale-110 hover:shadow-xl"
          >
            Join the Network
          </a>
        </div>
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce text-white text-3xl md:text-4xl">
          ↓
        </div>
      </section>

      {/* Recent Events Section */}
      <section className="py-20 px-6 md:px-12 bg-blue-100 relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')` }}></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-blue-800 mb-10 text-center">Recent Events</h2>
          {eventsLoading ? (
            <p className="text-center text-blue-500">Loading events...</p>
          ) : eventsError ? (
            <p className="text-center text-red-500">{eventsError}</p>
          ) : events.length === 0 ? (
            <p className="text-center text-blue-500 italic">No events found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map(event => (
                <div key={event.id} className="bg-white shadow-lg rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4 text-blue-700">🎉</div>
                  <h3 className="text-xl font-bold text-blue-800 mb-1">{event.title}</h3>
                  <p className="text-sm text-blue-500 mb-2">📅 {formatDate(event.event_date)}</p>
                  {event.location && <p className="text-sm text-blue-500">📍 {event.location}</p>}
                  <button
                    onClick={handleViewEventDetails}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                  >
                    View Events
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Alumni Highlights Section */}
      <section className="py-20 px-6 md:px-12 bg-blue-200 relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80')` }}></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-blue-800 mb-10 text-center">Alumni Highlights</h2>
          {alumniLoading ? (
            <p className="text-center text-blue-500">Loading alumni...</p>
          ) : alumniError ? (
            <p className="text-center text-red-500">{alumniError}</p>
          ) : alumni.length === 0 ? (
            <p className="text-center text-blue-500 italic">No alumni found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-opacity duration-700">
                {displayedAlumni.map(alum => (
                  <div key={alum.id} className="bg-white shadow-lg rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(alum.full_name)}&background=3B82F6&color=fff`}
                      alt="avatar"
                      className="w-16 h-16 mx-auto mb-4 rounded-full"
                    />
                    <h3 className="text-lg font-semibold text-blue-800">{alum.full_name}</h3>
                    <p className="text-blue-600">@{alum.username}</p>
                    <p className="text-blue-500 text-sm">{alum.department}</p>
                    <p className="text-blue-500 text-sm">Class of {alum.graduation_year}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(alumni.length / ALUMNI_PER_PAGE) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAlumniPage(idx)}
                    className={`w-3 h-3 rounded-full ${alumniPage === idx ? 'bg-blue-600' : 'bg-blue-300'} transition-colors`}
                  ></button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Chat Feature Section */}
      <section className="py-20 px-6 md:px-12 bg-blue-900 text-white text-center">
        <div className="bg-white/10 backdrop-blur-md max-w-3xl mx-auto p-10 rounded-lg shadow-xl">
          <div className="mb-6 text-6xl text-blue-200">
            <span role="img" aria-label="Chat" className="animate-pulse">💬</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Connect Instantly with Chat</h2>
          <p className="text-blue-200 mb-8">
            Start a conversation or network with fellow alumni in real time using our built-in chat feature.
          </p>
          <button
            onClick={handleChatDashboard}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Go to Chat Dashboard →
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;

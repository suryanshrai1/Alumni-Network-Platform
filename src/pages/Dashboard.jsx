import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Events from './Events';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../supabaseClient';
import AlumniList from './AlumniList';
import Discover from './Discover';

const tabs = [
  { id: 'events', label: 'Events' },
  // Removed postedEvents tab
  { id: 'chat', label: 'Chat' },
  { id: 'directory', label: 'Discover' },  // Changed label here
];

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'events');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('alumniUser'));
    
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData(user.id);
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('users')
        .select('full_name, username')
        .eq('id', userId);

      if (error) {
        console.error('Error fetching user data from Supabase:', error.message);
      } else {
        if (data.length > 0) {
          setUserData(data[0]);
        } else {
          console.error('No data found for user ID:', userId);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserData function:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <h1 className="text-4xl font-extrabold text-blue-800 m-8 text-center">Alumni Network Dashboard</h1>

      {/* Tabs Navigation */}
      <div className="max-w-4xl mx-auto">
        <nav className="flex border-b border-gray-300 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-center py-3 font-medium text-lg
                ${activeTab === tab.id
                  ? 'border-b-4 border-blue-600 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
                }
                transition-colors duration-300`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <section>
          {activeTab === 'events' && <Events />}
          {activeTab === 'chat' && <AlumniList />}
          {activeTab === 'directory' && <Discover />}
        </section>
      </div>

      {loading && (
        <div className="text-center my-8">
          <p>Loading user data...</p>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;

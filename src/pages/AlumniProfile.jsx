import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.substring(0, 2).toUpperCase();
};

const AlumniProfile = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('full_name, email, created_at, graduation_year, department, current_job, bio, college, username')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <p className="text-gray-500">Loading profile...</p>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Profile data not available</h2>
                <p className="text-gray-600">This can happen if you refresh the page or visit the URL directly.</p>
                <Link to="/discover" className="mt-4 inline-block text-blue-600 hover:underline">&larr; Go back to Discover to select a profile</Link>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link to="/dashboard" state={{ defaultTab: 'directory' }} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    &larr; Back to Dashboard
                </Link>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Profile Header */}
                <div className="p-8 bg-blue-50 border-b border-blue-100 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                        {getInitials(user.full_name)}
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
                        <p className="text-md text-gray-500">@{user.username}</p>
                    </div>
                </div>

                {/* Profile Body */}
                <div className="p-8">
                    {/* Bio Section */}
                    {user.bio && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">About</h2>
                            <p className="text-gray-600 whitespace-pre-wrap">{user.bio}</p>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Contact Info */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium text-gray-600">Email:</span> <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a></p>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Professional</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium text-gray-600">Occupation:</span> {user.current_job || 'Not specified'}</p>
                            </div>
                        </div>
                        
                        {/* Academic Info */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Academics</h3>
                             <div className="space-y-2">
                                <p><span className="font-medium text-gray-600">College:</span> {user.college}</p>
                                <p><span className="font-medium text-gray-600">Department:</span> {user.department}</p>
                                <p><span className="font-medium text-gray-600">Graduated:</span> {user.graduation_year}</p>
                             </div>
                        </div>

                        {/* Account Info */}
                        <div>
                           <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account</h3>
                           <div className="space-y-2">
                                <p><span className="font-medium text-gray-600">Joined:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlumniProfile;
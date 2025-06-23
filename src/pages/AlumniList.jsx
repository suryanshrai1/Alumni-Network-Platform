import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('alumniUser'));
  const userId = user?.id;
  const subscriptionRef = useRef(null);

  useEffect(() => {
    supabase
      .from('users')
      .select('id, full_name, username, graduation_year, department')
      .then(({ data }) => {
        if (data) {
          // Filter out current user
          const filteredData = data.filter(user => user.id !== userId);
          setAlumni(filteredData);
        }
      });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    subscriptionRef.current = supabase
      .channel(`alumni-list-msgs-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        async ({ new: newMsg }) => {
          const { data: senderData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', newMsg.sender_id)
            .single();

          const senderName = senderData?.full_name || 'Someone';
          toast.info(`📩 New message from ${senderName}`, {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [userId]);

  const filtered = alumni.filter(a =>
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-purple-700 mb-8">
          Connect with Alumni
        </h2>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full px-5 py-3 rounded-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(alum => (
            <li
              key={alum.id}
              onClick={() => navigate('/chat', { state: { receiverId: alum.id } })}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-5 cursor-pointer border border-transparent hover:border-purple-300"
            >
              <div className="text-xl font-semibold text-purple-800">
                {alum.full_name}{' '}
                <span className="text-sm text-gray-500">(@{alum.username})</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {alum.department} · Class of {alum.graduation_year}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AlumniList;

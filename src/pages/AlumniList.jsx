import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState('');
  const [lastMessageTimes, setLastMessageTimes] = useState({});
  const [newMessageFrom, setNewMessageFrom] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('alumniUser'));
  const userId = user?.id;
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch alumni list
    supabase
      .from('users')
      .select('id, full_name, username, graduation_year, department')
      .neq('id', userId)
      .then(({ data }) => {
        if (data) {
          setAlumni(data);
        }
      });

    // Fetch last message times
    const fetchLastMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, timestamp')
        .eq('receiver_id', userId)
        .order('timestamp', { ascending: false });

      if (!error && data) {
        const lastTimes = {};
        data.forEach((msg) => {
          if (!lastTimes[msg.sender_id]) {
            lastTimes[msg.sender_id] = msg.timestamp;
          }
        });
        setLastMessageTimes(lastTimes);
      }
    };

    // Fetch unread message counts
    const fetchUnreadCounts = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, is_read')
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (!error && data) {
        const counts = {};
        data.forEach((msg) => {
          counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    };

    fetchLastMessages();
    fetchUnreadCounts();
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
          if (!newMsg) return;

          // Update last message time
          setLastMessageTimes((prev) => ({
            ...prev,
            [newMsg.sender_id]: newMsg.timestamp,
          }));

          // Add to new message set
          setNewMessageFrom((prevSet) => {
            const newSet = new Set(prevSet);
            newSet.add(newMsg.sender_id);
            return newSet;
          });

          // Update unread count
          setUnreadCounts((prev) => ({
            ...prev,
            [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1
          }));

          // Show notification
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

  const filteredSortedAlumni = alumni
    .filter((a) =>
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.username?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aTime = lastMessageTimes[a.id] ? new Date(lastMessageTimes[a.id]) : new Date(0);
      const bTime = lastMessageTimes[b.id] ? new Date(lastMessageTimes[b.id]) : new Date(0);
      return bTime - aTime;
    });

  const handleAlumniClick = (alumId) => {
    // Clear new message indicator
    setNewMessageFrom((prevSet) => {
      const newSet = new Set(prevSet);
      newSet.delete(alumId);
      return newSet;
    });

    // Reset unread count for this user
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[alumId];
      return newCounts;
    });

    // Mark messages as read
    supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', alumId)
      .then();

    navigate('/chat', { state: { receiverId: alumId } });
  };

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full px-5 py-3 rounded-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSortedAlumni.map((alum) => (
            <li
              key={alum.id}
              onClick={() => handleAlumniClick(alum.id)}
              className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-5 cursor-pointer border border-transparent hover:border-purple-300 flex items-center"
            >
              {/* Unread message indicator */}
              {(newMessageFrom.has(alum.id) || unreadCounts[alum.id]) && (
                <div className="absolute top-3 right-3 flex items-center justify-center">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  {unreadCounts[alum.id] > 1 && (
                    <span className="ml-1 text-xs font-semibold text-red-600">
                      {unreadCounts[alum.id]}
                    </span>
                  )}
                </div>
              )}

              <div className="flex-1">
                <div className="text-xl font-semibold text-purple-800">
                  {alum.full_name}{' '}
                  <span className="text-sm text-gray-500">(@{alum.username})</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {alum.department} · Class of {alum.graduation_year}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AlumniList;

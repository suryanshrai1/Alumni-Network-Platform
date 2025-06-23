import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom'; // Added useLocation
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { id: paramReceiverId } = useParams(); // In case there's a fallback

  const [receiverId, setReceiverId] = useState(location.state?.receiverId || null); // Get receiverId from state
  const sender = JSON.parse(localStorage.getItem('alumniUser'));
  const senderId = sender?.id;

  const [receiverName, setReceiverName] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const channelRef = useRef(null);

  // If paramReceiverId is available and not set yet, set it from URL and clean the URL
  useEffect(() => {
    if (paramReceiverId && !receiverId) {
      setReceiverId(paramReceiverId);
      navigate('/chat', { replace: true }); // Clean URL if direct link was used
    }
  }, [paramReceiverId, receiverId, navigate]);

  // Load receiver info
  useEffect(() => {
    if (!receiverId) return;
    supabase
      .from('users')
      .select('full_name, username')
      .eq('id', receiverId)
      .single()
      .then(({ data }) => {
        if (data) {
          setReceiverName(`${data.full_name} (@${data.username})`);
        }
      });
  }, [receiverId]);

  // Load and subscribe to messages
  useEffect(() => {
    if (!senderId || !receiverId) return;

    supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
      )
      .order('timestamp', { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
        scrollToBottom();
      });

    const timer = setTimeout(() => {
      channelRef.current = supabase
        .channel(`chat-${senderId}-${receiverId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          ({ new: newMsg }) => {
            const isRelevant =
              (newMsg.sender_id === senderId && newMsg.receiver_id === receiverId) ||
              (newMsg.sender_id === receiverId && newMsg.receiver_id === senderId);

            if (!isRelevant) return;

            setMessages((prev) => [...prev, newMsg]);
            const c = scrollContainerRef.current;
            const atBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 50;
            if (atBottom) scrollToBottom();

            if (newMsg.sender_id !== senderId) {
              toast.info(`New message from ${receiverName.split(' ')[0]}`, {
                position: 'top-right',
                autoClose: 3000,
              });
            }
          }
        )
        .subscribe();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [receiverId, senderId, receiverName]);

  const scrollToBottom = (behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    await supabase.from('messages').insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content: message.trim(),
      },
    ]);
    setMessage('');
    inputRef.current?.focus();
  };

  const handleBack = () => {
    navigate('/dashboard', { state: { defaultTab: 'chat' } });
  };


  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-3xl w-full mx-auto mt-10 flex flex-col bg-white rounded-2xl shadow-xl flex-grow">
        <div className="px-6 py-4 border-b border-purple-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-purple-800">
            {receiverName || 'Loading...'}
          </h2>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-purple-200 text-purple-800 rounded hover:bg-purple-300 transition text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto p-6 space-y-4 bg-purple-100"
          style={{ minHeight: 0, maxHeight: 'calc(100vh - 260px)' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === senderId ? 'justify-end' : 'justify-start'}`}
            >
              <span
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === senderId
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow'
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="px-6 py-4 border-t border-purple-200 flex gap-3 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message…"
            className="flex-grow px-4 py-3 rounded-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            className="px-6 py-3 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition"
          >
            Send
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChatPage;

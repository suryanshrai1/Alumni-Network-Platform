import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { format, isToday, isYesterday } from 'date-fns';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { id: paramReceiverId } = useParams();

  const [receiverId, setReceiverId] = useState(location.state?.receiverId || null);
  const sender = JSON.parse(localStorage.getItem('alumniUser'));
  const senderId = sender?.id;

  const [receiverName, setReceiverName] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const channelRef = useRef(null);
  const messageRefs = useRef({}); // to scroll to messages

  useEffect(() => {
    if (paramReceiverId && !receiverId) {
      setReceiverId(paramReceiverId);
      navigate('/chat', { replace: true });
    }
  }, [paramReceiverId, receiverId, navigate]);

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
            scrollToBottom();

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
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior });
    }, 50);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    await supabase.from('messages').insert([{
      sender_id: senderId,
      receiver_id: receiverId,
      content: message.trim(),
      reply_to: replyingTo?.id || null,
    }]);

    setMessage('');
    setReplyingTo(null);
    inputRef.current?.focus();
    scrollToBottom();
  };

  const handleBack = () => {
    navigate('/dashboard', { state: { defaultTab: 'chat' } });
  };

  const findMessageById = (id) => messages.find((msg) => msg.id === id);

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp);
      let key = format(date, 'yyyy-MM-dd');
      if (isToday(date)) key = 'Today';
      else if (isYesterday(date)) key = 'Yesterday';
      else key = format(date, 'MMM dd, yyyy');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

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
          className="flex-grow overflow-y-auto p-6 bg-purple-100"
          style={{ minHeight: 0, maxHeight: 'calc(100vh - 260px)' }}
        >
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center text-sm text-gray-500 mb-4">{date}</div>
              {msgs.map((msg) => {
                const isOwn = msg.sender_id === senderId;
                const repliedTo = msg.reply_to ? findMessageById(msg.reply_to) : null;

                return (
                  <div
                    key={msg.id}
                    ref={(el) => (messageRefs.current[msg.id] = el)}
                    className={`group relative flex ${
                      isOwn ? 'justify-end' : 'justify-start'
                    } mb-5`}
                  >
                    <div className="relative max-w-xs">
                      {repliedTo && (
                        <div
                          className="text-sm text-gray-600 bg-purple-200 px-2 py-1 rounded mb-1 cursor-pointer text-[14px]"
                          onClick={() => {
                            const el = messageRefs.current[repliedTo.id];
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              el.classList.add('ring', 'ring-purple-300');
                              setTimeout(() => {
                                el.classList.remove('ring', 'ring-purple-300');
                              }, 1500);
                            }
                          }}
                        >
                          ↪ {repliedTo.content}
                        </div>
                      )}
                      <span
                        className={`block px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none shadow'
                        }`}
                      >
                        {msg.content}
                        <div className="text-xs text-gray-300 mt-1 text-right">
                          {format(new Date(msg.timestamp), 'hh:mm a')}
                        </div>
                      </span>
                      <button
                        onClick={() => {
                          setReplyingTo(msg);
                          inputRef.current?.focus();
                        }}
                        className="absolute right-0 top-0 mt-[-10px] mr-[-10px] text-xs text-black opacity-0 group-hover:opacity-100 transition"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {replyingTo && (
          <div className="px-6 py-2 bg-purple-100 border-t border-purple-300 text-sm text-purple-800 flex justify-between items-center">
            <span className="text-[15px] font-medium">
              Replying to: <em>{replyingTo.content}</em>
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-xs text-purple-500 hover:text-purple-700"
            >
              Cancel
            </button>
          </div>
        )}

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

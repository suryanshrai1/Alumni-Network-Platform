import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const RealtimeListener = () => {
  const channelRef = useRef(null);

  useEffect(() => {
    // Always read user inside useEffect to avoid stale localStorage reads
    const stored = localStorage.getItem('alumniUser');
    if (!stored) {
      console.warn('[RealtimeListener] No user found in localStorage.');
      return;
    }

    let user;
    try {
      user = JSON.parse(stored);
    } catch (e) {
      console.error('[RealtimeListener] Failed to parse alumniUser:', e);
      return;
    }

    if (!user?.id) {
      console.warn('[RealtimeListener] User ID is missing.');
      return;
    }

    console.log('[RealtimeListener] Setting up listener for user ID:', user.id);

    channelRef.current = supabase
      .channel(`global-message-listener-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const newMsg = payload.new;
          if (!newMsg || !newMsg.sender_id) {
            console.warn('[RealtimeListener] Skipped: sender_id missing in payload.');
            return;
          }

          // Skip if message is from self
          if (newMsg.sender_id === user.id) return;

          try {
            const { data: senderData, error } = await supabase
              .from('users')
              .select('full_name')
              .eq('id', newMsg.sender_id)
              .single();

            if (error || !senderData) {
              console.warn('[RealtimeListener] Sender not found:', error);
              toast.info(`📩 New message received`);
              return;
            }

            toast.info(`📩 New message from ${senderData.full_name}`, {
              position: 'top-right',
              autoClose: 3000,
            });
          } catch (err) {
            console.error('[RealtimeListener] Error fetching sender info:', err);
          }
        }
      )
      .subscribe((status) => {
        console.log('[RealtimeListener] Subscription status:', status);
      });

    return () => {
      console.log('[RealtimeListener] Cleaning up listener...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return null;
};

export default RealtimeListener;

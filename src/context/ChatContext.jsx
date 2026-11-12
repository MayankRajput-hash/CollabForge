// Context provider for real-time peer-to-peer and team messaging
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useProjects } from './ProjectContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ChatContext = createContext();

const STORAGE_CHATS_KEY = 'collabforge_chat_messages_v2';
const LEGACY_DEMO_PROFILE_IDS = new Set([
  'student-alex-chen',
  'student-priya-patel',
  'student-marcus-vance',
  'student-elena-rostova',
  'student-david-kim'
]);

export function ChatProvider({ children }) {
  const { currentUser, users } = useAuth();
  const { showToast } = useProjects();
  const currentUserId = currentUser?.id;

  const [messages, setMessages] = useState(() => {
    if (isSupabaseConfigured) return [];
    try {
      const saved = localStorage.getItem(STORAGE_CHATS_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter(message =>
          !LEGACY_DEMO_PROFILE_IDS.has(message.senderId)
          && !LEGACY_DEMO_PROFILE_IDS.has(message.receiverId))
        : [];
    } catch {
      return [];
    }
  });

  // Active peer/teammate selected in messaging view
  const [activePartnerId, setActivePartnerId] = useState(null);
  const [isRealtimeConnected, setRealtimeConnected] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed saving messages to localStorage:', e);
    }
  }, [messages]);

  // Supabase Realtime Channel subscription for messages if Supabase is connected
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !currentUserId) return;

    let mounted = true;
    const userId = currentUserId;
    const formatMessage = message => ({
      id: message.id,
      conversationId: message.conversation_id || [message.sender_id, message.receiver_id].sort().join(':'),
      senderId: message.sender_id,
      senderName: message.sender_name || 'Teammate',
      senderAvatar: message.sender_avatar || '',
      receiverId: message.receiver_id,
      text: message.text || '',
      timestamp: message.created_at
        ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now',
      createdAt: message.created_at
    });

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (error) {
        if (mounted) showToast(`Could not load messages: ${error.message}`, 'warning');
        return;
      }

      if (mounted) {
        setMessages(previous => {
          const byId = new Map((data || []).map(message => {
            const formatted = formatMessage(message);
            return [formatted.id, formatted];
          }));
          previous.forEach(message => {
            if (!byId.has(message.id)) byId.set(message.id, message);
          });
          return Array.from(byId.values()).sort((a, b) =>
            new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          );
        });
      }
    };

    let channel;
    try {
      channel = supabase
        .channel(`chat-realtime-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          (payload) => {
            const newMsg = payload.new;
            if (newMsg) {
              const formatted = formatMessage(newMsg);
              setMessages(prev => {
                if (prev.some(m => m.id === formatted.id)) return prev;
                return [...prev, formatted];
              });
            }
          }
        )
        .subscribe(status => {
          if (!mounted) return;
          setRealtimeConnected(status === 'SUBSCRIBED');
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            showToast('Realtime messaging could not connect. Messages may be delayed.', 'warning');
          }
        });
    } catch (err) {
      showToast(`Realtime messaging is unavailable: ${err.message}`, 'warning');
    }
    void loadMessages();

    return () => {
      mounted = false;
      setRealtimeConnected(false);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUserId, showToast]);

  // Compute conversation partner ID helper
  const getConversationId = useCallback((userAId, userBId) => {
    return [userAId, userBId].sort().join(':');
  }, []);

  // Send a message
  const sendMessage = useCallback(async ({ receiverId, text, attachments = [] }) => {
    if (!currentUser || !receiverId || receiverId === currentUser.id || typeof text !== 'string' || !text.trim()) return null;
    if (text.trim().length > 5000) {
      throw new Error('Messages must be 5,000 characters or fewer.');
    }

    const partner = users.find(u => u.id === receiverId);
    const convId = getConversationId(currentUser.id, receiverId);
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      conversationId: convId,
      senderId: currentUser.id,
      senderName: currentUser.name || 'You',
      senderAvatar: currentUser.avatar || '',
      receiverId,
      receiverName: partner?.name || 'Teammate',
      text: text.trim(),
      timestamp: timeString,
      createdAt: now.toISOString(),
      attachments
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('messages').insert([{
          id: newMsg.id,
          conversation_id: convId,
          sender_id: currentUser.id,
          sender_name: currentUser.name,
          sender_avatar: currentUser.avatar,
          receiver_id: receiverId,
          text: newMsg.text,
          created_at: now.toISOString()
        }]).select('id').single();
        if (error) throw error;
        if (!data) throw new Error('The server did not confirm the message was sent.');
      } catch (err) {
        throw new Error(`Could not send message: ${err.message}`);
      }
    }

    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  }, [currentUser, users, getConversationId]);

  // Get all conversation threads for the current user
  const conversations = React.useMemo(() => {
    if (!currentUser) return [];

    const convMap = new Map();

    messages.forEach(msg => {
      // Check if message belongs to current user
      if (msg.senderId !== currentUser.id && msg.receiverId !== currentUser.id) return;

      const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      const partner = users.find(u => u.id === partnerId) || {
        id: partnerId,
        name: msg.senderId === currentUser.id ? (msg.receiverName || 'Teammate') : msg.senderName,
        avatar: msg.senderId === currentUser.id ? '' : msg.senderAvatar,
        university: 'Peer Collaborator'
      };

      const existing = convMap.get(partnerId);
      if (!existing || new Date(msg.createdAt || 0) > new Date(existing.lastMessage?.createdAt || 0)) {
        convMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg,
          unreadCount: 0 // Can be expanded
        });
      }
    });

    return Array.from(convMap.values()).sort((a, b) => {
      const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
      const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [currentUser, messages, users]);

  // Messages filtered for the currently active chat
  const activeMessages = React.useMemo(() => {
    if (!currentUser || !activePartnerId) return [];
    const convId = getConversationId(currentUser.id, activePartnerId);
    return messages.filter(m => m.conversationId === convId || 
      (m.senderId === currentUser.id && m.receiverId === activePartnerId) ||
      (m.senderId === activePartnerId && m.receiverId === currentUser.id)
    );
  }, [currentUser, activePartnerId, messages, getConversationId]);

  // Start chat with a specific student
  const openChatWith = useCallback((studentId) => {
    setActivePartnerId(studentId);
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      conversations,
      activePartnerId,
      setActivePartnerId,
      activeMessages,
      sendMessage,
      openChatWith,
      isRealtimeConnected
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

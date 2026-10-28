// Context provider for real-time peer-to-peer and team messaging
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
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

  // Messages store: array of message objects
  // { id, conversationId, senderId, senderName, senderAvatar, text, timestamp, attachments }
  const [messages, setMessages] = useState(() => {
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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed saving messages to localStorage:', e);
    }
  }, [messages]);

  // Supabase Realtime Channel subscription for messages if Supabase is connected
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !currentUser) return;

    let channel;
    try {
      channel = supabase
        .channel(`chat-realtime-${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${currentUser.id}`
          },
          (payload) => {
            const newMsg = payload.new;
            if (newMsg) {
              const formatted = {
                id: newMsg.id || `msg-${Date.now()}`,
                conversationId: newMsg.conversation_id || [newMsg.sender_id, newMsg.receiver_id].sort().join(':'),
                senderId: newMsg.sender_id,
                senderName: newMsg.sender_name || 'Teammate',
                senderAvatar: newMsg.sender_avatar || '',
                receiverId: newMsg.receiver_id,
                text: newMsg.text || newMsg.content || '',
                timestamp: newMsg.created_at ? new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
              };
              setMessages(prev => {
                if (prev.some(m => m.id === formatted.id)) return prev;
                return [...prev, formatted];
              });
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime channel subscribe failed:', err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser]);

  // Compute conversation partner ID helper
  const getConversationId = useCallback((userAId, userBId) => {
    return [userAId, userBId].sort().join(':');
  }, []);

  // Send a message
  const sendMessage = useCallback(async ({ receiverId, text, attachments = [] }) => {
    if (!currentUser || !receiverId || !text.trim()) return null;

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

    // Optimistically update local message list
    setMessages(prev => [...prev, newMsg]);

    // Send to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').insert([{
          id: newMsg.id,
          conversation_id: convId,
          sender_id: currentUser.id,
          sender_name: currentUser.name,
          sender_avatar: currentUser.avatar,
          receiver_id: receiverId,
          text: newMsg.text,
          created_at: now.toISOString()
        }]);
      } catch (err) {
        console.warn('Could not persist message to Supabase:', err);
      }
    }

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
      openChatWith
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

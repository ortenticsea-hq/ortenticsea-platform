import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  doc,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../services/firestoreDb';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  conversationId: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  createdAt: string;
}

/**
 * Hook for persisting one-on-one conversations to Firestore
 * Enables real-time chat with message persistence across devices
 */
export const usePersistedConversation = (
  userId: string | null,
  otherUserId: string | null
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create deterministic conversation ID from user IDs
  const conversationId = userId && otherUserId
    ? [userId, otherUserId].sort().join('_')
    : null;

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const messagesRef = collection(db, `conversations/${conversationId}/messages`);
      const q = query(
        messagesRef,
        orderBy('timestamp', 'asc'),
        limit(100) // Load last 100 messages
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const msgs: ChatMessage[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            msgs.push({
              id: doc.id,
              senderId: data.senderId,
              senderName: data.senderName,
              message: data.message,
              timestamp: data.timestamp.toDate().toISOString(),
              conversationId: data.conversationId,
              avatar: data.avatar,
            });
          });
          setMessages(msgs);
          setLoading(false);
        },
        (err) => {
          console.error('Error loading messages:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error loading conversation';
      console.error('Error setting up conversation subscription:', err);
      setError(errorMessage);
      setLoading(false);
    }
  }, [conversationId]);

  // Send message
  const sendMessage = useCallback(
    async (
      message: string,
      senderName: string,
      avatar?: string
    ) => {
      if (!userId || !conversationId) {
        setError('Invalid user or conversation');
        return;
      }

      if (!message.trim()) {
        setError('Message cannot be empty');
        return;
      }

      setSending(true);
      setError(null);

      try {
        const messagesRef = collection(
          db,
          `conversations/${conversationId}/messages`
        );

        await addDoc(messagesRef, {
          senderId: userId,
          senderName,
          message: message.trim(),
          timestamp: Timestamp.now(),
          conversationId,
          avatar: avatar || null,
        });

        setSending(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error sending message';
        console.error('Error sending message:', err);
        setError(errorMessage);
        setSending(false);
        throw err;
      }
    },
    [userId, conversationId]
  );

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    conversationId,
  };
};

/**
 * Hook for listing all user conversations
 * Useful for showing inbox/conversation list
 */
export const useUserConversations = (userId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query conversations where user is a participant
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        orderBy('lastMessageTime', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const convos: Conversation[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Only include conversations where user is a participant
            if (Array.isArray(data.participants) && data.participants.includes(userId)) {
              convos.push({
                id: doc.id,
                participants: data.participants,
                participantNames: data.participantNames || [],
                lastMessage: data.lastMessage,
                lastMessageTime: data.lastMessageTime?.toDate().toISOString(),
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
              });
            }
          });
          setConversations(convos);
          setLoading(false);
        },
        (err) => {
          console.error('Error loading conversations:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error loading conversations';
      console.error('Error setting up conversations subscription:', err);
      setError(errorMessage);
      setLoading(false);
    }
  }, [userId]);

  return {
    conversations,
    loading,
    error,
  };
};

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Message, MessageType, Room, Profile, Memory, Reaction } from '../types/database';
import { sounds } from '../lib/audio';
import { proposalConfig } from '../config/proposal';

interface ChatContextType {
  activeRoom: Room | null;
  partner: Profile | null;
  messages: Message[];
  memories: Memory[];
  isLoadingMessages: boolean;
  isPartnerTyping: boolean;
  isHeartStormActive: boolean;
  wallpaperTheme: string;
  daysTogether: number;
  currentLoveQuote: string;
  createRoom: (name?: string, passcode?: string) => Promise<Room>;
  joinRoom: (inviteCode: string, passcode?: string) => Promise<{ success: boolean; error?: string }>;
  sendMessage: (content: string, type?: MessageType, mediaUrl?: string, replyToId?: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
  sendThinkingOfYou: () => void;
  addMemory: (imageUrl: string, caption?: string, date?: string) => Promise<void>;
  deleteMemory: (memoryId: string) => Promise<void>;
  setWallpaperTheme: (theme: string) => void;
  nextLoveQuote: () => void;
  recordProposalResponse: (answer: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const LOCAL_MESSAGES_KEY = 'our_little_space_messages_';
const LOCAL_ROOM_KEY = 'our_little_space_active_room';
const LOCAL_MEMORIES_KEY = 'our_little_space_memories_';
const LOCAL_THEME_KEY = 'our_little_space_theme';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isHeartStormActive, setIsHeartStormActive] = useState(false);
  const [wallpaperTheme, setWallpaperThemeState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_THEME_KEY) || 'pink-blossom';
  });

  const [quoteIndex, setQuoteIndex] = useState(0);
  const typingTimeoutRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Calculate days together
  const calculateDaysTogether = useCallback(() => {
    const start = new Date(proposalConfig.anniversaryDate).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    return diff;
  }, []);

  const [daysTogether] = useState<number>(calculateDaysTogether());

  const currentLoveQuote = proposalConfig.romanticQuotes[quoteIndex % proposalConfig.romanticQuotes.length];

  const nextLoveQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % proposalConfig.romanticQuotes.length);
  }, []);

  const setWallpaperTheme = useCallback((theme: string) => {
    setWallpaperThemeState(theme);
    localStorage.setItem(LOCAL_THEME_KEY, theme);
  }, []);

  // Broadcast Channel setup for instant multi-tab sync (and peer testing)
  useEffect(() => {
    const channel = new BroadcastChannel('our_little_space_peer_channel');
    broadcastChannelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'NEW_MESSAGE') {
        const msg: Message = payload;
        if (msg.sender_id !== user?.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          sounds.playMessageReceived();
          sounds.vibrate(60);
        }
      } else if (type === 'MESSAGE_EDIT') {
        setMessages((prev) =>
          prev.map((m) => (m.id === payload.id ? { ...m, content: payload.content, is_edited: true } : m))
        );
      } else if (type === 'MESSAGE_DELETE') {
        setMessages((prev) => prev.filter((m) => m.id !== payload.id));
      } else if (type === 'REACTION_TOGGLE') {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== payload.messageId) return m;
            const currentReactions = m.reactions || [];
            const exists = currentReactions.find(
              (r) => r.user_id === payload.userId && r.emoji === payload.emoji
            );
            let nextReactions: Reaction[];
            if (exists) {
              nextReactions = currentReactions.filter((r) => r !== exists);
            } else {
              nextReactions = [
                ...currentReactions,
                {
                  id: 'react-' + Math.random().toString(36).substring(2, 8),
                  message_id: payload.messageId,
                  user_id: payload.userId,
                  emoji: payload.emoji,
                  created_at: new Date().toISOString(),
                },
              ];
            }
            return { ...m, reactions: nextReactions };
          })
        );
      } else if (type === 'TYPING') {
        if (payload.userId !== user?.id) {
          setIsPartnerTyping(payload.isTyping);
        }
      } else if (type === 'HEART_STORM') {
        setIsHeartStormActive(true);
        sounds.playHeartBurst();
        sounds.vibrate([100, 50, 100]);
        setTimeout(() => setIsHeartStormActive(false), 4500);
      } else if (type === 'NEW_MEMORY') {
        setMemories((prev) => [payload, ...prev]);
      } else if (type === 'DELETE_MEMORY') {
        setMemories((prev) => prev.filter((m) => m.id !== payload.id));
      }
    };

    return () => {
      channel.close();
    };
  }, [user]);

  // Load saved active room on startup
  useEffect(() => {
    const savedRoom = localStorage.getItem(LOCAL_ROOM_KEY);
    if (savedRoom) {
      try {
        const roomObj: Room = JSON.parse(savedRoom);
        setActiveRoom(roomObj);
      } catch {
        localStorage.removeItem(LOCAL_ROOM_KEY);
      }
    }
  }, []);

  // Fetch messages and partner whenever active room changes
  useEffect(() => {
    if (!activeRoom) return;

    localStorage.setItem(LOCAL_ROOM_KEY, JSON.stringify(activeRoom));
    setIsLoadingMessages(true);

    if (isSupabaseConfigured) {
      // 1. Fetch Room Messages from Supabase
      supabase
        .from('messages')
        .select(`
          *,
          reactions (*)
        `)
        .eq('room_id', activeRoom.id)
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
          if (!error && data) {
            setMessages(data as Message[]);
          }
          setIsLoadingMessages(false);
        });

      // 2. Fetch Room Memories
      supabase
        .from('memories')
        .select('*')
        .eq('room_id', activeRoom.id)
        .order('memory_date', { ascending: false })
        .then(({ data }) => {
          if (data) setMemories(data as Memory[]);
        });

      // 3. Fetch Partner Profile
      supabase
        .from('room_members')
        .select('user_id, profiles(*)')
        .eq('room_id', activeRoom.id)
        .neq('user_id', user?.id || '')
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.profiles) {
            setPartner(data.profiles as unknown as Profile);
          }
        });

      // 4. Supabase Realtime Subscription for room
      const channel = supabase.channel(`room_${activeRoom.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            if (newMsg.sender_id !== user?.id) {
              sounds.playMessageReceived();
              sounds.vibrate(60);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` },
          (payload) => {
            const updatedMsg = payload.new as Message;
            setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m)));
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` },
          (payload) => {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        )
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (payload.userId !== user?.id) {
            setIsPartnerTyping(payload.isTyping);
          }
        })
        .on('broadcast', { event: 'heart_storm' }, () => {
          setIsHeartStormActive(true);
          sounds.playHeartBurst();
          sounds.vibrate([100, 50, 100]);
          setTimeout(() => setIsHeartStormActive(false), 4500);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Local/Demo storage fallback
      const savedMsgs = localStorage.getItem(LOCAL_MESSAGES_KEY + activeRoom.id);
      if (savedMsgs) {
        try {
          setMessages(JSON.parse(savedMsgs));
        } catch {
          setMessages([]);
        }
      } else {
        // Initial sample welcome messages
        const initialMsgs: Message[] = [
          {
            id: 'msg-welcome-1',
            room_id: activeRoom.id,
            sender_id: 'partner-id',
            content: `Welcome to our secret place, ${user?.name || 'my love'}! 💕`,
            type: 'text',
            status: 'seen',
            is_edited: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            reactions: [{ id: 'r1', message_id: 'msg-welcome-1', user_id: 'me', emoji: '💖', created_at: new Date().toISOString() }],
          },
          {
            id: 'msg-welcome-2',
            room_id: activeRoom.id,
            sender_id: user?.id || 'me',
            content: `I love this so much! Every day with you is my happiest day. 🌸✨`,
            type: 'text',
            status: 'seen',
            is_edited: false,
            created_at: new Date(Date.now() - 1800000).toISOString(),
          },
        ];
        setMessages(initialMsgs);
        localStorage.setItem(LOCAL_MESSAGES_KEY + activeRoom.id, JSON.stringify(initialMsgs));
      }

      // Memories fallback
      const savedMem = localStorage.getItem(LOCAL_MEMORIES_KEY + activeRoom.id);
      if (savedMem) {
        try {
          setMemories(JSON.parse(savedMem));
        } catch {
          setMemories([]);
        }
      } else {
        const defaultMemories: Memory[] = [
          {
            id: 'mem-1',
            room_id: activeRoom.id,
            user_id: user?.id || 'me',
            image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop&q=80',
            caption: 'Our sunset walk holding hands 🌅',
            memory_date: '2024-02-14',
            created_at: new Date().toISOString(),
          },
          {
            id: 'mem-2',
            room_id: activeRoom.id,
            user_id: user?.id || 'me',
            image_url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&auto=format&fit=crop&q=80',
            caption: 'Coffee date laughs & sweet talks ☕✨',
            memory_date: '2024-03-20',
            created_at: new Date().toISOString(),
          },
        ];
        setMemories(defaultMemories);
        localStorage.setItem(LOCAL_MEMORIES_KEY + activeRoom.id, JSON.stringify(defaultMemories));
      }

      // Simulated partner
      setPartner({
        id: 'partner-id',
        name: proposalConfig.recipientName || 'My Sweetheart',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'Falling in love more each day 💖',
        status_message: 'Always in my heart 🌹',
        is_online: true,
        last_seen: new Date().toISOString(),
      });

      setIsLoadingMessages(false);
    }
  }, [activeRoom, user]);

  // Save messages to local store when in demo mode
  useEffect(() => {
    if (!isSupabaseConfigured && activeRoom && messages.length > 0) {
      localStorage.setItem(LOCAL_MESSAGES_KEY + activeRoom.id, JSON.stringify(messages));
    }
  }, [messages, activeRoom]);

  // Create a new room
  const createRoom = async (name = 'Our Secret Corner 💕', passcode?: string): Promise<Room> => {
    const inviteCode = 'love-' + Math.random().toString(36).substring(2, 7) + '-' + Math.floor(100 + Math.random() * 900);

    if (isSupabaseConfigured && user) {
      const { data: newRoom, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name,
          invite_code: inviteCode,
          passcode: passcode || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (roomError || !newRoom) throw roomError || new Error('Failed to create room');

      await supabase.from('room_members').insert({
        room_id: newRoom.id,
        user_id: user.id,
        role: 'owner',
      });

      setActiveRoom(newRoom as Room);
      return newRoom as Room;
    } else {
      const localRoom: Room = {
        id: 'room-' + Math.random().toString(36).substring(2, 9),
        name,
        invite_code: inviteCode,
        passcode: passcode || null,
        created_by: user?.id || 'demo-user',
        created_at: new Date().toISOString(),
      };
      setActiveRoom(localRoom);
      return localRoom;
    }
  };

  // Join a room by invite code
  const joinRoom = async (inviteCode: string, passcode?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanCode = inviteCode.trim().toLowerCase();

    if (isSupabaseConfigured && user) {
      const { data: foundRoom, error } = await supabase
        .from('rooms')
        .select('*')
        .ilike('invite_code', cleanCode)
        .maybeSingle();

      if (error || !foundRoom) {
        return { success: false, error: 'Invite link or code not found. Please double check the code!' };
      }

      if (foundRoom.passcode && foundRoom.passcode !== passcode) {
        return { success: false, error: 'Incorrect secret room passcode.' };
      }

      // Add user to room_members
      await supabase
        .from('room_members')
        .insert({
          room_id: foundRoom.id,
          user_id: user.id,
          role: 'member',
        })
        .select();

      setActiveRoom(foundRoom as Room);
      return { success: true };
    } else {
      // Local/Demo Mode join
      const localRoom: Room = {
        id: 'room-' + cleanCode,
        name: 'Our Secret Space 💕',
        invite_code: cleanCode,
        passcode: passcode || null,
        created_by: 'host-user',
        created_at: new Date().toISOString(),
      };
      setActiveRoom(localRoom);
      return { success: true };
    }
  };

  // Send a message
  const sendMessage = async (content: string, type: MessageType = 'text', mediaUrl?: string, replyToId?: string) => {
    if (!activeRoom || !user) return;

    const newMsg: Message = {
      id: 'msg-' + Math.random().toString(36).substring(2, 10),
      room_id: activeRoom.id,
      sender_id: user.id,
      content: content.trim(),
      type,
      media_url: mediaUrl || null,
      reply_to_id: replyToId || null,
      status: 'sent',
      is_edited: false,
      created_at: new Date().toISOString(),
      reactions: [],
      sender_profile: user,
    };

    // Optimistically append message
    setMessages((prev) => [...prev, newMsg]);
    sounds.playMessageSent();
    sounds.vibrate(40);

    // Broadcast to other tabs/windows
    broadcastChannelRef.current?.postMessage({
      type: 'NEW_MESSAGE',
      payload: newMsg,
    });

    if (isSupabaseConfigured) {
      await supabase.from('messages').insert({
        id: newMsg.id,
        room_id: activeRoom.id,
        sender_id: user.id,
        content: newMsg.content,
        type: newMsg.type,
        media_url: newMsg.media_url,
        reply_to_id: newMsg.reply_to_id,
        status: 'sent',
      });
    }
  };

  // Edit own message
  const editMessage = async (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, content: newContent, is_edited: true } : m))
    );

    broadcastChannelRef.current?.postMessage({
      type: 'MESSAGE_EDIT',
      payload: { id: messageId, content: newContent },
    });

    if (isSupabaseConfigured) {
      await supabase
        .from('messages')
        .update({ content: newContent, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', messageId);
    }
  };

  // Delete own message
  const deleteMessage = async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    broadcastChannelRef.current?.postMessage({
      type: 'MESSAGE_DELETE',
      payload: { id: messageId },
    });

    if (isSupabaseConfigured) {
      await supabase.from('messages').delete().eq('id', messageId);
    }
  };

  // Toggle emoji reaction
  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = m.reactions || [];
        const exists = currentReactions.find(
          (r) => r.user_id === user.id && r.emoji === emoji
        );
        let nextReactions: Reaction[];
        if (exists) {
          nextReactions = currentReactions.filter((r) => r !== exists);
        } else {
          nextReactions = [
            ...currentReactions,
            {
              id: 'react-' + Math.random().toString(36).substring(2, 8),
              message_id: messageId,
              user_id: user.id,
              emoji,
              created_at: new Date().toISOString(),
            },
          ];
        }
        return { ...m, reactions: nextReactions };
      })
    );

    sounds.vibrate(30);

    broadcastChannelRef.current?.postMessage({
      type: 'REACTION_TOGGLE',
      payload: { messageId, userId: user.id, emoji },
    });

    if (isSupabaseConfigured) {
      const { data: existing } = await supabase
        .from('reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existing) {
        await supabase.from('reactions').delete().eq('id', existing.id);
      } else {
        await supabase.from('reactions').insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });
      }
    }
  };

  // Send typing indicator
  const sendTyping = (isTyping: boolean) => {
    if (!user) return;

    broadcastChannelRef.current?.postMessage({
      type: 'TYPING',
      payload: { userId: user.id, isTyping },
    });

    if (isSupabaseConfigured && activeRoom) {
      supabase.channel(`room_${activeRoom.id}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, isTyping },
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      typingTimeoutRef.current = window.setTimeout(() => {
        sendTyping(false);
      }, 3000);
    }
  };

  // "Thinking of you" button trigger
  const sendThinkingOfYou = () => {
    setIsHeartStormActive(true);
    sounds.playHeartBurst();
    sounds.vibrate([100, 50, 100, 50, 150]);

    broadcastChannelRef.current?.postMessage({
      type: 'HEART_STORM',
      payload: { from: user?.name },
    });

    if (isSupabaseConfigured && activeRoom) {
      supabase.channel(`room_${activeRoom.id}`).send({
        type: 'broadcast',
        event: 'heart_storm',
        payload: { from: user?.name },
      });
    }

    sendMessage('I am thinking of you right now 💕✨', 'special_heart');
    setTimeout(() => setIsHeartStormActive(false), 4500);
  };

  // Add Memory to Gallery
  const addMemory = async (imageUrl: string, caption?: string, memoryDate?: string) => {
    if (!activeRoom || !user) return;

    const newMemory: Memory = {
      id: 'mem-' + Math.random().toString(36).substring(2, 9),
      room_id: activeRoom.id,
      user_id: user.id,
      image_url: imageUrl,
      caption: caption || null,
      memory_date: memoryDate || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    setMemories((prev) => [newMemory, ...prev]);

    broadcastChannelRef.current?.postMessage({
      type: 'NEW_MEMORY',
      payload: newMemory,
    });

    if (isSupabaseConfigured) {
      await supabase.from('memories').insert({
        id: newMemory.id,
        room_id: activeRoom.id,
        user_id: user.id,
        image_url: imageUrl,
        caption: newMemory.caption,
        memory_date: newMemory.memory_date,
      });
    } else {
      localStorage.setItem(
        LOCAL_MEMORIES_KEY + activeRoom.id,
        JSON.stringify([newMemory, ...memories])
      );
    }
  };

  // Delete Memory
  const deleteMemory = async (memoryId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));

    broadcastChannelRef.current?.postMessage({
      type: 'DELETE_MEMORY',
      payload: { id: memoryId },
    });

    if (isSupabaseConfigured) {
      await supabase.from('memories').delete().eq('id', memoryId);
    }
  };

  // Record proposal response
  const recordProposalResponse = async (answer: string) => {
    const inviteCode = activeRoom?.invite_code || 'default';
    if (isSupabaseConfigured) {
      await supabase.from('proposals').insert({
        invite_code: inviteCode,
        sender_id: user?.id || null,
        recipient_name: proposalConfig.recipientName,
        answer,
      });
    }
    localStorage.setItem('proposal_answered_' + inviteCode, answer);
  };

  return (
    <ChatContext.Provider
      value={{
        activeRoom,
        partner,
        messages,
        memories,
        isLoadingMessages,
        isPartnerTyping,
        isHeartStormActive,
        wallpaperTheme,
        daysTogether,
        currentLoveQuote,
        createRoom,
        joinRoom,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        sendTyping,
        sendThinkingOfYou,
        addMemory,
        deleteMemory,
        setWallpaperTheme,
        nextLoveQuote,
        recordProposalResponse,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

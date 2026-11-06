import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../../types/database';
import { Check, CheckCheck, Play, Pause, Reply, Smile, MoreVertical, Edit2, Trash2, Heart } from 'lucide-react';
import { sounds } from '../../lib/audio';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onImageClick?: (url: string) => void;
}

const QUICK_REACTIONS = ['❤️', '💖', '🥰', '😘', '🥺', '🔥'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onImageClick,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTapRef = useRef<number>(0);

  // Format time (e.g. 10:45 PM)
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Quick double tap to heart ❤️
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onReact(message.id, '❤️');
      sounds.playHeartBurst();
    }
    lastTapRef.current = now;
  };

  // Audio play/pause handler
  const toggleAudio = () => {
    if (!audioRef.current && message.media_url) {
      audioRef.current = new Audio(message.media_url);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
      }
    }
  };

  // Status icon: single check, double check, or pink seen check
  const renderStatus = () => {
    if (!isMe) return null;
    if (message.status === 'seen') {
      return (
        <span title="Seen">
          <CheckCheck className="w-3.5 h-3.5 text-pink-200 stroke-[2.5]" />
        </span>
      );
    } else if (message.status === 'delivered') {
      return (
        <span title="Delivered">
          <CheckCheck className="w-3.5 h-3.5 text-white/70" />
        </span>
      );
    }
    return (
      <span title="Sent">
        <Check className="w-3.5 h-3.5 text-white/60" />
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`group relative flex w-full flex-col ${isMe ? 'items-end' : 'items-start'} my-1 px-3`}
    >
      {/* Contextual Action Bar on Hover/Tap */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className={`absolute -top-9 z-30 flex items-center gap-1 rounded-full border border-pink-200 bg-white/95 px-2 py-1 shadow-md backdrop-blur-md dark:border-romantic-darkBorder dark:bg-romantic-darkCard ${
              isMe ? 'right-4' : 'left-4'
            }`}
          >
            {/* Quick Emojis */}
            {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(message.id, emoji);
                  setShowActions(false);
                }}
                className="text-sm p-1 hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}

            <button
              onClick={() => {
                setShowReactionPicker(!showReactionPicker);
              }}
              className="p-1 text-slate-500 hover:text-romantic-hot"
              title="More reactions"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                onReply(message);
                setShowActions(false);
              }}
              className="p-1 text-slate-500 hover:text-romantic-hot"
              title="Reply"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>

            {isMe && (
              <>
                <button
                  onClick={() => {
                    onEdit(message);
                    setShowActions(false);
                  }}
                  className="p-1 text-slate-500 hover:text-romantic-hot"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onDelete(message.id);
                    setShowActions(false);
                  }}
                  className="p-1 text-slate-500 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bubble Container */}
      <div
        onClick={handleDoubleTap}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => {
          setShowActions(false);
          setShowReactionPicker(false);
        }}
        className={`relative max-w-[82%] sm:max-w-[70%] rounded-2xl p-3 shadow-sm select-text transition-all ${
          isMe
            ? 'rounded-tr-none bg-gradient-to-r from-romantic-hot via-[#FF5C95] to-[#FF4D8D] text-white shadow-pink-200/50'
            : 'rounded-tl-none border border-pink-100/80 bg-white/90 text-slate-800 shadow-glass dark:border-romantic-darkBorder dark:bg-romantic-darkCard dark:text-pink-50'
        }`}
      >
        {/* Reply Quote Banner */}
        {message.reply_to && (
          <div
            className={`mb-2 rounded-lg p-2 text-xs border-l-4 ${
              isMe
                ? 'bg-white/20 border-white text-white/90'
                : 'bg-pink-50 dark:bg-romantic-darkBg border-romantic-hot text-slate-600 dark:text-slate-300'
            }`}
          >
            <p className="font-bold text-[10px] uppercase opacity-75">Replying</p>
            <p className="truncate line-clamp-1">{message.reply_to.content}</p>
          </div>
        )}

        {/* Message Content by Type */}
        {message.type === 'text' && (
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        {message.type === 'image' && message.media_url && (
          <div className="overflow-hidden rounded-xl">
            <img
              src={message.media_url}
              alt="Shared moment"
              onClick={() => onImageClick && onImageClick(message.media_url!)}
              className="max-h-72 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity rounded-xl"
            />
            {message.content && (
              <p className="mt-2 text-[14px] leading-relaxed break-words">{message.content}</p>
            )}
          </div>
        )}

        {message.type === 'audio' && (
          <div className="flex items-center gap-3 py-1 min-w-[200px]">
            <button
              onClick={toggleAudio}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95 ${
                isMe ? 'bg-white text-romantic-hot' : 'bg-romantic-hot text-white shadow-glow'
              }`}
            >
              {isPlayingAudio ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-1 h-6">
                {[40, 70, 30, 90, 60, 80, 45, 95, 30, 60].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full transition-all ${
                      isPlayingAudio ? 'animate-pulse' : ''
                    } ${isMe ? 'bg-white/80' : 'bg-romantic-hot/70'}`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-semibold opacity-80">Voice note 🎙️</span>
            </div>
          </div>
        )}

        {message.type === 'sticker' && message.media_url && (
          <div className="p-1">
            <img
              src={message.media_url}
              alt="Sticker"
              className="max-h-40 max-w-40 object-contain rounded-lg"
            />
          </div>
        )}

        {message.type === 'special_heart' && (
          <div className="flex flex-col items-center py-2 text-center">
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="text-4xl filter drop-shadow-md"
            >
              💖
            </motion.div>
            <p className="mt-2 text-sm font-bold tracking-wide">
              {message.content}
            </p>
          </div>
        )}

        {/* Footer info: Timestamp + Status ticks + Edited indicator */}
        <div
          className={`mt-1.5 flex items-center justify-end gap-1.5 text-[11px] font-medium ${
            isMe ? 'text-white/85' : 'text-slate-400 dark:text-slate-400'
          }`}
        >
          {message.is_edited && <span className="italic text-[10px] opacity-75">edited</span>}
          <span>{formatTime(message.created_at)}</span>
          {renderStatus()}
        </div>
      </div>

      {/* Reactions Display Row */}
      {message.reactions && message.reactions.length > 0 && (
        <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'} px-1`}>
          {Object.entries(
            message.reactions.reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="flex items-center gap-1 rounded-full border border-pink-200/80 bg-white/90 px-2 py-0.5 text-xs shadow-sm hover:scale-110 active:scale-95 transition-all dark:border-romantic-darkBorder dark:bg-romantic-darkCard"
            >
              <span>{emoji}</span>
              {count > 1 && <span className="text-[10px] font-bold text-slate-600">{count}</span>}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

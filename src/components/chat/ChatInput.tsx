import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Mic, Smile, Heart, X, Square } from 'lucide-react';
import { EmojiStickerPicker } from './EmojiStickerPicker';
import { compressImage } from '../../lib/imageCompression';
import { Message, MessageType } from '../../types/database';
import { sounds } from '../../lib/audio';

interface ChatInputProps {
  onSendMessage: (content: string, type?: MessageType, mediaUrl?: string, replyToId?: string) => Promise<void>;
  onSendTyping: (isTyping: boolean) => void;
  onSendThinkingOfYou: () => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  editingMessage: Message | null;
  onSaveEdit: (newContent: string) => void;
  onCancelEdit: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendTyping,
  onSendThinkingOfYou,
  replyingTo,
  onCancelReply,
  editingMessage,
  onSaveEdit,
  onCancelEdit,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Sync editing text
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onSendTyping(true);
  };

  const handleSend = async () => {
    if (editingMessage) {
      if (text.trim()) {
        onSaveEdit(text.trim());
      }
      return;
    }

    if (!text.trim()) return;

    const content = text;
    setText('');
    onSendTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(content, 'text', undefined, replyingTo?.id);
    if (replyingTo) onCancelReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image Upload handler
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress client side
      const { dataUrl } = await compressImage(file, 1280, 1280, 0.82);
      await onSendMessage('', 'image', dataUrl, replyingTo?.id);
      if (replyingTo) onCancelReply();
    } catch {
      alert('Could not upload image, please try again.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Voice Note Recording
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Microphone recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await onSendMessage('Voice Note', 'audio', base64Audio, replyingTo?.id);
          if (replyingTo) onCancelReply();
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      sounds.vibrate(50);

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioChunksRef.current = [];
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  return (
    <div className="relative w-full border-t border-pink-100/80 bg-white/80 p-2 pb-[max(12px,env(safe-area-inset-bottom))] shadow-lg backdrop-blur-xl dark:border-romantic-darkBorder dark:bg-romantic-darkCard">
      {/* Emoji & Sticker Picker Popover */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-full left-2 mb-2 z-50"
          >
            <EmojiStickerPicker
              onSelectEmoji={(emoji) => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
                textareaRef.current?.focus();
              }}
              onSelectSticker={(url) => {
                onSendMessage('Sticker', 'sticker', url, replyingTo?.id);
                setShowEmojiPicker(false);
                if (replyingTo) onCancelReply();
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replying Banner */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between rounded-xl bg-pink-50 px-3 py-1.5 mb-2 text-xs text-romantic-berry dark:bg-romantic-darkBg dark:text-pink-200"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold">Replying to:</span>
              <span className="truncate italic opacity-80">{replyingTo.content || 'Media'}</span>
            </div>
            <button onClick={onCancelReply} className="p-1 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editing Banner */}
      <AnimatePresence>
        {editingMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-1.5 mb-2 text-xs text-amber-900"
          >
            <span className="font-bold">Editing message...</span>
            <button onClick={onCancelEdit} className="p-1 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording State Overlay */}
      {isRecording ? (
        <div className="flex items-center justify-between px-3 py-2 bg-pink-100/90 rounded-2xl dark:bg-romantic-darkBg">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              Recording Voice Note ({recordingSeconds}s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-1 rounded-full bg-romantic-hot px-4 py-1 text-xs font-bold text-white shadow-glow"
            >
              <Square className="h-3 w-3 fill-white" />
              <span>Send</span>
            </button>
          </div>
        </div>
      ) : (
        /* Regular Input Controls */
        <div className="flex items-end gap-1.5">
          {/* Thinking of you heart burst button */}
          <button
            onClick={onSendThinkingOfYou}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-romantic-hot hover:bg-pink-100/80 active:scale-95 transition-all dark:hover:bg-romantic-darkBorder"
            title="Thinking of you 💕"
          >
            <Heart className="h-6 w-6 fill-romantic-hot animate-pulse" />
          </button>

          {/* Emoji & Sticker button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-slate-500 hover:text-romantic-hot hover:bg-pink-100/60 active:scale-95 transition-all dark:text-slate-400"
            title="Emojis & Stickers"
          >
            <Smile className="h-6 w-6" />
          </button>

          {/* Attach image file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-slate-500 hover:text-romantic-hot hover:bg-pink-100/60 active:scale-95 transition-all dark:text-slate-400"
            title="Attach Photo"
          >
            <Image className="h-6 w-6" />
          </button>

          {/* Textarea Input */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a sweet message... 💕"
              className="w-full resize-none rounded-2xl border border-pink-200/80 bg-white/95 px-4 py-2.5 text-sm text-slate-800 placeholder-pink-300 focus:border-romantic-hot focus:outline-none focus:ring-2 focus:ring-pink-300/40 dark:border-romantic-darkBorder dark:bg-romantic-darkBg dark:text-pink-50 dark:placeholder-pink-800 custom-scrollbar"
            />
          </div>

          {/* Send / Mic Button */}
          {text.trim() || editingMessage ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-romantic-hot to-romantic-rose text-white shadow-glow"
              title="Send"
            >
              <Send className="h-5 w-5 ml-0.5" />
            </motion.button>
          ) : (
            <button
              onClick={startRecording}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-slate-500 hover:text-romantic-hot hover:bg-pink-100/60 active:scale-95 transition-all dark:text-slate-400"
              title="Record Voice Note"
            >
              <Mic className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

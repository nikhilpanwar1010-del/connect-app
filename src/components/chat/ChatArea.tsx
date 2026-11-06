import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { Message } from '../../types/database';
import { ArrowDown, Heart, Sparkles } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  currentUserId: string;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentUserId,
  onReply,
  onReact,
  onEdit,
  onDelete,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-1 sm:px-4 py-4 custom-scrollbar"
    >
      {/* Empty State */}
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-romantic-hot dark:bg-romantic-darkCard">
            <Heart className="h-8 w-8 fill-romantic-hot animate-pulse" />
          </div>
          <h3 className="mt-4 font-romantic text-3xl font-bold text-romantic-berry">
            Our Secret World Begins Here 💕
          </h3>
          <p className="mt-2 max-w-xs text-xs font-medium text-slate-500 dark:text-slate-400">
            No messages yet. Send a sweet text, voice note, or photo to start our story!
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-1 pb-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={msg.sender_id === currentUserId}
              onReply={onReply}
              onReact={onReact}
              onEdit={onEdit}
              onDelete={onDelete}
              onImageClick={(url) => setLightboxImage(url)}
            />
          ))}
        </div>
      )}

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-20 right-5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-romantic-hot text-white shadow-glow hover:opacity-90 active:scale-95 transition-all"
          title="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}

      {/* Lightbox Photo Preview Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <img
            src={lightboxImage}
            alt="Fullscreen view"
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

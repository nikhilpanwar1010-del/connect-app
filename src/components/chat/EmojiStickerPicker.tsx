import React, { useState } from 'react';
import { Search, Heart, Smile, Sparkles, Coffee, Gift } from 'lucide-react';

interface EmojiStickerPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker?: (stickerUrl: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = {
  hearts: {
    name: 'Love & Hearts',
    icon: Heart,
    emojis: ['💖', '💕', '💗', '💓', '💞', '💘', '💝', '💟', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💋', '💌', '💐', '🌹', '🥀', '🌺', '🌸', '🌷'],
  },
  smileys: {
    name: 'Smileys & Love',
    icon: Smile,
    emojis: ['🥰', '😍', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🫢', '🤫', '🥺', '🥹', '😊', '😇', '🙂', '😌', '🤤', '😴', '😏', '🥳'],
  },
  gestures: {
    name: 'Gestures',
    icon: Sparkles,
    emojis: ['🫶', '🫰', '👐', '🙌', '👏', '🤝', '👍', '✌️', '🤞', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '✋', '🤚', '🖐️', '🫂'],
  },
  sparkles: {
    name: 'Sweet & Fun',
    icon: Gift,
    emojis: ['✨', '⭐', '🌟', '💫', '🔥', '🎉', '🎊', '🎀', '🎁', '🎈', '💍', '💎', '👑', '🧸', '🕊️', '🦋', '🌙', '☁️', '🌈', '🍭', '🍫', '🍰', '🧁', '🍦', '🍓'],
  },
};

const STICKERS = [
  { id: 'stk-1', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&auto=format&fit=crop&q=80', name: 'Holding Hands' },
  { id: 'stk-2', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=200&auto=format&fit=crop&q=80', name: 'Heart Latte' },
  { id: 'stk-3', url: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=200&auto=format&fit=crop&q=80', name: 'Pink Rose Bouquet' },
  { id: 'stk-4', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80', name: 'Starry Sky' },
  { id: 'stk-5', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&auto=format&fit=crop&q=80', name: 'Pink Petals' },
  { id: 'stk-6', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80', name: 'Teddy Bear' },
];

export const EmojiStickerPicker: React.FC<EmojiStickerPickerProps> = ({
  onSelectEmoji,
  onSelectSticker,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'emojis' | 'stickers'>('emojis');
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('hearts');
  const [searchQuery, setSearchQuery] = useState('');

  const currentEmojis = EMOJI_CATEGORIES[activeCategory]?.emojis || [];

  return (
    <div className="flex flex-col w-full max-w-sm h-80 rounded-romantic-lg bg-white/95 dark:bg-romantic-darkCard shadow-2xl border border-pink-200/80 dark:border-romantic-darkBorder overflow-hidden backdrop-blur-xl">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-pink-100 dark:border-romantic-darkBorder px-3 py-2 bg-pink-50/60 dark:bg-romantic-darkBg/60">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('emojis')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
              activeTab === 'emojis'
                ? 'bg-romantic-hot text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-pink-100 dark:hover:bg-romantic-darkBorder'
            }`}
          >
            Emojis 💕
          </button>
          <button
            onClick={() => setActiveTab('stickers')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
              activeTab === 'stickers'
                ? 'bg-romantic-hot text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-pink-100 dark:hover:bg-romantic-darkBorder'
            }`}
          >
            Stickers 💌
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          ✕
        </button>
      </div>

      {activeTab === 'emojis' ? (
        <>
          {/* Category Bar */}
          <div className="flex items-center justify-around border-b border-pink-100/60 dark:border-romantic-darkBorder py-1.5 px-2 bg-white/50 dark:bg-romantic-darkCard/50">
            {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((key) => {
              const cat = EMOJI_CATEGORIES[key];
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`p-1.5 rounded-full transition-colors ${
                    activeCategory === key
                      ? 'bg-pink-100 text-romantic-hot dark:bg-pink-900/40'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={cat.name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Emoji Grid */}
          <div className="flex-1 p-3 overflow-y-auto custom-scrollbar grid grid-cols-6 gap-2 text-2xl">
            {currentEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectEmoji(emoji);
                }}
                className="flex items-center justify-center p-2 rounded-xl hover:bg-pink-100/80 dark:hover:bg-romantic-darkBorder transition-transform active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      ) : (
        /* Stickers Grid */
        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar grid grid-cols-3 gap-2">
          {STICKERS.map((stk) => (
            <button
              key={stk.id}
              onClick={() => {
                if (onSelectSticker) onSelectSticker(stk.url);
                onClose();
              }}
              className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-pink-100 hover:border-romantic-hot transition-all p-1"
            >
              <img
                src={stk.url}
                alt={stk.name}
                className="w-full h-16 object-cover rounded-lg group-hover:scale-105 transition-transform"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full text-center mt-1">
                {stk.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Moon, Sun, Heart } from 'lucide-react';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const THEMES = [
  { id: 'pink-blossom', name: 'Pink Blossom', preview: 'bg-gradient-to-r from-[#FFF0F6] to-[#FFE4EE]', border: 'border-pink-400' },
  { id: 'sunset-blush', name: 'Sunset Blush', preview: 'bg-gradient-to-r from-[#FFF0F6] via-[#FFEBE5] to-[#FFD5CC]', border: 'border-rose-400' },
  { id: 'midnight-rose', name: 'Midnight Rose', preview: 'bg-[#120710]', border: 'border-pink-600' },
  { id: 'lavender-dream', name: 'Lavender Dream', preview: 'bg-gradient-to-r from-[#FFF0F6] via-[#F4E8FF] to-[#EBD5FF]', border: 'border-purple-400' },
  { id: 'peaches-cream', name: 'Peaches & Cream', preview: 'bg-gradient-to-r from-[#FFF5F0] to-[#FFE8DF]', border: 'border-orange-300' },
];

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  isDarkMode,
  onToggleDarkMode,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm rounded-romantic-xl border border-pink-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-romantic-darkBorder dark:bg-romantic-darkCard"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-romantic-hot" />
            <h3 className="font-romantic text-2xl font-bold text-romantic-berry">
              Wallpaper & Themes 🌸
            </h3>
          </div>

          {/* Theme Palette Cards */}
          <div className="space-y-2 mb-5">
            {THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => onSelectTheme(th.id)}
                className={`flex w-full items-center justify-between p-3 rounded-xl border transition-all ${
                  currentTheme === th.id
                    ? `${th.border} ring-2 ring-pink-300 bg-pink-50/50 dark:bg-romantic-darkBg`
                    : 'border-pink-100 hover:border-pink-200 dark:border-romantic-darkBorder'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full shadow-inner ${th.preview}`} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-pink-100">{th.name}</span>
                </div>
                {currentTheme === th.id && (
                  <Heart className="h-4 w-4 fill-romantic-hot text-romantic-hot" />
                )}
              </button>
            ))}
          </div>

          {/* Dark Mode Midnight Rose Switch */}
          <div className="border-t border-pink-100 pt-4 flex items-center justify-between dark:border-romantic-darkBorder">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-4 w-4 text-pink-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
              <span className="text-xs font-bold text-slate-700 dark:text-pink-100">
                Midnight Rose (Dark Mode)
              </span>
            </div>

            <button
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-romantic-hot' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

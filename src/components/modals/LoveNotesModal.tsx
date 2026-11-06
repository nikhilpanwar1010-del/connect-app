import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart } from 'lucide-react';
import { sounds } from '../../lib/audio';

interface LoveNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuote: string;
  onNextQuote: () => void;
}

export const LoveNotesModal: React.FC<LoveNotesModalProps> = ({
  isOpen,
  onClose,
  currentQuote,
  onNextQuote,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md rounded-romantic-xl border border-pink-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-romantic-darkBorder dark:bg-romantic-darkCard text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/40 text-romantic-hot">
            <Heart className="h-7 w-7 fill-romantic-hot" />
          </div>

          <span className="font-romantic text-3xl font-bold text-romantic-berry">
            Daily Love Note 💌
          </span>

          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-6 rounded-2xl border border-pink-200/60 bg-gradient-to-br from-pink-50/80 to-rose-50/60 p-5 shadow-sm dark:border-romantic-darkBorder dark:bg-romantic-darkBg/60"
          >
            <p className="font-romantic text-2xl font-semibold text-romantic-deep leading-relaxed">
              "{currentQuote}"
            </p>
          </motion.div>

          <button
            onClick={() => {
              onNextQuote();
              sounds.playMessageSent();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-romantic-hot to-romantic-berry py-3 text-sm font-bold text-white shadow-glow hover:opacity-95 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Draw Next Note ✨</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

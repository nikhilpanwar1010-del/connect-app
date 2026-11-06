import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingHeartStormProps {
  isActive: boolean;
}

interface FloatingHeart {
  id: number;
  left: number;
  scale: number;
  duration: number;
  delay: number;
  emoji: string;
}

const EMOJIS = ['💖', '💕', '💗', '💓', '💝', '🌹', '✨', '🥰', '😘'];

export const FloatingHeartStorm: React.FC<FloatingHeartStormProps> = ({ isActive }) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    if (isActive) {
      const newHearts: FloatingHeart[] = [];
      const count = 35;
      for (let i = 0; i < count; i++) {
        newHearts.push({
          id: i,
          left: Math.random() * 95, // 0 to 95vw
          scale: 0.8 + Math.random() * 1.4,
          duration: 2.5 + Math.random() * 2,
          delay: Math.random() * 1.5,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        });
      }
      setHearts(newHearts);
    } else {
      setHearts([]);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {/* Subtle Pink Screen Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-pink-400 via-rose-300 to-transparent blur-xl"
          />

          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ y: '105vh', opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{
                y: '-15vh',
                opacity: [0, 1, 1, 0],
                scale: h.scale,
                rotate: 20,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: h.duration,
                delay: h.delay,
                ease: 'easeOut',
              }}
              style={{ left: `${h.left}%` }}
              className="absolute text-2xl sm:text-3xl filter drop-shadow-md"
            >
              {h.emoji}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

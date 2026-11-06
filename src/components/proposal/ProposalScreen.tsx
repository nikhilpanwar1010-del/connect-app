import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { HeartRainCanvas } from './HeartRainCanvas';
import { proposalConfig } from '../../config/proposal';
import { sounds } from '../../lib/audio';
import { Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';

interface ProposalScreenProps {
  onComplete: () => void;
  inviteCode?: string;
}

export const ProposalScreen: React.FC<ProposalScreenProps> = ({ onComplete, inviteCode }) => {
  // Typewriter state
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Question & runaway state
  const [yesScale, setYesScale] = useState(1);
  const [noScale, setNoScale] = useState(1);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [runawayMessage, setRunawayMessage] = useState<string | null>(null);
  const [evasionCount, setEvasionCount] = useState(0);

  // Celebration state
  const [isCelebrated, setIsCelebrated] = useState(false);

  // Audio state
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [audioStarted, setAudioStarted] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Start background romantic music on first interaction
  const handleUserInteraction = () => {
    if (!audioStarted && !isMuted) {
      sounds.startRomanticMusic();
      setAudioStarted(true);
    }
  };

  const toggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted && !audioStarted) {
      sounds.startRomanticMusic();
      setAudioStarted(true);
    }
  };

  // Typewriter effect for intro lines
  useEffect(() => {
    if (currentLineIndex >= proposalConfig.introLines.length) {
      setIsTypingDone(true);
      return;
    }

    const targetLine = proposalConfig.introLines[currentLineIndex];
    let charIdx = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (charIdx < targetLine.length) {
        setDisplayedText(targetLine.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (currentLineIndex < proposalConfig.introLines.length - 1) {
            setCurrentLineIndex((prev) => prev + 1);
          } else {
            setIsTypingDone(true);
          }
        }, 1200);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [currentLineIndex]);

  // Runaway NO button behavior
  const handleNoEvade = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    handleUserInteraction();

    sounds.vibrate(30);

    const nextCount = evasionCount + 1;
    setEvasionCount(nextCount);

    // Pick playful response
    const msg = proposalConfig.runawayResponses[(nextCount - 1) % proposalConfig.runawayResponses.length];
    setRunawayMessage(msg);

    // Increase YES size, shrink NO button
    setYesScale((prev) => Math.min(prev + 0.18, 2.2));
    setNoScale((prev) => Math.max(prev - 0.1, 0.5));

    // Jump to random safe offset
    const maxOffset = window.innerWidth < 640 ? 120 : 180;
    const randomX = (Math.random() - 0.5) * maxOffset * 2;
    const randomY = (Math.random() - 0.5) * maxOffset * 1.5;
    setNoPosition({ x: randomX, y: randomY });
  };

  // YES celebration handler
  const handleYes = () => {
    handleUserInteraction();
    setIsCelebrated(true);
    sounds.playProposalCelebration();
    sounds.vibrate([100, 50, 100, 50, 200]);

    // Save answer to localStorage and/or Supabase
    const key = 'proposal_answered_' + (inviteCode || 'default');
    localStorage.setItem(key, 'YES');

    // Trigger full-screen romantic confetti explosions
    const duration = 4.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: ['#FF4D8D', '#FFB3CF', '#C2185B', '#FFFFFF', '#FFD700', '#FF7597'],
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: ['#FF4D8D', '#FFB3CF', '#C2185B', '#FFFFFF', '#FFD700', '#FF7597'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleUserInteraction}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF0F6] via-[#FFE4EE] to-[#FFD1DC] p-4 text-center font-sans select-none"
    >
      {/* 60fps GPU Accelerated Heart Rain Canvas */}
      <HeartRainCanvas />

      {/* Floating Audio Mute/Unmute Pill */}
      <div className="fixed top-5 right-5 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="flex items-center gap-2 rounded-full border border-pink-200/60 bg-white/80 px-4 py-2 text-xs font-semibold text-romantic-berry shadow-sm backdrop-blur-md transition-all active:scale-95 hover:bg-white"
          title={isMuted ? 'Unmute romantic music' : 'Mute music'}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-romantic-hot animate-pulse" />}
          <span>{isMuted ? 'Sound Off' : 'Romantic Music'}</span>
        </button>
      </div>

      {/* Main Glassmorphism Presentation Container */}
      <div className="relative z-10 mx-auto w-full max-w-lg px-2">
        <AnimatePresence mode="wait">
          {!isCelebrated ? (
            <motion.div
              key="question-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-romantic-xl border border-white/60 bg-white/70 p-6 shadow-glow backdrop-blur-xl sm:p-9"
            >
              {/* Soft decorative ambient glow */}
              <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-pink-300/30 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-rose-400/25 blur-2xl pointer-events-none" />

              {/* Romantic Sparkle Icon */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-romantic-hot to-romantic-rose text-white shadow-glow"
              >
                <Heart className="h-7 w-7 fill-white" />
              </motion.div>

              {/* Personal Typewriter Message Box */}
              <div className="min-h-[110px] flex flex-col items-center justify-center mb-6">
                <p className="font-romantic text-3xl font-bold text-romantic-berry sm:text-4xl">
                  {proposalConfig.introLines[0]}
                </p>

                {currentLineIndex >= 1 && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-base font-medium text-slate-600 sm:text-lg"
                  >
                    {currentLineIndex === 1 ? displayedText : proposalConfig.introLines[1]}
                  </motion.p>
                )}

                {currentLineIndex >= 2 && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm italic text-pink-700/80 sm:text-base font-light px-2"
                  >
                    {currentLineIndex === 2 ? displayedText : proposalConfig.introLines[2]}
                  </motion.p>
                )}
              </div>

              {/* The Big Question */}
              <AnimatePresence>
                {isTypingDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-4 pt-4 border-t border-pink-100/80"
                  >
                    <h1 className="font-romantic text-4xl sm:text-5xl font-bold text-romantic-hot tracking-wide drop-shadow-sm mb-6">
                      {proposalConfig.questionText}
                    </h1>

                    {/* Playful Evasion Warning Message */}
                    {runawayMessage && (
                      <motion.div
                        key={runawayMessage}
                        initial={{ opacity: 0, y: -8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mb-5 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-xs font-bold text-romantic-deep shadow-sm"
                      >
                        {runawayMessage}
                      </motion.div>
                    )}

                    {/* Action Buttons: YES and Playful Runaway NO */}
                    <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 min-h-[90px]">
                      {/* Big Glowing YES Button */}
                      <motion.button
                        onClick={handleYes}
                        style={{ scale: yesScale }}
                        whileHover={{ scale: yesScale * 1.05 }}
                        whileTap={{ scale: yesScale * 0.95 }}
                        className="relative z-20 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-romantic-hot via-[#FF5E98] to-romantic-berry px-8 py-3.5 text-lg font-bold text-white shadow-glow transition-transform"
                      >
                        <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: '4s' }} />
                        <span>{proposalConfig.yesButtonText}</span>
                      </motion.button>

                      {/* Playful Evasive NO Button */}
                      <motion.button
                        animate={{ x: noPosition.x, y: noPosition.y, scale: noScale }}
                        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                        onMouseEnter={handleNoEvade}
                        onTouchStart={handleNoEvade}
                        onClick={handleNoEvade}
                        className="rounded-full border border-pink-200/90 bg-white/80 px-6 py-2.5 text-sm font-semibold text-slate-500 shadow-sm backdrop-blur-md hover:bg-pink-50"
                      >
                        {proposalConfig.noButtonText}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Celebration Screen on YES */
            <motion.div
              key="celebration-card"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
              className="relative overflow-hidden rounded-romantic-xl border border-white/80 bg-white/85 p-8 shadow-glow-lg backdrop-blur-2xl sm:p-10"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-glow-lg">
                <Heart className="h-10 w-10 fill-white animate-bounce" />
              </div>

              <span className="inline-block rounded-full bg-pink-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-romantic-hot">
                She Said Yes! 🎉
              </span>

              <h2 className="mt-4 font-romantic text-4xl sm:text-5xl font-bold text-romantic-berry leading-tight">
                {proposalConfig.celebrationTitle}
              </h2>

              <p className="mt-4 text-base sm:text-lg font-medium text-slate-700">
                {proposalConfig.celebrationSubtitle}
              </p>

              {/* Start our story button */}
              <motion.button
                onClick={onComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-romantic-hot to-romantic-berry px-8 py-4 text-lg font-bold text-white shadow-glow"
              >
                <span>{proposalConfig.celebrationButtonText}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

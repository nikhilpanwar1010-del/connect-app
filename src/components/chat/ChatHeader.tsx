import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Image as ImageIcon,
  Palette,
  QrCode,
  Volume2,
  VolumeX,
  MoreVertical,
  LogOut,
  Sparkles,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { Profile, Room } from '../../types/database';
import { sounds } from '../../lib/audio';

interface ChatHeaderProps {
  partner: Profile | null;
  room: Room | null;
  daysTogether: number;
  isPartnerTyping: boolean;
  onOpenInvite: () => void;
  onOpenMemories: () => void;
  onOpenThemes: () => void;
  onOpenLoveNotes: () => void;
  onTriggerThinkingOfYou: () => void;
  onReplayProposal: () => void;
  onSignOut: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  partner,
  room,
  daysTogether,
  isPartnerTyping,
  onOpenInvite,
  onOpenMemories,
  onOpenThemes,
  onOpenLoveNotes,
  onTriggerThinkingOfYou,
  onReplayProposal,
  onSignOut,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="relative z-20 flex h-16 w-full items-center justify-between border-b border-pink-100/80 bg-white/80 px-3 sm:px-5 backdrop-blur-xl dark:border-romantic-darkBorder dark:bg-romantic-darkCard">
      {/* Left: Partner info & Avatar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-romantic-rose shadow-sm">
            <img
              src={
                partner?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt="Partner"
              className="h-full w-full object-cover"
            />
          </div>
          {/* Online Pulsing Indicator */}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
        </div>

        <div className="flex flex-col">
          <h2 className="font-bold text-sm text-slate-800 dark:text-pink-100 leading-tight">
            {partner?.name || 'My Sweetheart'}
          </h2>

          <div className="flex items-center gap-1.5 text-[11px]">
            {isPartnerTyping ? (
              <span className="flex items-center gap-1 font-semibold text-romantic-hot animate-pulse">
                <span>typing</span>
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-romantic-hot animate-bounce" />
                  <span className="h-1 w-1 rounded-full bg-romantic-hot animate-bounce delay-100" />
                  <span className="h-1 w-1 rounded-full bg-romantic-hot animate-bounce delay-200" />
                </span>
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-400">
                {partner?.status_message || 'Online & thinking of you 💕'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Days Together Badge (Desktop / Tablet) */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenLoveNotes}
          className="flex items-center gap-1.5 rounded-full border border-pink-200/60 bg-pink-50/80 px-3.5 py-1 text-xs font-bold text-romantic-berry shadow-sm hover:bg-pink-100 transition-colors dark:border-romantic-darkBorder dark:bg-romantic-darkBg dark:text-pink-200"
        >
          <Calendar className="h-3.5 w-3.5 text-romantic-hot" />
          <span>Day {daysTogether} Together 💑</span>
        </button>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Thinking of you */}
        <button
          onClick={onTriggerThinkingOfYou}
          className="flex h-9 w-9 items-center justify-center rounded-full text-romantic-hot hover:bg-pink-100/70 active:scale-95 transition-all dark:hover:bg-romantic-darkBorder"
          title="Send Heart Burst 💕"
        >
          <Heart className="h-5 w-5 fill-romantic-hot" />
        </button>

        {/* Daily Love Note */}
        <button
          onClick={onOpenLoveNotes}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:text-romantic-hot hover:bg-pink-100/60 active:scale-95 transition-all dark:text-slate-300"
          title="Daily Love Note"
        >
          <Sparkles className="h-5 w-5" />
        </button>

        {/* Memories Gallery */}
        <button
          onClick={onOpenMemories}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:text-romantic-hot hover:bg-pink-100/60 active:scale-95 transition-all dark:text-slate-300"
          title="Shared Memories"
        >
          <ImageIcon className="h-5 w-5" />
        </button>

        {/* Invite link & QR Code */}
        {room && (
          <button
            onClick={onOpenInvite}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:text-romantic-hot hover:bg-pink-100/60 active:scale-95 transition-all dark:text-slate-300"
            title="Invite & QR Code"
          >
            <QrCode className="h-5 w-5" />
          </button>
        )}

        {/* Theme Picker */}
        <button
          onClick={onOpenThemes}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:text-romantic-hot hover:bg-pink-100/60 active:scale-95 transition-all dark:text-slate-300"
          title="Wallpaper & Themes"
        >
          <Palette className="h-5 w-5" />
        </button>

        {/* More Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-pink-100/60 active:scale-95 transition-all dark:text-slate-300"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 mt-2 w-48 rounded-2xl border border-pink-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl z-50 dark:border-romantic-darkBorder dark:bg-romantic-darkCard"
              >
                <button
                  onClick={() => {
                    handleToggleSound();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 dark:text-pink-100 dark:hover:bg-romantic-darkBorder"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-romantic-hot" />}
                  <span>{isMuted ? 'Unmute Sound' : 'Mute Sound'}</span>
                </button>

                <button
                  onClick={() => {
                    onReplayProposal();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 dark:text-pink-100 dark:hover:bg-romantic-darkBorder"
                >
                  <RotateCcw className="h-4 w-4 text-romantic-hot" />
                  <span>Replay Proposal 💕</span>
                </button>

                <div className="my-1 border-t border-pink-100 dark:border-romantic-darkBorder" />

                <button
                  onClick={() => {
                    onSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

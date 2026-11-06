import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useChat } from './context/ChatContext';
import { ProposalScreen } from './components/proposal/ProposalScreen';
import { LandingPage } from './components/landing/LandingPage';
import { ChatHeader } from './components/chat/ChatHeader';
import { ChatArea } from './components/chat/ChatArea';
import { ChatInput } from './components/chat/ChatInput';
import { FloatingHeartStorm } from './components/chat/FloatingHeartStorm';
import { InviteModal } from './components/modals/InviteModal';
import { MemoriesModal } from './components/modals/MemoriesModal';
import { LoveNotesModal } from './components/modals/LoveNotesModal';
import { ThemeCustomizerModal } from './components/modals/ThemeCustomizerModal';
import { Message } from './types/database';

export const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    activeRoom,
    partner,
    messages,
    memories,
    isPartnerTyping,
    isHeartStormActive,
    wallpaperTheme,
    daysTogether,
    currentLoveQuote,
    createRoom,
    joinRoom,
    leaveRoom,
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
  } = useChat();

  // Route / Proposal parameters
  const [inviteCodeFromUrl, setInviteCodeFromUrl] = useState<string | null>(null);
  const [showProposal, setShowProposal] = useState<boolean>(false);

  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);
  const [isLoveNotesOpen, setIsLoveNotesOpen] = useState(false);
  const [isThemesOpen, setIsThemesOpen] = useState(false);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('romantic_dark_mode') === 'true';
  });

  // Reply & Edit state
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Parse invite URL and proposal trigger
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    let code: string | null = null;
    if (path.startsWith('/join/')) {
      code = path.replace('/join/', '').split('/')[0];
    } else if (searchParams.get('join')) {
      code = searchParams.get('join');
    } else if (searchParams.get('code')) {
      code = searchParams.get('code');
    } else if (hash.startsWith('#/join/')) {
      code = hash.replace('#/join/', '').split('/')[0];
    } else if (hash.startsWith('#join/')) {
      code = hash.replace('#join/', '').split('/')[0];
    }

    if (code) {
      setInviteCodeFromUrl(code);
      const hasAnswered = localStorage.getItem('proposal_answered_' + code);
      const forceReplay = searchParams.get('replay') === 'true' || searchParams.get('proposal') === 'true';
      if (!hasAnswered || forceReplay) {
        setShowProposal(true);
      }
    }
  }, []);

  // Sync dark mode class with HTML root
  useEffect(() => {
    if (isDarkMode || wallpaperTheme === 'midnight-rose') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('romantic_dark_mode', String(isDarkMode));
  }, [isDarkMode, wallpaperTheme]);

  // Handle proposal completion
  const handleProposalComplete = async () => {
    setShowProposal(false);
    if (inviteCodeFromUrl) {
      await joinRoom(inviteCodeFromUrl);
    } else if (!activeRoom) {
      await createRoom('Our Secret Space 💕');
    }
  };

  // Replay proposal button from menu
  const handleReplayProposal = () => {
    setShowProposal(true);
  };

  // Sign out of both room and user session
  const handleSignOut = async () => {
    leaveRoom();
    await signOut();
  };

  // Get wallpaper background classes
  const getThemeBackground = () => {
    if (isDarkMode || wallpaperTheme === 'midnight-rose') {
      return 'bg-[#120710] text-pink-50';
    }
    switch (wallpaperTheme) {
      case 'sunset-blush':
        return 'bg-gradient-to-br from-[#FFF0F6] via-[#FFEBE5] to-[#FFD5CC]';
      case 'lavender-dream':
        return 'bg-gradient-to-br from-[#FFF0F6] via-[#F4E8FF] to-[#EBD5FF]';
      case 'peaches-cream':
        return 'bg-gradient-to-br from-[#FFF5F0] via-[#FFEFEA] to-[#FFE0D4]';
      case 'pink-blossom':
      default:
        return 'bg-gradient-to-br from-[#FFF0F6] via-[#FFE4EE] to-[#FFD1DC]';
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF0F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-pink-200 border-t-romantic-hot animate-spin" />
          <p className="font-romantic text-2xl font-bold text-romantic-berry">Opening Our Little Space...</p>
        </div>
      </div>
    );
  }

  // 1. If in Proposal sequence, render full screen proposal
  if (showProposal) {
    return (
      <ProposalScreen
        onComplete={handleProposalComplete}
        inviteCode={inviteCodeFromUrl || undefined}
      />
    );
  }

  // 2. If no user or no active room yet, show Landing Page with zero friction onboarding
  if (!user || !activeRoom) {
    return (
      <LandingPage
        onJoinRoom={joinRoom}
        onCreateRoom={createRoom}
        onPreviewProposal={() => setShowProposal(true)}
        prefilledInviteCode={inviteCodeFromUrl || undefined}
      />
    );
  }

  // 3. Main Private Chat Web App
  return (
    <div className={`relative flex h-screen w-full flex-col overflow-hidden font-sans ${getThemeBackground()}`}>
      {/* Floating Heart Storm when Thinking of You is triggered */}
      <FloatingHeartStorm isActive={isHeartStormActive} />

      {/* Chat Top Navigation */}
      <ChatHeader
        partner={partner}
        room={activeRoom}
        daysTogether={daysTogether}
        isPartnerTyping={isPartnerTyping}
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenMemories={() => setIsMemoriesOpen(true)}
        onOpenThemes={() => setIsThemesOpen(true)}
        onOpenLoveNotes={() => setIsLoveNotesOpen(true)}
        onTriggerThinkingOfYou={sendThinkingOfYou}
        onReplayProposal={handleReplayProposal}
        onSignOut={handleSignOut}
      />

      {/* Main Messages Area */}
      <ChatArea
        messages={messages}
        currentUserId={user?.id || 'me'}
        onReply={(msg) => {
          setReplyingTo(msg);
          setEditingMessage(null);
        }}
        onReact={toggleReaction}
        onEdit={(msg) => {
          setEditingMessage(msg);
          setReplyingTo(null);
        }}
        onDelete={deleteMessage}
      />

      {/* Bottom Anchored Input Bar */}
      <ChatInput
        onSendMessage={sendMessage}
        onSendTyping={sendTyping}
        onSendThinkingOfYou={sendThinkingOfYou}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        editingMessage={editingMessage}
        onSaveEdit={(newContent) => {
          if (editingMessage) {
            editMessage(editingMessage.id, newContent);
            setEditingMessage(null);
          }
        }}
        onCancelEdit={() => setEditingMessage(null)}
      />

      {/* Modals */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        room={activeRoom}
      />

      <MemoriesModal
        isOpen={isMemoriesOpen}
        onClose={() => setIsMemoriesOpen(false)}
        memories={memories}
        onAddMemory={addMemory}
        onDeleteMemory={deleteMemory}
      />

      <LoveNotesModal
        isOpen={isLoveNotesOpen}
        onClose={() => setIsLoveNotesOpen(false)}
        currentQuote={currentLoveQuote}
        onNextQuote={nextLoveQuote}
      />

      <ThemeCustomizerModal
        isOpen={isThemesOpen}
        onClose={() => setIsThemesOpen(false)}
        currentTheme={wallpaperTheme}
        onSelectTheme={setWallpaperTheme}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
    </div>
  );
};

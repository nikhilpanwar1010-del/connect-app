import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartRainCanvas } from '../proposal/HeartRainCanvas';
import { useAuth } from '../../context/AuthContext';
import { Heart, Sparkles, Lock, ArrowRight, KeyRound, Mail, User, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onJoinRoom: (inviteCode: string, passcode?: string) => Promise<{ success: boolean; error?: string }>;
  onCreateRoom: (name?: string, passcode?: string) => Promise<unknown>;
  onPreviewProposal?: () => void;
  prefilledInviteCode?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onJoinRoom,
  onCreateRoom,
  onPreviewProposal,
  prefilledInviteCode,
}) => {
  const { user, signInWithEmail, signUpWithEmail, signInWithMagicLink, signInWithGoogle, signInAsGuest } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'join'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState(prefilledInviteCode || '');
  const [roomPasscode, setRoomPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Handle Join Room Flow
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setErrorMsg('Please enter an invite code or link');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // If not signed in, auto sign-in with name or guest
    if (!user) {
      await signInAsGuest(name.trim() || 'My Love', true);
    }

    const res = await onJoinRoom(inviteCode.trim(), roomPasscode.trim() || undefined);
    if (!res.success) {
      setErrorMsg(res.error || 'Could not join room');
    }
    setLoading(false);
  };

  // Handle Create Space
  const handleCreateSpace = async () => {
    setLoading(true);
    setErrorMsg(null);
    if (!user) {
      await signInAsGuest('Me 💕', false);
    }
    await onCreateRoom('Our Secret Space 💕', roomPasscode || undefined);
    setLoading(false);
  };

  // Handle Auth
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }
      }

      // Enter/create room immediately upon login
      await onCreateRoom('Our Secret Space 💕');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setErrorMsg('Please enter your email for Magic Link');
      return;
    }
    setLoading(true);
    const { error } = await signInWithMagicLink(email);
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setMagicLinkSent(true);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF0F6] via-[#FFE6F0] to-[#FFD5E5] p-4 text-slate-800">
      {/* 60fps Floating Hearts & Sparkles */}
      <HeartRainCanvas />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Animated Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-romantic-hot to-romantic-rose text-white shadow-glow">
            <Heart className="h-8 w-8 fill-white animate-pulse" />
          </div>

          <h1 className="font-romantic text-5xl sm:text-6xl font-bold text-romantic-berry tracking-wide">
            Our Little Space 💕
          </h1>
          <p className="mt-2 text-sm font-semibold text-pink-900/80">
            A private, romantic sanctuary made just for the two of us.
          </p>
        </motion.div>

        {/* Glass Card Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-romantic-xl border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur-2xl dark:border-romantic-darkBorder dark:bg-romantic-darkCard"
        >
          {/* Mode Switch Tabs */}
          <div className="flex rounded-full bg-pink-100/70 p-1 mb-6 dark:bg-romantic-darkBg">
            <button
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
                authMode === 'signin'
                  ? 'bg-romantic-hot text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Sign In 💌
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
                authMode === 'signup'
                  ? 'bg-romantic-hot text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Create Account 🌸
            </button>
            <button
              onClick={() => {
                setAuthMode('join');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
                authMode === 'join'
                  ? 'bg-romantic-hot text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Enter Code 🔑
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-100 p-2.5 text-xs font-semibold text-red-600">
              {errorMsg}
            </div>
          )}

          {magicLinkSent && (
            <div className="mb-4 rounded-xl bg-pink-100 p-2.5 text-xs font-semibold text-romantic-berry">
              Magic login link sent to your email! Please check your inbox 💕
            </div>
          )}

          {authMode === 'join' ? (
            /* Enter with Invite Code */
            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-pink-100">
                  Your Name / Nickname
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-pink-200 bg-white/90 px-3 py-2 dark:border-romantic-darkBorder dark:bg-romantic-darkBg">
                  <User className="h-4 w-4 text-pink-400 mr-2" />
                  <input
                    type="text"
                    placeholder="e.g. My Sweetheart"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 outline-none dark:text-pink-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-pink-100">
                  Invite Code or Link
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-pink-200 bg-white/90 px-3 py-2 dark:border-romantic-darkBorder dark:bg-romantic-darkBg">
                  <KeyRound className="h-4 w-4 text-pink-400 mr-2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. love-abc-123"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 outline-none dark:text-pink-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-pink-100">
                  Room Passcode (Optional)
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-pink-200 bg-white/90 px-3 py-2 dark:border-romantic-darkBorder dark:bg-romantic-darkBg">
                  <Lock className="h-4 w-4 text-pink-400 mr-2" />
                  <input
                    type="password"
                    placeholder="Only if partner set a passcode"
                    value={roomPasscode}
                    onChange={(e) => setRoomPasscode(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 outline-none dark:text-pink-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-romantic-hot to-romantic-berry py-3 text-sm font-bold text-white shadow-glow hover:opacity-95 active:scale-95 transition-all"
              >
                <span>Enter Our Space</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            /* Sign In or Sign Up */
            <form onSubmit={handleAuth} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-pink-100">
                    Your Name
                  </label>
                  <div className="mt-1 flex items-center rounded-xl border border-pink-200 bg-white/90 px-3 py-2 dark:border-romantic-darkBorder dark:bg-romantic-darkBg">
                    <User className="h-4 w-4 text-pink-400 mr-2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-xs text-slate-800 outline-none dark:text-pink-50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-pink-100">Email</label>
                <div className="mt-1 flex items-center rounded-xl border border-pink-200 bg-white/90 px-3 py-2 dark:border-romantic-darkBorder dark:bg-romantic-darkBg">
                  <Mail className="h-4 w-4 text-pink-400 mr-2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 outline-none dark:text-pink-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-pink-100">Password</label>
                <div className="mt-1 flex items-center rounded-xl border border-pink-200 bg-white/90 px-3 py-2 dark:border-romantic-darkBorder dark:bg-romantic-darkBg">
                  <Lock className="h-4 w-4 text-pink-400 mr-2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 outline-none dark:text-pink-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-romantic-hot to-romantic-berry py-3 text-sm font-bold text-white shadow-glow hover:opacity-95 active:scale-95 transition-all"
              >
                <span>{authMode === 'signup' ? 'Create Our Space 💕' : 'Start Chatting 💖'}</span>
              </button>

              {/* One-click Magic Link button */}
              <button
                type="button"
                onClick={handleMagicLink}
                className="w-full rounded-xl border border-pink-200 bg-white py-2 text-xs font-bold text-romantic-berry hover:bg-pink-50 transition-colors dark:border-romantic-darkBorder dark:bg-romantic-darkBg dark:text-pink-200"
              >
                Send Me a Magic Login Link ✨
              </button>

              {/* Quick Guest Sign-In for Immediate 0-friction Demo */}
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-pink-200/60 dark:border-romantic-darkBorder" />
                </div>
                <span className="relative bg-white/80 dark:bg-romantic-darkCard px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Instant Preview
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCreateSpace()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-100/90 py-2.5 text-xs font-bold text-romantic-deep hover:bg-pink-200 active:scale-95 transition-all dark:bg-pink-900/40 dark:text-pink-100"
              >
                <Sparkles className="h-4 w-4 text-romantic-hot" />
                <span>Instant 1-Click Guest Access (Enter Chat)</span>
              </button>

              {onPreviewProposal && (
                <button
                  type="button"
                  onClick={onPreviewProposal}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-pink-300 bg-white/90 py-2.5 text-xs font-bold text-romantic-hot hover:bg-pink-50 active:scale-95 transition-all shadow-sm"
                >
                  <Heart className="h-4 w-4 fill-romantic-hot" />
                  <span>Preview Proposal Experience 💖</span>
                </button>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

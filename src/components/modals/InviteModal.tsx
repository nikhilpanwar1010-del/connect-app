import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2, X, Lock, AlertTriangle, Globe } from 'lucide-react';
import { Room } from '../../types/database';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, room }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [customHost, setCustomHost] = useState<string>('');

  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Compute base URL for the link/QR
  const getBaseOrigin = () => {
    if (!customHost.trim()) return window.location.origin;
    let host = customHost.trim().replace(/\/+$/, '');
    if (!host.startsWith('http://') && !host.startsWith('https://')) {
      if (host.includes('vercel.app') || host.includes('netlify.app') || host.includes('.com') || host.includes('.org') || host.includes('.app')) {
        host = `https://${host}`;
      } else {
        const port = window.location.port ? `:${window.location.port}` : ':3000';
        host = host.includes(':') ? `http://${host}` : `http://${host}${port}`;
      }
    }
    return host;
  };

  const inviteUrl = `${getBaseOrigin()}/join/${room.invite_code}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(inviteUrl, {
        width: 250,
        margin: 2,
        color: {
          dark: '#C2185B',
          light: '#FFF0F6',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, inviteUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Hey my love, I made a private space just for the two of us! 💕 Open this link: ${inviteUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm rounded-romantic-xl border border-pink-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-romantic-darkBorder dark:bg-romantic-darkCard text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="font-romantic text-3xl font-bold text-romantic-berry">
            Invite Your Special One 💕
          </span>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Share this private link or scan the QR code to connect directly in your secret room.
          </p>

          {/* QR Code */}
          {qrDataUrl && (
            <div className="my-4 flex justify-center">
              <div className="rounded-2xl border-2 border-pink-200 p-2 bg-[#FFF0F6] shadow-sm">
                <img src={qrDataUrl} alt="Invite QR Code" className="h-44 w-44 rounded-xl" />
              </div>
            </div>
          )}

          {/* Passcode notice if room has one */}
          {room.passcode && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-romantic-berry">
              <Lock className="h-3 w-3" />
              <span>Room Passcode: <strong>{room.passcode}</strong></span>
            </div>
          )}

          {/* Localhost Warning & Host Switcher */}
          {isLocalhost && (
            <div className="mb-3 rounded-xl border border-amber-200/90 bg-amber-50/95 p-2.5 text-left text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200 shadow-sm">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                <span>Opening from mobile or another device?</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                Phones cannot reach <code>localhost</code>. To test on the same Wi-Fi, enter your computer&apos;s IP address or deployed URL below:
              </p>
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2 py-1 dark:border-amber-700 dark:bg-slate-900">
                <Globe className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.6 or yoursite.vercel.app"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none dark:text-amber-100"
                />
              </div>
            </div>
          )}

          {/* Copy Link Input */}
          <div className="flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50/50 p-2 dark:border-romantic-darkBorder dark:bg-romantic-darkBg">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-transparent text-xs text-slate-700 outline-none truncate dark:text-pink-100"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg bg-romantic-hot px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={shareToWhatsApp}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 active:scale-95 transition-all"
          >
            <Share2 className="h-4 w-4" />
            <span>Send via WhatsApp 💌</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

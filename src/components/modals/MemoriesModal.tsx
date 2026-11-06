import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Trash2, Image as ImageIcon } from 'lucide-react';
import { Memory } from '../../types/database';
import { compressImage } from '../../lib/imageCompression';

interface MemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  onAddMemory: (imageUrl: string, caption?: string, date?: string) => Promise<void>;
  onDeleteMemory: (memoryId: string) => Promise<void>;
}

export const MemoriesModal: React.FC<MemoriesModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<Memory | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await compressImage(file, 1600, 1600, 0.85);
      setSelectedImage(dataUrl);
    } catch {
      alert('Could not process photo');
    }
  };

  const handleSave = async () => {
    if (!selectedImage) return;
    await onAddMemory(selectedImage, caption, date);
    setSelectedImage(null);
    setCaption('');
    setIsAdding(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-romantic-xl border border-pink-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-romantic-darkBorder dark:bg-romantic-darkCard overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-pink-100 p-4 dark:border-romantic-darkBorder">
            <div className="flex items-center gap-2">
              <span className="font-romantic text-3xl font-bold text-romantic-berry">
                Our Sweet Memories 📸
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-1 rounded-full bg-romantic-hot px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Memory</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Add Memory Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-pink-100 bg-pink-50/70 p-4 dark:border-romantic-darkBorder dark:bg-romantic-darkBg/60"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-300 bg-white hover:bg-pink-100/50 transition-colors overflow-hidden dark:bg-romantic-darkCard"
                  >
                    {selectedImage ? (
                      <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-pink-400" />
                        <span className="mt-1 text-[11px] font-semibold text-pink-500">Pick Photo</span>
                      </>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      placeholder="Add a sweet caption (e.g. Our anniversary dinner ✨)"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full rounded-xl border border-pink-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-romantic-hot dark:bg-romantic-darkCard dark:text-pink-100 dark:border-romantic-darkBorder"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-xl border border-pink-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none dark:bg-romantic-darkCard dark:text-pink-100 dark:border-romantic-darkBorder"
                      />
                      <button
                        onClick={handleSave}
                        disabled={!selectedImage}
                        className="rounded-xl bg-romantic-hot px-4 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-50"
                      >
                        Save Memory
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Memories Gallery Grid */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <ImageIcon className="h-12 w-12 text-pink-200" />
                <p className="mt-2 text-sm font-semibold">No memories yet.</p>
                <p className="text-xs">Click "Add Memory" above to start your private photo timeline!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {memories.map((mem) => (
                  <motion.div
                    key={mem.id}
                    whileHover={{ scale: 1.02 }}
                    className="group relative overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm dark:border-romantic-darkBorder dark:bg-romantic-darkCard"
                  >
                    <img
                      src={mem.image_url}
                      alt={mem.caption || 'Memory'}
                      onClick={() => setActivePhoto(mem)}
                      className="h-40 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    <div className="p-2">
                      <p className="text-xs font-medium text-slate-800 dark:text-pink-100 truncate">
                        {mem.caption || 'Sweet moment'}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {mem.memory_date}
                        </span>
                        <button
                          onClick={() => onDeleteMemory(mem.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                          title="Delete memory"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <div className="relative max-w-xl max-h-[90vh] flex flex-col items-center">
            <img
              src={activePhoto.image_url}
              alt="Memory Full"
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            {activePhoto.caption && (
              <p className="mt-3 text-center text-sm font-semibold text-white drop-shadow">
                {activePhoto.caption}
              </p>
            )}
            <span className="mt-1 text-xs text-white/70">{activePhoto.memory_date}</span>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

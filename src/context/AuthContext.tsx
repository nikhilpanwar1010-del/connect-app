import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInAsGuest: (name: string, isPartner?: boolean) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'our_little_space_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            await fetchProfile(session.user.id, session.user.email);
          } else {
            // Check local fallback
            checkLocalSession();
          }
        } catch {
          checkLocalSession();
        }
      } else {
        checkLocalSession();
      }

      if (mounted) setLoading(false);
    }

    function checkLocalSession() {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          localStorage.removeItem(LOCAL_USER_KEY);
        }
      }
    }

    initAuth();

    // Listen for Supabase auth state changes if configured
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_USER_KEY);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string, email?: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create initial profile if missing
        const newProfile: Profile = {
          id: userId,
          name: email ? email.split('@')[0] : 'My Love',
          avatar_url: null,
          bio: 'Falling in love every single day 💕',
          status_message: 'Online & thinking of you ✨',
          is_online: true,
          last_seen: new Date().toISOString()
        };
        await supabase.from('profiles').insert(newProfile);
        setUser(newProfile);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
      } else if (data) {
        setUser(data);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data));
      }
    } catch {
      // In case of error, keep local user
    }
  }

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode fallback
      const guestUser: Profile = {
        id: 'demo-user-' + Math.random().toString(36).substring(2, 8),
        name: email.split('@')[0] || 'My Love',
        avatar_url: null,
        bio: 'Falling in love every single day 💕',
        status_message: 'Online & thinking of you ✨',
        is_online: true,
        last_seen: new Date().toISOString()
      };
      setUser(guestUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // Sign Up with Email & Password & Name
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      const guestUser: Profile = {
        id: 'demo-user-' + Math.random().toString(36).substring(2, 8),
        name: name || email.split('@')[0] || 'My Love',
        avatar_url: null,
        bio: 'Falling in love every single day 💕',
        status_message: 'Online & thinking of you ✨',
        is_online: true,
        last_seen: new Date().toISOString()
      };
      setUser(guestUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (!error && data.user) {
      await fetchProfile(data.user.id, email);
    }

    return { error };
  };

  // Magic Link Sign In
  const signInWithMagicLink = async (email: string) => {
    if (!isSupabaseConfigured) {
      return signInWithEmail(email, 'demo-pass');
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return { error };
  };

  // Google OAuth Sign In
  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured) {
      await signInAsGuest('Google User');
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    return { error };
  };

  // Zero-friction instant sign in
  const signInAsGuest = async (name: string, isPartner = false) => {
    const id = isPartner ? 'guest-partner-456' : 'guest-me-123';
    const guestUser: Profile = {
      id,
      name: name || (isPartner ? 'My Sweetheart' : 'Me 💕'),
      avatar_url: isPartner ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      bio: 'In our little corner of the world 🌸',
      status_message: 'Always here for you 💕',
      is_online: true,
      last_seen: new Date().toISOString()
    };
    setUser(guestUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
  };

  // Update Profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const updatedUser: Profile = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString()
    };

    setUser(updatedUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      return { error };
    }

    return { error: null };
  };

  // Sign Out
  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithMagicLink,
        signInWithGoogle,
        signInAsGuest,
        updateProfile,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

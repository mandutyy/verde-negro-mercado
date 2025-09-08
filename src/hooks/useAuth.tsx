import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initialize session and set up listeners
    const initializeAuth = async () => {
      try {
        // Get initial session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've handled the auth change
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }

        // Create or update profile when user signs in (non-blocking)
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              const { error } = await supabase
                .from('profiles')
                .upsert([
                  {
                    user_id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
                  }
                ], {
                  onConflict: 'user_id'
                });

              if (error) {
                console.error('Error upserting profile:', error);
              }
            } catch (error) {
              console.error('Error in profile creation:', error);
            }
          }, 100);
        }
      }
    );

    // Initialize session after setting up the listener
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
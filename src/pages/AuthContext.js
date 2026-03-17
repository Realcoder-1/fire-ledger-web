import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

const TRIAL_DAYS = 7;

export function AuthProvider({ children }) {
  const [user,            setUser]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isTrial,         setIsTrial]         = useState(false);
  const [trialDaysLeft,   setTrialDaysLeft]   = useState(0);

  const checkAccess = async (currentUser) => {
    if (!currentUser) { setHasSubscription(false); setIsTrial(false); return; }

    // Check paid subscription first
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', currentUser.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    if (sub) { setHasSubscription(true); setIsTrial(false); setTrialDaysLeft(0); return; }

    // Check trial — based on account creation date
    const createdAt = new Date(currentUser.created_at);
    const now       = new Date();
    const daysSince = (now - createdAt) / (1000 * 60 * 60 * 24);
    const daysLeft  = Math.max(0, Math.ceil(TRIAL_DAYS - daysSince));

    if (daysLeft > 0) {
      setHasSubscription(true); // grant access during trial
      setIsTrial(true);
      setTrialDaysLeft(daysLeft);
    } else {
      setHasSubscription(false);
      setIsTrial(false);
      setTrialDaysLeft(0);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAccess(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAccess(session.user);
      else { setHasSubscription(false); setIsTrial(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/app' }
  });

  const signOut = () => supabase.auth.signOut();
  const refreshSubscription = () => user && checkAccess(user);

  return (
    <AuthContext.Provider value={{
      user, loading, hasSubscription, isTrial, trialDaysLeft,
      signInWithGoogle, signOut, refreshSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

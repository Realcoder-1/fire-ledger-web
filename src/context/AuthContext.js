import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getAuthRedirectPath } from '../lib/affiliateReferral';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLifetime, setIsLifetime] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  const checkAccess = async (currentUser) => {
    try {
      if (!currentUser) { setHasSubscription(false); setIsLifetime(false); return; }
      const { data: sub } = await supabase.from('subscriptions').select('status, plan_type').eq('user_id', currentUser.id).in('status', ['active', 'trialing']).maybeSingle();
      if (sub) { setHasSubscription(true); setIsLifetime(sub.plan_type === 'lifetime'); }
      else { setHasSubscription(false); setIsLifetime(false); }
    } catch (e) {
      console.error('checkAccess error:', e);
      setHasSubscription(false); setIsLifetime(false);
    } finally { setAccessChecked(true); }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAccess(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAccess(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const buildRedirectUrl = (path) => `${window.location.origin}${path}`;

  const signInWithGoogle = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: buildRedirectUrl(getAuthRedirectPath('/app')) },
  });
  const signInWithEmail = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUpWithEmail = (email, password) => supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: buildRedirectUrl(getAuthRedirectPath('/app')) },
  });
  const resetPassword = (email) => supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildRedirectUrl(getAuthRedirectPath('/pricing')),
  });
  const signOut = () => supabase.auth.signOut();
  const refreshSubscription = () => user && checkAccess(user);

  return (
    <AuthContext.Provider value={{ user, loading, hasSubscription, isLifetime, accessChecked, isTrial: false, trialDaysLeft: 0, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

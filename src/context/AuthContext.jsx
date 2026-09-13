import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSession, restoreSession } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialSession = getSession();
  const [session, setSession] = useState(initialSession);
  const [status, setStatus] = useState(initialSession ? 'ready' : 'restoring');

  useEffect(() => {
    let active = true;
    const syncSession = () => {
      if (active) setSession(getSession());
    };

    window.addEventListener('tropitwist-session-change', syncSession);
    restoreSession().then((restoredSession) => {
      if (!active) return;
      setSession(restoredSession);
      setStatus('ready');
    });

    return () => {
      active = false;
      window.removeEventListener('tropitwist-session-change', syncSession);
    };
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    isAuthenticated: Boolean(session?.user),
    isRestoring: status === 'restoring',
  }), [session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

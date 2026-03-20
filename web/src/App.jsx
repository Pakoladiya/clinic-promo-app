import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import supabase from './services/supabaseClient';

// Pages (built one by one)
import LoginPage          from './pages/LoginPage';
import DashboardPage      from './pages/DashboardPage';
import DetailsPage        from './pages/DetailsPage';
import CanvasEditorPage   from './pages/CanvasEditorPage';
import ProfilePage        from './pages/ProfilePage';

/* ── Auth Context ─────────────────────────────────────── */
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── Auth Guard ───────────────────────────────────────── */
function Protected({ children }) {
  const { session } = useAuth();
  if (session === undefined) return <Splash />;   // still loading
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function Splash() {
  return (
    <div className="h-full flex items-center justify-center bg-[#f0f4ff]">
      <div className="w-10 h-10 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
    </div>
  );
}

/* ── App ──────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <div className="h-full font-sans">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <Protected><DashboardPage /></Protected>
            } />
            <Route path="/content/:id" element={
              <Protected><DetailsPage /></Protected>
            } />
            <Route path="/editor/:id" element={
              <Protected><CanvasEditorPage /></Protected>
            } />
            <Route path="/profile" element={
              <Protected><ProfilePage /></Protected>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
}

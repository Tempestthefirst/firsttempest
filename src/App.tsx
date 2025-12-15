import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// Pages
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import MoneyRooms from "./pages/MoneyRooms";
import RoomDetail from "./pages/RoomDetail";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import HourGlass from "./pages/HourGlass";
import Send from './pages/Send';
import Receive from './pages/Receive';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, session }: { children: React.ReactNode; session: Session | null }) => {
  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
};

const AuthRoute = ({ children, session }: { children: React.ReactNode; session: Session | null }) => {
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle splash screen - only show on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Show splash screen only before auth check completes
  if (showSplash && loading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show loading while checking auth (after splash)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/login" replace />} />
            
            {/* Auth routes */}
            <Route path="/auth/login" element={<AuthRoute session={session}><Login /></AuthRoute>} />
            <Route path="/auth/signup" element={<AuthRoute session={session}><Signup /></AuthRoute>} />
            <Route path="/auth/forgot-password" element={<AuthRoute session={session}><ForgotPassword /></AuthRoute>} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute session={session}><Dashboard /></ProtectedRoute>} />
            <Route path="/hourglass" element={<ProtectedRoute session={session}><HourGlass /></ProtectedRoute>} />
            <Route path="/money-rooms" element={<ProtectedRoute session={session}><MoneyRooms /></ProtectedRoute>} />
            <Route path="/rooms" element={<ProtectedRoute session={session}><MoneyRooms /></ProtectedRoute>} />
            <Route path="/room/:id" element={<ProtectedRoute session={session}><RoomDetail /></ProtectedRoute>} />
            <Route path="/rooms/:id" element={<ProtectedRoute session={session}><RoomDetail /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute session={session}><Transactions /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute session={session}><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute session={session}><Settings /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute session={session}><Admin /></ProtectedRoute>} />
            <Route path="/send" element={<ProtectedRoute session={session}><Send /></ProtectedRoute>} />
            <Route path="/receive" element={<ProtectedRoute session={session}><Receive /></ProtectedRoute>} />
            
            {/* Redirects */}
            <Route path="/wallet" element={<Navigate to="/dashboard" replace />} />
            <Route path="/topup" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

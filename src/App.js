import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import AppDashboard from './pages/AppDashboard';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';

function ProtectedRoute({ children }) {
  const { user, loading, hasSubscription } = useAuth();
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#08080f',color:'#8888aa',fontFamily:'DM Sans,sans-serif'}}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/" />;
  if (!hasSubscription) return <Navigate to="/pricing" />;
  return children;
}

function AppRoutes() {
  const { user, hasSubscription } = useAuth();
  return (
    <Routes>
      {/* Landing: show to everyone — signed-in users with a plan go to /app */}
      <Route path="/" element={user && hasSubscription ? <Navigate to="/app" /> : <Landing />} />
      {/* Pricing: accessible to signed-in users without a plan, and to anyone coming from landing */}
      <Route path="/pricing" element={hasSubscription ? <Navigate to="/app" /> : <Pricing />} />
      <Route path="/app"     element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
      <Route path="/terms"   element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/refund"  element={<Refund />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#08080f',color:'#8888aa',fontFamily:'DM Sans,sans-serif'}}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/" />;
  if (!hasSubscription) return <Navigate to="/pricing" />;
  return children;
}

function AppRoutes() {
  const { user, hasSubscription } = useAuth();
  return (
    <Routes>
      <Route path="/"        element={user ? <Navigate to="/app" /> : <Landing />} />
      <Route path="/pricing" element={!user ? <Navigate to="/" /> : hasSubscription ? <Navigate to="/app" /> : <Pricing />} />
      <Route path="/app"     element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
      <Route path="/terms"   element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/refund"  element={<Refund />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

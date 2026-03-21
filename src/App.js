import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import AppDashboard from './pages/AppDashboard';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import SignUp from './pages/SignUp';

function ProtectedRoute({ children }) {
  const { user, loading, hasSubscription } = useAuth();
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#08080f',color:'#8888aa',fontFamily:'DM Sans,sans-serif'}}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/signin" />;
  if (!hasSubscription) return <Navigate to="/pricing" />;
  return children;
}

function AppRoutes() {
  const { user, hasSubscription } = useAuth();
  return (
    <Routes>
<Route path="/signup" element={<SignUp />} />
      <Route path="/"        element={user && hasSubscription ? <Navigate to="/app" /> : <Landing />} />
      <Route path="/signin"  element={user ? (hasSubscription ? <Navigate to="/app" /> : <Navigate to="/pricing" />) : <SignIn />} />
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

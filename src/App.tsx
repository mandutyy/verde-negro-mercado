
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Navigation from './components/Navigation';
import { usePrefetchData } from '@/hooks/useApi';
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Purchase from "./pages/Purchase";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import MyPlants from "./pages/MyPlants";
import MyReviews from "./pages/MyReviews";
import PlantDetail from "./pages/PlantDetail";
import UserProfile from "./pages/UserProfile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CookiesPolicy from "./pages/CookiesPolicy";

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { prefetchPlants, prefetchUserData } = usePrefetchData();
  
  // Precargar datos cuando el usuario se autentica
  useEffect(() => {
    if (user) {
      prefetchPlants();
      prefetchUserData();
    }
  }, [user, prefetchPlants, prefetchUserData]);
  
  // Hide navigation on specific pages
  const shouldShowNavigation = user && 
                               location.pathname !== '/auth' && 
                               !location.pathname.startsWith('/chat') && 
                               location.pathname !== '/settings' &&
                               location.pathname !== '/edit-profile' &&
                               location.pathname !== '/search';
  
  return (
    <div className="app-container bg-background w-full">
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        } />
        <Route path="/purchase/:id" element={
          <ProtectedRoute>
            <Purchase />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/chat/:conversationId" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/user-profile/:id" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        } />
        <Route path="/my-plants" element={
          <ProtectedRoute>
            <MyPlants />
          </ProtectedRoute>
        } />
        <Route path="/my-reviews" element={
          <ProtectedRoute>
            <MyReviews />
          </ProtectedRoute>
        } />
        <Route path="/plant/:id" element={
          <ProtectedRoute>
            <PlantDetail />
          </ProtectedRoute>
        } />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/cookies-policy" element={<CookiesPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Mobile-optimized bottom navigation */}
      {shouldShowNavigation && <Navigation />}
      
      {/* Cookie consent banner */}
      <CookieConsent />
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;

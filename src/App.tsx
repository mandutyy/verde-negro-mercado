
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Navigation from './components/Navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";

// Lazy load all pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Upload = lazy(() => import("./pages/Upload"));
const Purchase = lazy(() => import("./pages/Purchase"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const Search = lazy(() => import("./pages/Search"));
const MyPlants = lazy(() => import("./pages/MyPlants"));
const MyReviews = lazy(() => import("./pages/MyReviews"));
const PlantDetail = lazy(() => import("./pages/PlantDetail"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Community = lazy(() => import("./pages/Community"));
const CareGuides = lazy(() => import("./pages/CareGuides"));
const FreePlants = lazy(() => import("./pages/FreePlants"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Prefetch main routes when browser is idle
const prefetchRoutes = () => {
  const idle = 'requestIdleCallback' in window ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 200);
  idle(() => {
    import("./pages/Home");
    import("./pages/Messages");
    import("./pages/Profile");
    import("./pages/FreePlants");
  });
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Prefetch critical routes after first render
  useEffect(() => {
    prefetchRoutes();
  }, []);

  // Handle Android back button: if user presses back on home, don't exit the app
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      // If we're already on the home page, push state to prevent app exit
      if (location.pathname === '/') {
        window.history.pushState(null, '', '/');
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [location.pathname]);

  const shouldShowNavigation = user && 
                               location.pathname !== '/auth' && 
                               !location.pathname.startsWith('/chat') && 
                               !location.pathname.startsWith('/plant/') &&
                               location.pathname !== '/settings' &&
                               location.pathname !== '/edit-profile' &&
                               location.pathname !== '/search' &&
                               location.pathname !== '/care-guides' &&
                               location.pathname !== '/community';
  
  return (
    <div className="app-container bg-background w-full">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/purchase/:id" element={<ProtectedRoute><Purchase /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/user-profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/my-plants" element={<ProtectedRoute><MyPlants /></ProtectedRoute>} />
          <Route path="/my-reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
          <Route path="/plant/:id" element={<ProtectedRoute><PlantDetail /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/care-guides" element={<ProtectedRoute><CareGuides /></ProtectedRoute>} />
          <Route path="/free-plants" element={<ProtectedRoute><FreePlants /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      {shouldShowNavigation && <Navigation />}
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

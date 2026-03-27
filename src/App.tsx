import { useEffect, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MapPage from "./pages/MapPage";
import DiscoverSenegal from "./pages/DiscoverSenegal";
import ExploreSenegal from "./pages/ExploreSenegal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Publish from "./pages/Publish";
import Certification from "./pages/Certification";
import PropertyDetail from "./pages/PropertyDetail";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import Profile from "./pages/Profile";
import BecomeHost from "./pages/BecomeHost";
import Favorites from "./pages/Favorites";
import AdminVerification from "./pages/AdminVerification";
import AdminPanel from "./pages/AdminPanel";
import EditListing from "./pages/EditListing";
import Messages from "./pages/Messages";
import CGU from "./pages/CGU";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <div className="pb-14 md:pb-0">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/discover" element={<DiscoverSenegal />} />
                <Route path="/explore-senegal" element={<ExploreSenegal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/publish" element={<Publish />} />
                <Route path="/certification" element={<Certification />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/:tab" element={<Dashboard />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/edit-listing/:id" element={<EditListing />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/become-host" element={<BecomeHost />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/admin/verification" element={<AdminVerification />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/cgu" element={<CGU />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <BottomNav />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

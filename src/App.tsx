import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MapPage from "./pages/MapPage";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/certification" element={<Certification />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:tab" element={<Dashboard />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/become-host" element={<BecomeHost />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/admin/verification" element={<AdminVerification />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

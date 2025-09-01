import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Calendar from './pages/Calendar';
import { Navigation } from "@/components/ui/navigation";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";
import Announcements from "./pages/Announcements";
import Dashboard from "./pages/Dashboard";  

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>  
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <div className="min-h-screen bg-background">
                <Navigation />
                <Dashboard />
              </div>
            } />
            <Route path="/events" element={
              <div className="min-h-screen bg-background">
                <Navigation />
                <Events />
              </div>
            } />
            <Route path="/profile" element={
              <div className="min-h-screen bg-background">
                <Navigation />
                <Profile />
              </div>
            } />
            <Route path="/calendar" element={
              <div className="min-h-screen bg-background">
                <Navigation />
                <Calendar />
              </div>
            } />
            <Route path="/announcements" element={
              <div className="min-h-screen bg-background">
                <Navigation />
                <Announcements />
              </div>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

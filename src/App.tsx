import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import MobileWrapper from "@/components/MobileWrapper";
import Onboarding from "./pages/Onboarding";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import MealScanner from "./pages/MealScanner";
import Yoga from "./pages/Yoga";
import Workouts from "./pages/Workouts";
import Routine from "./pages/Routine";
import Tracker from "./pages/Tracker";
import Gyms from "./pages/Gyms";
import Profile from "./pages/Profile";
import Badges from "./pages/Badges";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isOnboarded } = useApp();

  return (
    <Routes>
      <Route path="/" element={isOnboarded ? <Navigate to="/home" /> : <Onboarding />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/meals" element={<MealScanner />} />
      <Route path="/yoga" element={<Yoga />} />
      <Route path="/workouts" element={<Workouts />} />
      <Route path="/routine" element={<Routine />} />
      <Route path="/tracker" element={<Tracker />} />
      <Route path="/gyms" element={<Gyms />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/badges" element={<Badges />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <MobileWrapper>
            <AppRoutes />
          </MobileWrapper>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

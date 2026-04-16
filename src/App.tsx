import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Area from "./pages/Area";
import SubmitRental from "./pages/SubmitRental";
import SubmitPulse from "./pages/SubmitPulse";
import FairPrice from "./pages/FairPrice";
import MatchMe from "./pages/MatchMe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/area/:suburb" element={<Area />} />
            <Route path="/submit-rental" element={<SubmitRental />} />
            <Route path="/submit-pulse" element={<SubmitPulse />} />
            <Route path="/fair-price" element={<FairPrice />} />
            <Route path="/match-me" element={<MatchMe />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Partner from "./pages/Partner.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import Plans from "./pages/Plans.tsx";
import { AppLayout } from "./components/AppLayout.tsx";
import Discover from "./pages/app/Discover.tsx";
import Listen from "./pages/app/Listen.tsx";
import Watch from "./pages/app/Watch.tsx";
import Live from "./pages/app/Live.tsx";
import Devotionals from "./pages/app/Devotionals.tsx";
import Creators from "./pages/app/Creators.tsx";
import CreatorProfile from "./pages/app/CreatorProfile.tsx";
import Library from "./pages/app/Library.tsx";
import ContentDetail from "./pages/app/ContentDetail.tsx";
import Admin from "./pages/app/Admin.tsx";
import Settings from "./pages/app/Settings.tsx";
import { UserProvider } from "./lib/user";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/subscription" element={<Plans />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Discover />} />
            <Route path="listen" element={<Listen />} />
            <Route path="watch" element={<Watch />} />
            <Route path="live" element={<Live />} />
            <Route path="devotionals" element={<Devotionals />} />
            <Route path="creators" element={<Creators />} />
            <Route path="creators/:id" element={<CreatorProfile />} />
            <Route path="library" element={<Library />} />
            <Route path="content/:id" element={<ContentDetail />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

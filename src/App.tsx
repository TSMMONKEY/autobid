import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Auctions from "./pages/Auctions";
import LiveAuctions from "./pages/LiveAuctions";
import CarDetail from "./pages/CarDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
import HowItWorksPage from "./pages/HowItWorksPage";
import SellYourCar from "./pages/SellYourCar";
import Taxis from "./pages/Taxis";
import TaxiDetail from "./pages/TaxiDetail";
import AddCar from "./pages/AddCar";
import EditVehicle from "./pages/EditVehicle";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Shipping from "./pages/Shipping";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ActivateBidding from "./pages/ActivateBidding";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/live" element={<LiveAuctions />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/taxis" element={<Taxis />} />
            <Route path="/taxi/:id" element={<TaxiDetail />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/sell" element={<SellYourCar />} />
            <Route path="/admin/add-car" element={<AddCar />} />
            <Route path="/admin/edit-vehicle/:id" element={<EditVehicle />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/activate-bidding" element={<ActivateBidding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

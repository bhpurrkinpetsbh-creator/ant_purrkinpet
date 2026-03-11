import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import FreeShippingBanner from "./components/FreeShippingBanner";
import ScrollToTop from "./components/ScrollToTop";
import Maintenance from "./pages/Maintenance";

// ============================================================
// 🔴 MAINTENANCE MODE TOGGLE
// Set to true  → Website shows "Temporarily Closed" page
// Set to false → Website runs normally
// Admin (/admin/*) and POS (/pos/*) routes always stay accessible
// ============================================================
const MAINTENANCE_MODE = true;
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
// import Appointments from "./pages/Appointments"; // DISABLED: Grooming services temporarily closed
import Auth from "./pages/Auth";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminInventory from "./pages/AdminInventory";
import AdminProducts from "./pages/AdminProducts";
import AdminDeletedProducts from "./pages/AdminDeletedProducts";
import AdminCustomers from "./pages/AdminCustomers";
import Wishlist from "./pages/Wishlist";
import DeliveryInfo from "./pages/DeliveryInfo";
import NotFound from "./pages/NotFound";
// POS System Pages
import POSDashboard from "./pages/POSDashboard";
import POSCheckout from "./pages/POSCheckout";
import TalabatEntry from "./pages/TalabatEntry";
import POSSales from "./pages/POSSales";

const queryClient = new QueryClient();

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut" as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: "easeIn" as const,
    },
  },
};

// Animated page wrapper
const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
  >
    {children}
  </motion.div>
);

// Routes component that uses location for AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();

  // In maintenance mode, show maintenance page for all public routes
  // but keep admin and POS routes accessible
  if (MAINTENANCE_MODE) {
    const path = location.pathname;
    const isAdminRoute = path.startsWith("/admin");
    const isPosRoute = path.startsWith("/pos");
    const isAuthRoute = path === "/auth";

    if (!isAdminRoute && !isPosRoute && !isAuthRoute) {
      return <Maintenance />;
    }
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/shop" element={<AnimatedPage><Shop /></AnimatedPage>} />
        <Route path="/product/:id" element={<AnimatedPage><ProductDetail /></AnimatedPage>} />
        {/* <Route path="/appointments" element={<AnimatedPage><Appointments /></AnimatedPage>} />*/} {/* DISABLED: Grooming services temporarily closed */}
        <Route path="/auth" element={<AnimatedPage><Auth /></AnimatedPage>} />
        <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
        <Route path="/cart" element={<AnimatedPage><Cart /></AnimatedPage>} />
        <Route path="/checkout" element={<AnimatedPage><Checkout /></AnimatedPage>} />
        <Route path="/payment" element={<AnimatedPage><Payment /></AnimatedPage>} />
        <Route path="/orders" element={<AnimatedPage><Orders /></AnimatedPage>} />
        <Route path="/wishlist" element={<AnimatedPage><Wishlist /></AnimatedPage>} />
        <Route path="/admin" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
        <Route path="/admin/orders" element={<AnimatedPage><AdminOrders /></AnimatedPage>} />
        <Route path="/admin/inventory" element={<AnimatedPage><AdminInventory /></AnimatedPage>} />
        <Route path="/admin/products" element={<AnimatedPage><AdminProducts /></AnimatedPage>} />
        <Route path="/admin/deleted-products" element={<AnimatedPage><AdminDeletedProducts /></AnimatedPage>} />
        <Route path="/admin/customers" element={<AnimatedPage><AdminCustomers /></AnimatedPage>} />
        <Route path="/delivery" element={<AnimatedPage><DeliveryInfo /></AnimatedPage>} />
        {/* POS System Routes - Standalone UI */}
        <Route path="/pos" element={<POSDashboard />} />
        <Route path="/pos/checkout" element={<POSCheckout />} />
        <Route path="/pos/talabat" element={<TalabatEntry />} />
        <Route path="/pos/sales" element={<POSSales />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
};

// Helper to check if current path is an admin/POS/auth route (layout needed)
const AppLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  const isProtectedRoute = path.startsWith("/admin") || path.startsWith("/pos") || path === "/auth";

  // In maintenance mode, hide header/footer/banner for public routes
  const showLayout = !MAINTENANCE_MODE || isProtectedRoute;

  return (
    <div className="flex flex-col min-h-screen">
      {showLayout && <Header />}
      {showLayout && <FreeShippingBanner />}
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      {showLayout && <Footer />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '2px solid hsl(var(--primary) / 0.5)',
            color: 'hsl(var(--foreground))',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
            marginTop: '5.5rem',
          },
          className: 'group toast-notification',
          duration: 2500,
          closeButton: true,
        }}
        theme="light"
        richColors
        closeButton
      />
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

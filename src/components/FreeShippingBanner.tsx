import { useState, useEffect } from "react";
import { Truck, X, ShoppingBag, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const FreeShippingBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem("shipping-banner-dismissed");
    if (dismissed) {
      setIsVisible(false);
    } else {
      // Trigger animation after a short delay
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("shipping-banner-dismissed", "true");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 500 }}
          dragElastic={0.1}
          whileDrag={{ scale: 1.02, cursor: "grabbing" }}
          className="fixed top-24 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto relative overflow-hidden group cursor-grab active:cursor-grabbing">
            {/* Gradient Background matching Shop Now button */}
            <div className="absolute inset-0 bg-gradient-hero backdrop-blur-md rounded-full shadow-lg border border-white/20" />

            {/* Subtle Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />

            <div className="relative flex items-center gap-4 py-2 pl-3 pr-3 rounded-full text-white">
              {/* Drag Handle Icon */}
              <div className="flex items-center text-white/40 group-hover:text-white/60 transition-colors pl-1">
                <GripHorizontal className="h-4 w-4" />
              </div>

              {/* Icon Section */}
              <div className="flex items-center justify-center bg-white/10 rounded-full p-1.5 backdrop-blur-sm border border-white/5">
                <Truck className="h-4 w-4 text-yellow-300" />
              </div>

              {/* Text Content */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-sm leading-tight select-none">
                <span className="font-light text-white/90">
                  Get <span className="font-semibold text-white">Free Delivery</span> across Bahrain
                </span>
                <span className="hidden sm:block text-white/40">•</span>
                <span className="text-xs sm:text-sm text-white/90">
                  on orders over <span className="font-bold text-yellow-300">20 BD</span>
                </span>
              </div>

              {/* Action / Dismiss */}
              <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-white/10 scale-95 sm:scale-100">
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 px-3 text-xs bg-white/20 hover:bg-white/30 text-white rounded-full font-medium transition-colors shadow-sm border border-white/20"
                  onClick={() => window.location.href = '/shop'}
                >
                  Shop Now <ShoppingBag className="ml-1.5 h-3 w-3" />
                </Button>

                <button
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                  aria-label="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FreeShippingBanner;

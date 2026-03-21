import { motion } from "framer-motion";
import logo from "@/assets/purrkin-logo.png";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <img
            src={logo}
            alt="Purrkin Pets"
            className="h-24 md:h-28 mx-auto mb-4"
          />
        </motion.div>

        {/* Main Message Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-card border border-border rounded-xl shadow-lg p-8 md:p-10 mb-8"
        >
          <div className="text-5xl mb-5">🕊️</div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Temporarily Closed
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
            Due to the current situation in Bahrain, our online store and delivery services are
            <strong className="text-primary"> temporarily suspended</strong> to ensure the safety of our team and customers.
          </p>
          <div className="border-t border-border pt-6">
            <p className="text-muted-foreground text-base">
              We care about you and your pets. We will be back online as soon as conditions improve.
              Stay safe! 🙏
            </p>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          <p className="text-muted-foreground text-sm">
            For urgent inquiries, you can reach us on:
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://www.instagram.com/purrkinpets.bh/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-5 py-2.5 rounded-full transition-colors text-sm font-medium border border-accent/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-muted-foreground text-xs mt-10"
        >
          © 2026 Purrkin Pet Store. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Maintenance;

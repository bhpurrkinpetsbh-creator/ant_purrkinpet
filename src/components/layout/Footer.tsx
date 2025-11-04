import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Purrkin Pets</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your One Stop Pet Paradise in Bahrain offering quality products and services for your beloved companions.
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/purrkinpets.bh/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop?category=cats" className="text-muted-foreground hover:text-primary transition-colors">Cats</Link></li>
              <li><Link to="/shop?category=dogs" className="text-muted-foreground hover:text-primary transition-colors">Dogs</Link></li>
              <li><Link to="/shop?category=fish" className="text-muted-foreground hover:text-primary transition-colors">Fish</Link></li>
              <li><Link to="/shop?category=birds" className="text-muted-foreground hover:text-primary transition-colors">Birds</Link></li>
              <li><Link to="/shop?category=rabbits" className="text-muted-foreground hover:text-primary transition-colors">Small Pets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services & Info</h4>
            <ul className="space-y-2 text-sm">
              {/* <li><Link to="/appointments" className="text-muted-foreground hover:text-primary transition-colors">Book Appointment</Link></li> */} {/* DISABLED: Grooming services temporarily closed */}
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/delivery" className="text-muted-foreground hover:text-primary transition-colors">Delivery Info</Link></li>
            </ul>
            
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-sm">Find Us</h5>
              <div className="w-full h-[200px] rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3577.3!2d50.6468!3d26.2472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49a8e8c8c8c8c8%3A0x0!2s7JJW%2BVQ%20Galali!5e0!3m2!1sen!2sbh!4v1234567890!5m2!1sen!2sbh"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Purrkin Pets Location - 7JJW+VQ Galali, Bahrain"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact & Hours</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Shop A2136, Near Al Salam Bank, Road 5541, Block 255, Galali, Al Muharraq, Bahrain</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+973 3595 7800</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>purrkinpets@gmail.com</span>
              </li>
              <li className="text-muted-foreground">
                <p className="font-medium mb-1">🛍 Shop Hours:</p>
                <p>Daily 10am–1pm & 4–11pm</p>
              </li>
              {/* <li className="text-muted-foreground">
                <p className="font-medium mb-1">✂️ Grooming:</p>
                <p>Mon–Sat 10am–1pm & 4–11pm</p>
              </li> */} {/* DISABLED: Grooming services temporarily closed */}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Purrkin Pets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

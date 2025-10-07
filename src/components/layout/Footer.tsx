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
              <li><Link to="/appointments" className="text-muted-foreground hover:text-primary transition-colors">Book Appointment</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/delivery" className="text-muted-foreground hover:text-primary transition-colors">Delivery Info</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact & Hours</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Galali, Bahrain</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+973 3595 7800</span>
              </li>
              <li className="text-muted-foreground">
                <p className="font-medium mb-1">🛍 Shop Hours:</p>
                <p>Daily 10am–1pm & 4–11pm</p>
              </li>
              <li className="text-muted-foreground">
                <p className="font-medium mb-1">✂️ Grooming:</p>
                <p>Mon–Sat 10am–1pm & 4–11pm</p>
              </li>
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

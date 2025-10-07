import { Link } from "react-router-dom";
import { ShoppingCart, User, Search, Calendar, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-hero p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all">
            <PawPrint className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Purrkin Pets
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors">
            Shop
          </Link>
          <Link to="/appointments" className="text-sm font-medium hover:text-primary transition-colors">
            Appointments
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 w-full"
              />
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
              0
            </span>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link to="/appointments">
              <Calendar className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link to="/auth">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

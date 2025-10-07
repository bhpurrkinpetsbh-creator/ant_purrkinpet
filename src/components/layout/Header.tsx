import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Calendar, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logo from "@/assets/purrkin-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useState, useEffect } from "react";
import { toast } from "sonner";
const Header = () => {
  const {
    cartCount
  } = useCart();
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({
      data: {
        user
      }
    }) => {
      setUser(user);
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };
  return <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Purrkin Pets" className="h-16 w-16 transition-transform group-hover:scale-105" />
          <span className="font-display text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent hidden sm:inline">PURRKIN </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors">
            Shop
          </Link>
          <Link to="/appointments" className="text-sm font-medium hover:text-primary transition-colors">
            Appointments
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
            Contact Us
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search products..." className="pl-9 w-full" />
            </div>
          </div>

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link to="/appointments">
              <Calendar className="h-5 w-5" />
            </Link>
          </Button>

          {user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">My Account</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/cart" className="cursor-pointer">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart ({cartCount})
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Button variant="ghost" size="icon" asChild>
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>}
        </div>
      </div>
    </header>;
};
export default Header;
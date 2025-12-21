import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, LogOut, Package, Shield, Heart, Dog, Cat, Bird, Fish, Rabbit, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/purrkin-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CategoryMegaMenu } from "@/components/layout/CategoryMegaMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

const Header = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [wishlistPulse, setWishlistPulse] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({
      data: { user }
    }) => {
      setUser(user);
      if (user) {
        fetchUserProfile(user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 600);
    };
    window.addEventListener('cart:item-added', handleCartUpdate);
    return () => window.removeEventListener('cart:item-added', handleCartUpdate);
  }, []);

  useEffect(() => {
    const handleWishlistUpdate = () => {
      setWishlistPulse(true);
      setTimeout(() => setWishlistPulse(false), 500);
    };
    window.addEventListener('wishlist:updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist:updated', handleWishlistUpdate);
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('customers')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (data) {
      setUserProfile(data);
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!roleData);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        {/* Main Header Row */}
        <div className="border-b">
          <div className="container flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img src={logo} alt="Purrkin Pets" className="h-10 w-10 transition-transform group-hover:scale-105" />
              <span className="font-display text-lg font-bold bg-gradient-hero bg-clip-text text-transparent hidden sm:inline">PURRKIN PETS</span>
            </Link>

            {/* Category Navigation - Center */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <CategoryMegaMenu />
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1">
              {/* Search Icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="hover:bg-transparent hover:text-primary transition-colors"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist Icon */}
              <Button variant="ghost" size="icon" className="relative hover:bg-transparent hover:text-primary transition-colors" asChild>
                <Link to="/wishlist">
                  <Heart className={`h-5 w-5 transition-colors ${wishlistPulse ? 'animate-heart-pulse text-red-500 fill-red-500' : ''}`} />
                  {wishlistCount > 0 && (
                    <span className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold ${wishlistPulse ? 'animate-badge-bounce' : ''}`}>
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Cart Icon */}
              <Button variant="ghost" size="icon" className="relative hover:bg-transparent hover:text-primary transition-colors" asChild data-cart-icon>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold ${cartPulse ? 'animate-badge-bounce' : ''}`}>
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* User Icon */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-transparent hover:text-primary transition-colors">
                      <div className="relative">
                        <User className={`h-5 w-5 ${user ? 'text-green-600' : ''}`} />
                        {user && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background" />
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userProfile?.full_name || 'My Account'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <Badge variant="secondary" className="w-fit mt-1 bg-green-100 text-green-700">Signed In</Badge>
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
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" className="hover:bg-transparent hover:text-primary transition-colors" asChild>
                  <Link to="/auth">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Category Row - Only visible on mobile/tablet */}
        <div className="lg:hidden border-b bg-muted/30">
          <div className="container overflow-x-auto">
            <div className="flex items-center justify-start gap-4 py-2 min-w-max">
              <Link to="/shop?category=dogs" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Dog className="h-3.5 w-3.5 text-primary" />
                Dogs
              </Link>
              <Link to="/shop?category=cats" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Cat className="h-3.5 w-3.5 text-primary" />
                Cats
              </Link>
              <Link to="/shop?category=birds" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Bird className="h-3.5 w-3.5 text-primary" />
                Birds
              </Link>
              <Link to="/shop?category=fish" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Fish className="h-3.5 w-3.5 text-primary" />
                Fish
              </Link>
              <Link to="/shop?category=small-pets" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Rabbit className="h-3.5 w-3.5 text-primary" />
                Small Pets
              </Link>
              <Link to="/shop" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                All Products
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
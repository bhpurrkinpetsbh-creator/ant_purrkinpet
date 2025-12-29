import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, LogOut, Package, Shield, Heart, Dog, Cat, Bird, Fish, Rabbit, LayoutGrid, Sparkles, Turtle } from "lucide-react";
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

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  dogs: <Dog className="h-3.5 w-3.5 text-primary" />,
  cats: <Cat className="h-3.5 w-3.5 text-primary" />,
  birds: <Bird className="h-3.5 w-3.5 text-primary" />,
  fish: <Fish className="h-3.5 w-3.5 text-primary" />,
  "small-pets": <Rabbit className="h-3.5 w-3.5 text-primary" />,
  rabbits: <Rabbit className="h-3.5 w-3.5 text-primary" />,
  turtles: <Turtle className="h-3.5 w-3.5 text-primary" />,
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Header = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [wishlistPulse, setWishlistPulse] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
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

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      console.log('🔍 Header fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order');

      if (!error && data) {
        console.log('✅ Header categories fetched:', data);
        setCategories(data);
      } else if (error) {
        console.error('❌ Header categories fetch error:', error);
      }
      setCategoriesLoading(false);
    };
    fetchCategories();

    // Listen for category updates from Category Management
    const handleCategoriesUpdate = () => {
      console.log('📥 Header received categories:updated event');
      fetchCategories();
    };
    window.addEventListener('categories:updated', handleCategoriesUpdate);
    return () => window.removeEventListener('categories:updated', handleCategoriesUpdate);
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

  // Get icon for category, fallback to Sparkles
  const getCategoryIcon = (slug: string) => {
    return CATEGORY_ICONS[slug] || <Sparkles className="h-3.5 w-3.5 text-primary" />;
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

            {/* Search Bar - Center */}
            <div className="hidden md:flex flex-1 max-w-xl mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for pet food, toys, usage..."
                  className="w-full h-10 pl-10 pr-4 rounded-full border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setIsSearchOpen(true)}
                  readOnly
                />
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1">
              {/* Search Icon (Mobile Only) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden hover:bg-transparent hover:text-primary transition-colors"
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
        {/* Navigation Row - Desktop */}
        <div className="hidden lg:block border-b bg-white shadow-sm">
          <div className="container flex justify-center py-0">
            <CategoryMegaMenu />
          </div>
        </div>

        {/* Mobile Category Row - Dynamically fetched from database */}
        <div className="lg:hidden border-b bg-muted/30">
          <div className="container overflow-x-auto">
            <div className="flex items-center justify-start gap-4 py-2 min-w-max">
              {categoriesLoading ? (
                // Skeleton loader while categories are loading
                <>
                  <div className="h-5 w-16 bg-muted-foreground/20 animate-pulse rounded" />
                  <div className="h-5 w-12 bg-muted-foreground/20 animate-pulse rounded" />
                  <div className="h-5 w-20 bg-muted-foreground/20 animate-pulse rounded" />
                  <div className="h-5 w-14 bg-muted-foreground/20 animate-pulse rounded" />
                  <div className="h-5 w-18 bg-muted-foreground/20 animate-pulse rounded" />
                </>
              ) : (
                <>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/shop?category=${category.slug}`}
                      className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
                    >
                      {getCategoryIcon(category.slug)}
                      {category.name}
                    </Link>
                  ))}
                  <Link to="/shop" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                    <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                    All Products
                  </Link>
                </>
              )}
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
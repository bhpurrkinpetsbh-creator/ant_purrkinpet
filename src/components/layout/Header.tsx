import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Calendar, LogOut, Package, Shield, Heart, Warehouse, PackagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/purrkin-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { intelligentProductSearch } from "@/utils/intelligentSearch";
const Header = () => {
  const {
    cartCount
  } = useCart();
  const { wishlistCount } = useWishlist();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [cartPulse, setCartPulse] = useState(false);
  const [wishlistPulse, setWishlistPulse] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({
      data: {
        user
      }
    }) => {
      setUser(user);
      if (user) {
        fetchUserProfile(user.id);
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
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

  // Fetch all products for search suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, image_url, category:categories(name)")
        .eq("is_active", true)
        .limit(100);

      if (data) {
        setAllProducts(data);
      }
    };

    fetchProducts();
  }, []);

  // Handle search input changes and show suggestions
  useEffect(() => {
    if (headerSearch.trim().length > 1) {
      const results = intelligentProductSearch(allProducts, headerSearch);
      setSearchSuggestions(results.slice(0, 5)); // Show top 5 results
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [headerSearch, allProducts]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

    // Check if user is admin
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(headerSearch)}`);
      setHeaderSearch("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: any) => {
    navigate(`/product/${product.slug}`);
    setHeaderSearch("");
    setShowSuggestions(false);
  };
  return <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
    <div className="container flex h-20 items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <img src={logo} alt="Purrkin Pets" className="h-16 w-16 transition-transform group-hover:scale-105" />
        <span className="font-display text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent hidden sm:inline">PURRKIN PETS</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6">
        <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors">
          Shop
        </Link>
        {/* <Link to="/appointments" className="text-sm font-medium hover:text-primary transition-colors">
            Appointments
          </Link> */} {/* DISABLED: Grooming services temporarily closed */}
        <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
          Contact Us
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 max-w-sm">
          <div className="relative flex-1" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 w-full"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onFocus={() => headerSearch.trim().length > 1 && setShowSuggestions(true)}
            />

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {searchSuggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">{product.price.toFixed(3)} BD</p>
                  </button>
                ))}

                {/* View all results */}
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-sm text-center text-primary hover:bg-primary/10 transition-colors font-medium"
                >
                  View all results for "{headerSearch}"
                </button>
              </div>
            )}
          </div>
        </form>

        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link to="/wishlist">
            <Heart className={`h-5 w-5 transition-colors ${wishlistPulse ? 'animate-heart-pulse text-red-500 fill-red-500' : ''}`} />
            {wishlistCount > 0 && <span className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold ${wishlistPulse ? 'animate-badge-bounce' : ''}`}>
              {wishlistCount}
            </span>}
          </Link>
        </Button>

        <Button variant="ghost" size="icon" className="relative" asChild data-cart-icon>
          <Link to="/cart">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && <span className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold ${cartPulse ? 'animate-badge-bounce' : ''
              }`}>
              {cartCount}
            </span>}
          </Link>
        </Button>

        {/* <Button variant="ghost" size="icon" asChild>
            <Link to="/appointments">
              <Calendar className="h-5 w-5" />
            </Link>
          </Button> */} {/* DISABLED: Grooming services temporarily closed */}

        {user ? <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 group">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <User className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium leading-none">
                    {userProfile?.full_name || 'My Account'}
                  </span>
                  <span className="text-xs text-foreground group-hover:text-primary-foreground truncate max-w-[120px]">
                    Signed In
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userProfile?.full_name || 'My Account'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <Badge variant="secondary" className="w-fit mt-1">Logged In</Badge>
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
        </DropdownMenu> : <Button variant="outline" size="sm" asChild>
          <Link to="/auth" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        </Button>}
      </div>
    </div>
  </header>;
};
export default Header;
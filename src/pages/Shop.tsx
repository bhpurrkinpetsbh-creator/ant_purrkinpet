import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ShoppingCart, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  category_id: string | null;
  categories: { name: string; slug: string } | null;
  compare_at_price: number | null;
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const searchParamQuery = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    setSearchQuery(searchParamQuery);
  }, [searchParamQuery]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          image_url,
          stock_quantity,
          category_id,
          compare_at_price,
          categories (
            name,
            slug
          )
        `)
        .eq("is_active", true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("slug")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      const categoryList = ["all", ...(data?.map(c => c.slug) || [])];
      setCategories(categoryList);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    if (addingProductId) return;
    
    setAddingProductId(productId);
    
    // Create flying cart animation
    const button = buttonRefs.current[productId];
    const buttonRect = button?.getBoundingClientRect();
    const cartIcon = document.querySelector('[data-cart-icon]');
    const cartRect = cartIcon?.getBoundingClientRect();
    
    if (buttonRect && cartRect) {
      const flyingCart = document.createElement('div');
      flyingCart.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      `;
      flyingCart.style.cssText = `
        position: fixed;
        left: ${buttonRect.left + buttonRect.width / 2}px;
        top: ${buttonRect.top + buttonRect.height / 2}px;
        z-index: 9999;
        pointer-events: none;
        color: hsl(var(--primary));
      `;
      
      const xDistance = cartRect.left + cartRect.width / 2 - (buttonRect.left + buttonRect.width / 2);
      const yDistance = cartRect.top + cartRect.height / 2 - (buttonRect.top + buttonRect.height / 2);
      
      flyingCart.style.setProperty('--x-mid', `${xDistance * 0.4}px`);
      flyingCart.style.setProperty('--y-mid', `${yDistance * 0.4 - 50}px`);
      flyingCart.style.setProperty('--x-end', `${xDistance}px`);
      flyingCart.style.setProperty('--y-end', `${yDistance}px`);
      
      flyingCart.classList.add('animate-fly-to-cart');
      document.body.appendChild(flyingCart);
      
      setTimeout(() => {
        flyingCart.remove();
        window.dispatchEvent(new CustomEvent('cart:item-added'));
      }, 800);
    }
    
    const success = await addToCart(productId, 1);
    if (success) {
      toast({
        title: "Added to cart",
        description: productName,
      });
      
      setTimeout(() => {
        setAddingProductId(null);
      }, 1200);
    } else {
      setAddingProductId(null);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const categorySlug = product.categories?.slug || "";
      const matchesCategory = categoryParam === "all" || categorySlug === categoryParam;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "featured":
        default:
          return 0;
      }
    });

  return (
    <div className="container py-8">
      {/* Free Shipping Banner - Creative & Animated */}
      <div 
        className="shipping-banner relative px-8 py-6 rounded-lg mb-6 text-center animate-slide-in-top animate-glow-pulse overflow-hidden"
        role="banner"
        aria-label="Free shipping announcement"
      >
        {/* Animated Border Effect (applied via CSS ::before) */}
        <div className="absolute inset-0 animate-border-spin opacity-75 pointer-events-none" style={{ borderRadius: 'inherit' }}></div>
        
        {/* Floating Sparkles */}
        <div className="sparkle text-yellow-300 top-4 left-[10%] animate-sparkle-float" style={{ animationDelay: '0s' }}>✨</div>
        <div className="sparkle text-yellow-300 top-4 right-[15%] animate-sparkle-float" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="sparkle text-yellow-300 top-4 left-[80%] animate-sparkle-float hidden sm:block" style={{ animationDelay: '1s' }}>✨</div>
        <div className="sparkle text-yellow-300 top-4 left-[25%] animate-sparkle-float hidden md:block" style={{ animationDelay: '1.5s' }}>💫</div>
        <div className="sparkle text-yellow-300 top-4 right-[60%] animate-sparkle-float hidden lg:block" style={{ animationDelay: '2s' }}>⭐</div>
        
            {/* Letter Trail - "FREE SHIPPING" emerges from truck */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full overflow-visible pointer-events-none z-19">
              {['F', 'R', 'E', 'E', ' ', 'S', 'H', 'I', 'P', 'P', 'I', 'N', 'G'].map((letter, index) => (
                letter !== ' ' && (
                  <span
                    key={index}
                    className="absolute text-xl sm:text-2xl lg:text-3xl font-black tracking-wider animate-letter-trail"
                    style={{
                      left: '10%',
                      animationDelay: `${1 + index * 0.25}s`,
                      color: index < 4 ? 'hsl(24 100% 63%)' : 'white',
                      textShadow: index < 4 
                        ? '0 2px 8px rgba(251, 146, 60, 0.5), 0 0 20px hsl(24 100% 63%)' 
                        : '0 2px 8px rgba(0,0,0,0.4), 0 0 15px rgba(255,255,255,0.6)',
                      filter: 'drop-shadow(0 0 8px currentColor)',
                      WebkitTextStroke: '0.5px rgba(0,0,0,0.3)'
                    }}
                  >
                    {letter}
                  </span>
                )
              ))}
            </div>

            {/* Realistic Animated Truck - Enhanced with Direction Cues */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 animate-truck-drive-realistic pointer-events-none z-20">
              <svg className="w-20 h-10 sm:w-24 sm:h-12 lg:w-28 lg:h-14" viewBox="0 0 140 60" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Gradients */}
                  <linearGradient id="truckGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(24 100% 63%)" />
                    <stop offset="100%" stopColor="hsl(30 100% 70%)" />
                  </linearGradient>
                  <linearGradient id="cargoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(24 95% 58%)" />
                    <stop offset="100%" stopColor="hsl(30 95% 65%)" />
                  </linearGradient>
                  <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(190 80% 70%)" />
                    <stop offset="100%" stopColor="hsl(200 70% 60%)" />
                  </linearGradient>
                  <radialGradient id="wheelGradient">
                    <stop offset="0%" stopColor="hsl(0 0% 25%)" />
                    <stop offset="100%" stopColor="hsl(0 0% 15%)" />
                  </radialGradient>
                </defs>

                {/* Speed lines (behind truck - shows forward motion) */}
                <g className="speed-lines" opacity="0.3">
                  <line x1="5" y1="33" x2="12" y2="33" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="38" x2="10" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="43" x2="13" y2="43" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </g>

                {/* Shadow */}
                <ellipse cx="70" cy="56" rx="45" ry="4" fill="rgba(0,0,0,0.2)" />

                {/* Cargo Bed - Open at back with glow */}
                <rect x="45" y="30" width="50" height="18" fill="url(#cargoGradient)" stroke="hsl(0 0% 30%)" strokeWidth="1.5" rx="2" />
                <rect x="45" y="30" width="50" height="2" fill="hsl(24 80% 50%)" opacity="0.8" />
                
                {/* Open cargo bed back with glow effect */}
                <path d="M 95 30 L 98 32 L 98 46 L 95 48 Z" fill="hsl(24 90% 55%)" opacity="0.7" />
                <circle cx="96" cy="39" r="8" fill="hsl(24 100% 63%)" opacity="0.3" className="animate-glow-pulse" />

                {/* Truck Cab */}
                <path d="M 18 35 L 40 35 L 40 48 L 18 48 L 15 42 Z" fill="url(#truckGradient)" stroke="hsl(0 0% 30%)" strokeWidth="1.5" />
                
                {/* Windshield - ANGLED BACKWARD (shows forward motion!) */}
                <path d="M 27 35 L 32 33 L 32 48 L 27 48 Z" fill="url(#windowGradient)" opacity="0.75" stroke="hsl(0 0% 40%)" strokeWidth="0.8" />
                
                {/* Side window */}
                <rect x="20" y="37" width="5" height="9" fill="url(#windowGradient)" opacity="0.7" stroke="hsl(0 0% 40%)" strokeWidth="0.8" rx="0.5" />

                {/* Door line */}
                <line x1="25" y1="36" x2="25" y2="48" stroke="hsl(0 0% 30%)" strokeWidth="1" opacity="0.6" />

                {/* Front Grille (vertical lines) */}
                <g opacity="0.8">
                  <line x1="16" y1="40" x2="16" y2="47" stroke="hsl(0 0% 25%)" strokeWidth="0.8" />
                  <line x1="17.5" y1="40" x2="17.5" y2="47" stroke="hsl(0 0% 25%)" strokeWidth="0.8" />
                  <line x1="19" y1="40" x2="19" y2="47" stroke="hsl(0 0% 25%)" strokeWidth="0.8" />
                </g>

                {/* Side Mirror */}
                <rect x="32" y="38" width="3" height="4" fill="hsl(0 0% 30%)" stroke="hsl(0 0% 20%)" strokeWidth="0.5" rx="0.5" />
                <line x1="32" y1="40" x2="28" y2="40" stroke="hsl(0 0% 35%)" strokeWidth="1" />

                {/* Antenna - bent backward from wind! */}
                <line x1="38" y1="35" x2="36" y2="28" stroke="hsl(0 0% 40%)" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="36" cy="28" r="1.5" fill="hsl(0 84% 60%)" />

                {/* Headlights */}
                <circle cx="16" cy="38" r="1.5" fill="hsl(48 100% 70%)" className="animate-headlight-blink" />
                <circle cx="16" cy="46" r="1.5" fill="hsl(0 84% 60%)" opacity="0.8" />

                {/* Connecting piece between cab and cargo */}
                <rect x="40" y="35" width="5" height="13" fill="hsl(24 90% 60%)" stroke="hsl(0 0% 30%)" strokeWidth="1" />

                {/* Front Wheels */}
                <g>
                  {/* Wheel 1 */}
                  <circle cx="30" cy="50" r="6" fill="url(#wheelGradient)" stroke="hsl(0 0% 10%)" strokeWidth="1.5" />
                  <circle cx="30" cy="50" r="3.5" fill="hsl(0 0% 35%)" />
                  <g className="animate-wheel-spin" style={{ transformOrigin: '30px 50px' }}>
                    <line x1="30" y1="46.5" x2="30" y2="53.5" stroke="hsl(0 0% 50%)" strokeWidth="1" />
                    <line x1="26.5" y1="50" x2="33.5" y2="50" stroke="hsl(0 0% 50%)" strokeWidth="1" />
                    <line x1="27.5" y1="47.5" x2="32.5" y2="52.5" stroke="hsl(0 0% 50%)" strokeWidth="1" />
                    <line x1="27.5" y1="52.5" x2="32.5" y2="47.5" stroke="hsl(0 0% 50%)" strokeWidth="1" />
                  </g>
                  <circle cx="30" cy="50" r="1.5" fill="hsl(0 0% 45%)" />
                </g>

                {/* Back Wheels */}
                <g>
                  {/* Wheel 2 */}
                  <circle cx="80" cy="50" r="6" fill="url(#wheelGradient)" stroke="hsl(0 0% 10%)" strokeWidth="1.5" />
                  <circle cx="80" cy="50" r="3.5" fill="hsl(0 0% 35%)" />
                  <g className="animate-wheel-spin" style={{ transformOrigin: '80px 50px' }}>
                    <line x1="80" y1="46.5" x2="80" y2="53.5" stroke="hsl(0 0% 50%)" strokeWidth="1" />
                    <line x1="76.5" y1="50" x2="83.5" y2="50" stroke="hsl(0 0% 50%)" strokeWidth="1" />
                    <line x1="77.5" y1="47.5" x2="82.5" y2="52.5" stroke="hsl(0 0% 50%)" strokeWidth="1" />
                    <line x1="77.5" y1="52.5" x2="82.5" y2="47.5" stroke="hsl(0 0% 50%)" strokeWidth="1" />
                  </g>
                  <circle cx="80" cy="50" r="1.5" fill="hsl(0 0% 45%)" />
                </g>

                {/* Exhaust Smoke Trail */}
                <g className="exhaust" opacity="0.6">
                  <circle cx="20" cy="48" r="3" fill="hsl(0 0% 60%)" className="animate-exhaust-puff" style={{ animationDelay: '0s' }} />
                  <circle cx="15" cy="46" r="4" fill="hsl(0 0% 65%)" className="animate-exhaust-puff" style={{ animationDelay: '0.3s' }} />
                  <circle cx="10" cy="47" r="3.5" fill="hsl(0 0% 70%)" className="animate-exhaust-puff" style={{ animationDelay: '0.6s' }} />
                </g>
              </svg>
            </div>
        
        {/* Main Content */}
        <div className="relative z-10">
          <p className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg">
            <span className="inline-block">🇧🇭</span>
            {" "}FREE SHIPPING ON ALL PRODUCTS IN BAHRAIN!{" "}
            <span className="inline-block">🎉</span>
          </p>
          <p className="text-white/90 text-sm sm:text-base mt-1 font-medium">
            No minimum order • Fast delivery • Island-wide coverage
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Shop</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="font-display text-4xl font-bold mb-2">Shop</h1>
        <p className="text-muted-foreground">Discover premium pet products for your beloved companions</p>
      </div>

      {/* Filters - Sticky */}
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 mb-4 border-b">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-4">
            <Select value={categoryParam} onValueChange={(value) => setSearchParams({ category: value })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Quick Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={categoryParam === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSearchParams({ category: "all" })}
          >
            All
          </Button>
          {categories.filter(cat => cat !== "all").map((cat) => (
            <Button
              key={cat}
              variant={categoryParam === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchParams({ category: cat })}
              className="whitespace-nowrap"
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const inStock = product.stock_quantity > 0;
              return (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all">
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square bg-white relative overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      {!inStock && (
                        <Badge className="absolute top-2 right-2 bg-destructive">Out of Stock</Badge>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 space-y-3">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-primary">{product.price.toFixed(2)} BHD</span>
                        {product.compare_at_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {product.compare_at_price.toFixed(2)} BHD
                          </span>
                        )}
                      </div>
                      {product.compare_at_price && (
                        <Badge variant="destructive" className="text-xs">
                          {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    <Button
                      ref={(el) => buttonRefs.current[product.id] = el}
                      className={`w-full transition-all duration-300 ${
                        addingProductId === product.id ? 'animate-button-success' : ''
                      }`}
                      variant={inStock ? "default" : "secondary"}
                      disabled={!inStock || addingProductId === product.id}
                      onClick={() => handleAddToCart(product.id, product.name)}
                    >
                      {addingProductId === product.id ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Added!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {inStock ? "Add to Cart" : "Out of Stock"}
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found. Try adjusting your filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shop;

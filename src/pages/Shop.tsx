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
        
        {/* Realistic Animated Truck carrying "SHIPPING" */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 animate-truck-drive-realistic pointer-events-none z-20">
          <svg className="w-24 h-12 sm:w-28 sm:h-14 lg:w-32 lg:h-16" viewBox="0 0 160 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Exhaust smoke trail */}
            <g className="exhaust-trail">
              <circle cx="15" cy="55" r="4" fill="hsl(0 0% 60%)" opacity="0" className="animate-exhaust-puff" style={{ animationDelay: '0s' }} />
              <circle cx="10" cy="53" r="3" fill="hsl(0 0% 60%)" opacity="0" className="animate-exhaust-puff" style={{ animationDelay: '0.2s' }} />
              <circle cx="5" cy="54" r="3.5" fill="hsl(0 0% 60%)" opacity="0" className="animate-exhaust-puff" style={{ animationDelay: '0.4s' }} />
            </g>
            
            {/* Truck shadow */}
            <ellipse cx="80" cy="65" rx="45" ry="4" fill="hsl(0 0% 0%)" opacity="0.15" />
            
            {/* Cargo bed with "SHIPPING" text */}
            <rect x="45" y="28" width="65" height="30" rx="3" fill="url(#cargoGradient)" stroke="hsl(24 100% 50%)" strokeWidth="2" className="animate-cargo-bounce" />
            <text x="77" y="47" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle" className="animate-cargo-bounce" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>SHIPPING</text>
            
            {/* Truck cab body */}
            <path d="M 20 35 L 20 55 L 45 55 L 45 28 L 35 28 L 30 35 Z" fill="url(#truckGradient)" stroke="hsl(24 100% 50%)" strokeWidth="2" />
            
            {/* Cab details */}
            <path d="M 30 35 L 35 35 L 35 28 L 30 35 Z" fill="hsl(24 80% 50%)" opacity="0.6" />
            
            {/* Window */}
            <rect x="23" y="37" width="12" height="10" rx="1.5" fill="url(#windowGradient)" stroke="hsl(200 80% 70%)" strokeWidth="1" />
            
            {/* Headlight */}
            <circle cx="19" cy="45" r="2.5" fill="hsl(50 100% 60%)" className="animate-headlight-blink" opacity="0.9" />
            
            {/* Front bumper */}
            <rect x="16" y="53" width="4" height="3" rx="1" fill="hsl(0 0% 30%)" />
            
            {/* Wheels base */}
            <circle cx="35" cy="58" r="8" fill="hsl(0 0% 20%)" />
            <circle cx="95" cy="58" r="8" fill="hsl(0 0% 20%)" />
            
            {/* Wheel rims */}
            <circle cx="35" cy="58" r="5" fill="hsl(0 0% 40%)" className="animate-wheel-spin" />
            <circle cx="95" cy="58" r="5" fill="hsl(0 0% 40%)" className="animate-wheel-spin" />
            
            {/* Wheel spokes */}
            <g className="animate-wheel-spin" style={{ transformOrigin: '35px 58px' }}>
              <line x1="35" y1="53" x2="35" y2="63" stroke="hsl(0 0% 60%)" strokeWidth="1.5" />
              <line x1="30" y1="58" x2="40" y2="58" stroke="hsl(0 0% 60%)" strokeWidth="1.5" />
            </g>
            <g className="animate-wheel-spin" style={{ transformOrigin: '95px 58px' }}>
              <line x1="95" y1="53" x2="95" y2="63" stroke="hsl(0 0% 60%)" strokeWidth="1.5" />
              <line x1="90" y1="58" x2="100" y2="58" stroke="hsl(0 0% 60%)" strokeWidth="1.5" />
            </g>
            
            {/* Connection between cab and cargo */}
            <rect x="43" y="40" width="4" height="15" fill="hsl(24 100% 55%)" />
            
            {/* Gradients */}
            <defs>
              <linearGradient id="truckGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(24 100% 63%)" />
                <stop offset="100%" stopColor="hsl(24 100% 53%)" />
              </linearGradient>
              <linearGradient id="cargoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(30 100% 70%)" />
                <stop offset="100%" stopColor="hsl(24 100% 60%)" />
              </linearGradient>
              <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(200 80% 85%)" />
                <stop offset="100%" stopColor="hsl(200 80% 70%)" />
              </linearGradient>
            </defs>
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

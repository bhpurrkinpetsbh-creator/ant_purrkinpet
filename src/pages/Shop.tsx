// Version: 1.0.2 - Added intelligent search
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
import { intelligentProductSearch } from "@/utils/intelligentSearch";
import { parseSearchQuery, SearchIntent } from "@/utils/naturalLanguageParser";
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
  description: string | null;
  price: number;
  image_url: string;
  stock_quantity: number;
  category_id: string | null;
  brand_id: string | null;
  categories: { name: string; slug: string } | null;
  compare_at_price: number | null;
  offer_price: number | null;
  is_on_offer: boolean | null;
  sku: string | null;
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const searchParamQuery = searchParams.get("search") || "";
  const offersParam = searchParams.get("offers") === "true";
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [sortBy, setSortBy] = useState("sku-asc");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [nlIntent, setNlIntent] = useState<SearchIntent | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Subcategory definitions for Dogs and Cats
  const subcategories: Record<string, { label: string; keywords: string[] }[]> = {
    dogs: [
      { label: "All", keywords: [] },
      { label: "Dry Food", keywords: ["dry food", "kibble", "dry"] },
      { label: "Wet Food", keywords: ["wet food", "canned", "wet"] },
      { label: "Treats", keywords: ["treat", "snack", "biscuit", "chew"] },
      { label: "Toys", keywords: ["toy", "ball", "rope", "plush"] },
      { label: "Accessories", keywords: ["collar", "leash", "harness", "bed", "bowl"] },
    ],
    cats: [
      { label: "All", keywords: [] },
      { label: "Dry Food", keywords: ["dry food", "kibble", "dry"] },
      { label: "Wet Food", keywords: ["wet food", "canned", "wet"] },
      { label: "Treats", keywords: ["treat", "snack"] },
      { label: "Toys", keywords: ["toy", "mouse", "feather", "ball"] },
      { label: "Litter", keywords: ["litter", "litter box", "sand"] },
    ],
  };

  useEffect(() => {
    setSearchQuery(searchParamQuery);
    if (searchParamQuery) {
      const intent = parseSearchQuery(searchParamQuery);
      setNlIntent(intent);
      // If the intent found a category, we update our local state
      if (intent.category && intent.category !== "all") {
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.set("category", intent.category!);
          return newParams;
        }, { replace: true });
      }
      if (intent.subcategory) {
        setSelectedSubcategory(intent.subcategory);
      }
    } else {
      setNlIntent(null);
    }
  }, [searchParamQuery, setSearchParams]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset subcategory when category changes
    setSelectedSubcategory(null);
  }, [categoryParam]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          sku,
          image_url,
          stock_quantity,
          category_id,
          brand_id,
          compare_at_price,
          offer_price,
          is_on_offer,
          categories (
            name,
            slug
          )
        `)
        .eq("is_active", true);

      if (error) throw error;
      setProducts((data || []) as Product[]);
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

  // Filter products by category first
  const categoryFilteredProducts = products.filter(product => {
    const categorySlug = product.categories?.slug || "";
    const matchesCategory = categoryParam === "all" || categorySlug === categoryParam;

    // If offers filter is active, only show products marked as "On Offer"
    if (offersParam) {
      return matchesCategory && product.is_on_offer === true;
    }

    return matchesCategory;
  });

  // Apply subcategory filter if selected
  const subcategoryFilteredProducts = selectedSubcategory && selectedSubcategory !== "All"
    ? categoryFilteredProducts.filter(product => {
      const currentSubcategories = subcategories[categoryParam] || [];
      const selectedSub = currentSubcategories.find(s => s.label === selectedSubcategory);
      if (!selectedSub || selectedSub.keywords.length === 0) return true;

      const productName = product.name.toLowerCase();
      const productDesc = (product.description || "").toLowerCase();
      return selectedSub.keywords.some(keyword =>
        productName.includes(keyword.toLowerCase()) || productDesc.includes(keyword.toLowerCase())
      );
    })
    : categoryFilteredProducts;

  // Apply NL intent filters (Price and Brands)
  const nlFilteredProducts = nlIntent
    ? subcategoryFilteredProducts.filter(product => {
      // 1. Price Range Filters
      if (nlIntent.minPrice !== undefined && product.price < nlIntent.minPrice) {
        return false;
      }
      if (nlIntent.maxPrice !== undefined && product.price > nlIntent.maxPrice) {
        return false;
      }

      // 2. Brand Filter (if multiple brands detected, match any)
      if (nlIntent.brands && nlIntent.brands.length > 0) {
        const productName = product.name.toLowerCase();
        const matchesBrand = nlIntent.brands.some((brand: string) => productName.includes(brand.toLowerCase()));
        if (!matchesBrand) return false;
      }

      return true;
    })
    : subcategoryFilteredProducts;

  // Apply intelligent search on NL-filtered products
  const searchedProducts = intelligentProductSearch(
    nlFilteredProducts,
    nlIntent ? nlIntent.searchTerms : searchQuery,
    nlIntent
  );

  // Apply sorting only when NOT searching (preserve relevance order when searching)
  const filteredProducts = searchQuery.trim().length > 0
    ? searchedProducts // Keep relevance-based order from intelligent search
    : searchedProducts.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "sku-asc":
          return (a.sku || "").localeCompare(b.sku || "");
        case "featured":
        default:
          // Default fallback to SKU if no other sort matches (though default state is sku-asc)
          return (a.sku || "").localeCompare(b.sku || "");
      }
    });

  return (
    <div className="container py-8">
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

      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Shop</h1>
          <p className="text-muted-foreground">Discover premium pet products for your beloved companions</p>
        </div>

        {nlIntent && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl animate-fade-in border border-primary/20">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">Smart Search Active</span>
            {nlIntent.minPrice !== undefined && nlIntent.maxPrice !== undefined ? (
              <Badge variant="secondary" className="bg-white/50">{nlIntent.minPrice} - {nlIntent.maxPrice} BD</Badge>
            ) : nlIntent.maxPrice !== undefined ? (
              <Badge variant="secondary" className="bg-white/50">Under {nlIntent.maxPrice} BD</Badge>
            ) : nlIntent.minPrice !== undefined ? (
              <Badge variant="secondary" className="bg-white/50">Over {nlIntent.minPrice} BD</Badge>
            ) : null}
            {nlIntent.category && <Badge variant="secondary" className="bg-white/50">{nlIntent.category}</Badge>}
          </div>
        )}
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
                <SelectItem value="sku-asc">Default (SKU A-Z)</SelectItem>
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

        {/* Subcategory Filters - Only for Dogs and Cats */}
        {(categoryParam === "dogs" || categoryParam === "cats") && subcategories[categoryParam] && (
          <div className="flex gap-2 overflow-x-auto pt-2 scrollbar-hide">
            {subcategories[categoryParam].map((sub) => (
              <Button
                key={sub.label}
                variant={selectedSubcategory === sub.label || (sub.label === "All" && !selectedSubcategory) ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedSubcategory(sub.label === "All" ? null : sub.label)}
                className="whitespace-nowrap text-xs h-7 px-3"
              >
                {sub.label}
              </Button>
            ))}
          </div>
        )}
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
                        {product.is_on_offer && product.offer_price ? (
                          <>
                            <span className="font-bold text-lg text-primary">{product.offer_price.toFixed(2)} BHD</span>
                            <span className="text-sm text-muted-foreground line-through">
                              {product.price.toFixed(2)} BHD
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-lg text-primary">{product.price.toFixed(2)} BHD</span>
                        )}
                      </div>
                      {product.is_on_offer && product.offer_price && (
                        <Badge variant="destructive" className="text-xs">
                          {Math.round((1 - product.offer_price / product.price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    <Button
                      ref={(el) => buttonRefs.current[product.id] = el}
                      className={`w-full transition-all duration-300 ${addingProductId === product.id ? 'animate-button-success' : ''
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

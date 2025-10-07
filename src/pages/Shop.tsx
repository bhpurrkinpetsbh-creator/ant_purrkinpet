import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ShoppingCart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  category_id: string | null;
  categories: { name: string; slug: string } | null;
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

  const handleAddToCart = async (productId: string) => {
    const success = await addToCart(productId, 1);
    if (success) {
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
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
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Shop All Products</h1>
        <p className="text-muted-foreground">Discover premium pet products for your beloved companions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
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
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                      <span className="font-bold text-lg text-primary">{product.price.toFixed(2)} BHD</span>
                    </div>

                    <Button
                      className="w-full"
                      variant={inStock ? "default" : "secondary"}
                      disabled={!inStock}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {inStock ? "Add to Cart" : "Out of Stock"}
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

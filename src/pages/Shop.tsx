import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ShoppingCart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock product data
const products = [
  { id: 1, name: "Premium Cat Food", category: "cats", price: "15.99 BHD", image: "/placeholder.svg", rating: 4.5, inStock: true },
  { id: 2, name: "Interactive Cat Toy", category: "cats", price: "8.50 BHD", image: "/placeholder.svg", rating: 4.8, inStock: true },
  { id: 3, name: "Dog Training Treats", category: "dogs", price: "12.00 BHD", image: "/placeholder.svg", rating: 4.7, inStock: true },
  { id: 4, name: "Aquarium Filter", category: "fish", price: "25.00 BHD", image: "/placeholder.svg", rating: 4.6, inStock: false },
  { id: 5, name: "Rabbit Hay Bundle", category: "rabbits", price: "10.00 BHD", image: "/placeholder.svg", rating: 4.9, inStock: true },
  { id: 6, name: "Dog Collar & Leash Set", category: "dogs", price: "18.50 BHD", image: "/placeholder.svg", rating: 4.4, inStock: true },
];

const categories = ["all", "cats", "dogs", "fish", "birds", "rabbits"];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryParam === "all" || product.category === categoryParam;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all">
            <Link to={`/product/${product.id}`}>
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {!product.inStock && (
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
                <span className="font-bold text-lg text-primary">{product.price}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm">⭐</span>
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
              </div>

              <Button
                className="w-full"
                variant={product.inStock ? "default" : "secondary"}
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No products found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;

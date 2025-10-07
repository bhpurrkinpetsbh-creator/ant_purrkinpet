import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data
  const product = {
    id,
    name: "Premium Cat Food - Chicken & Rice Formula",
    category: "Cat Food",
    price: "15.99 BHD",
    originalPrice: "19.99 BHD",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    stock: 45,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    description: "Our premium cat food is specially formulated with high-quality chicken and rice to provide complete nutrition for your feline friend. Made with natural ingredients and no artificial preservatives.",
    features: [
      "100% natural ingredients",
      "High protein content",
      "Omega-3 & 6 fatty acids",
      "Supports healthy digestion",
      "No artificial colors or flavors"
    ],
    specifications: {
      "Weight": "2kg",
      "Brand": "Purrkin Premium",
      "Life Stage": "Adult",
      "Flavor": "Chicken & Rice",
      "Made In": "USA"
    }
  };

  const handleAddToCart = () => {
    toast.success("Added to cart!", {
      description: `${quantity} x ${product.name}`,
    });
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/shop">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-12 mb-12">
        {/* Images */}
        <div className="space-y-4">
          <Card className="overflow-hidden aspect-square">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </Card>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-2">{product.category}</Badge>
            <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-lg">⭐</span>
                <span className="font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>
              {product.inStock && (
                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                  In Stock: {product.stock} units
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{product.price}</span>
            <span className="text-xl text-muted-foreground line-through">{product.originalPrice}</span>
            <Badge variant="destructive">20% OFF</Badge>
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-gradient-hero hover:opacity-90"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/20 p-2 rounded-lg">
                <Truck className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-sm">Fast Delivery</p>
                <p className="text-xs text-muted-foreground">Same-day in Bahrain</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">Quality Guarantee</p>
                <p className="text-xs text-muted-foreground">100% authentic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="features" className="mb-12">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4 py-6">
          <h3 className="font-semibold text-lg">Product Features</h3>
          <ul className="space-y-2">
            {product.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="specifications" className="py-6">
          <h3 className="font-semibold text-lg mb-4">Specifications</h3>
          <Card className="p-6">
            <dl className="space-y-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2">
                  <dt className="font-medium text-muted-foreground">{key}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="py-6">
          <h3 className="font-semibold text-lg mb-4">Customer Reviews</h3>
          <p className="text-muted-foreground">Reviews coming soon...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetail;

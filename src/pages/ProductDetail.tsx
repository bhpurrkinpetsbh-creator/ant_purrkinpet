import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (name),
            brands (name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);

        // Fetch product images
        const { data: images, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('display_order', { ascending: true });

        if (imagesError) throw imagesError;
        
        // If no additional images, use the main product image
        if (!images || images.length === 0) {
          setProductImages([{ image_url: data.image_url, is_primary: true }]);
        } else {
          setProductImages(images);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    const success = await addToCart(product.id, quantity);
    if (success) {
      toast.success("Added to cart!", {
        description: `${quantity} x ${product.name}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-12 min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

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
            <BreadcrumbLink asChild>
              <Link to="/shop">Shop</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/shop">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-12 mb-12">
        {/* Images */}
        <div className="space-y-4">
          {productImages.length > 1 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {productImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <Card className="overflow-hidden aspect-square bg-white">
                      <Zoom>
                        <img
                          src={image.image_url || '/placeholder.svg'}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-contain p-4"
                        />
                      </Zoom>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          ) : (
            <Card className="overflow-hidden aspect-square bg-white">
              <Zoom>
                <img
                  src={productImages[0]?.image_url || product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              </Zoom>
            </Card>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-2">{product.categories?.name || 'Product'}</Badge>
            <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              {product.stock_quantity > 0 && (
                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                  In Stock: {product.stock_quantity} units
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{product.price} BHD</span>
            {product.compare_at_price && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  {product.compare_at_price} BHD
                </span>
                <Badge variant="destructive">
                  {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                </Badge>
              </>
            )}
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
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
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
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4 py-6">
          <h3 className="font-semibold text-lg">Product Description</h3>
          <p className="text-muted-foreground">{product.description || 'No description available.'}</p>
        </TabsContent>

        <TabsContent value="specifications" className="py-6">
          <h3 className="font-semibold text-lg mb-4">Specifications</h3>
          <Card className="p-6">
            <dl className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <dt className="font-medium text-muted-foreground">SKU</dt>
                <dd className="font-semibold">{product.sku || 'N/A'}</dd>
              </div>
              {product.brands?.name && (
                <div className="flex justify-between border-b pb-2">
                  <dt className="font-medium text-muted-foreground">Brand</dt>
                  <dd className="font-semibold">{product.brands.name}</dd>
                </div>
              )}
              {product.weight_kg && (
                <div className="flex justify-between border-b pb-2">
                  <dt className="font-medium text-muted-foreground">Weight</dt>
                  <dd className="font-semibold">{product.weight_kg} kg</dd>
                </div>
              )}
            </dl>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetail;

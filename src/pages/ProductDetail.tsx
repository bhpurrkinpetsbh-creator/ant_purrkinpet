import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft, ZoomIn, Check, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { ShareDialog } from "@/components/product/ShareDialog";
import { ProductForm } from "@/components/admin/ProductForm";
import ImgZoom from "react-img-zoom";
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
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Disable zoom when user clicks outside the page
  useEffect(() => {
    const handleBlur = () => {
      setIsZoomEnabled(false);
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!roleData);
      }
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Check if id is a UUID (for id-based lookup) or slug (for slug-based lookup)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');

        let query = supabase
          .from('products')
          .select(`
            *,
            categories (name),
            brands (name)
          `);

        // Use slug if not a UUID, otherwise use id
        if (isUUID) {
          query = query.eq('id', id);
        } else {
          query = query.eq('slug', id);
        }

        const { data, error } = await query.single();

        if (error) throw error;
        setProduct(data);

        // Fetch product images using the product's actual id
        const { data: images, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', data.id)
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
    if (!product || isAdding) return;

    setIsAdding(true);

    // Create flying cart animation
    const buttonRect = buttonRef.current?.getBoundingClientRect();
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

    const success = await addToCart(product.id, quantity);
    if (success) {
      toast.success("Added to cart!", {
        description: `${quantity} x ${product.name}`,
      });

      setTimeout(() => {
        setIsAdding(false);
      }, 1200);
    } else {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    await toggleWishlist(product.id);
  };

  const isProductInWishlist = product ? isInWishlist(product.id) : false;

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
                    <Card className="overflow-hidden aspect-square bg-white flex items-center justify-center">
                      {isZoomEnabled ? (
                        <ImgZoom
                          img={image.image_url || '/placeholder.svg'}
                          zoomScale={2}
                          width={600}
                          height={600}
                        />
                      ) : (
                        <img
                          src={image.image_url || '/placeholder.svg'}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-contain p-4"
                        />
                      )}
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          ) : (
            <Card className="overflow-hidden aspect-square bg-white flex items-center justify-center">
              {isZoomEnabled ? (
                <ImgZoom
                  img={productImages[0]?.image_url || product.image_url || '/placeholder.svg'}
                  zoomScale={2}
                  width={600}
                  height={600}
                />
              ) : (
                <img
                  src={productImages[0]?.image_url || product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              )}
            </Card>
          )}

          <div className="flex justify-center pt-2">
            <Button
              variant={isZoomEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsZoomEnabled(!isZoomEnabled)}
              className="gap-2"
            >
              <ZoomIn className="h-4 w-4" />
              {isZoomEnabled ? "Zoom Enabled" : "Enable Zoom"}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge className="mb-2">{product.categories?.name || 'Product'}</Badge>
                <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditFormOpen(true)}
                  className="gap-2 shrink-0"
                >
                  <Edit className="h-4 w-4" />
                  Edit Product
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {(product.stock_quantity ?? 0) > 0 ? (
                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                  In Stock: {product.stock_quantity} units
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">
              {product.is_on_offer && product.offer_price ? product.offer_price : product.price} BHD
            </span>
            {product.is_on_offer && product.offer_price && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  {product.price} BHD
                </span>
                <Badge variant="destructive">
                  {Math.round((1 - product.offer_price / product.price) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="space-y-4">
            {(product.stock_quantity ?? 0) > 0 && (
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
                    onClick={() => setQuantity(Math.min(product.stock_quantity ?? 1, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                ref={buttonRef}
                size="lg"
                className={`flex-1 bg-gradient-hero hover:opacity-90 transition-all duration-300 ${isAdding ? 'animate-button-success' : ''
                  }`}
                onClick={handleAddToCart}
                disabled={isAdding || (product.stock_quantity ?? 0) <= 0}
              >
                {isAdding ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Added!
                  </>
                ) : (product.stock_quantity ?? 0) <= 0 ? (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Out of Stock
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${isProductInWishlist ? 'fill-red-500 text-red-500' : ''
                    }`}
                />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShareDialogOpen(true)}
              >
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

      {product && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url
          }}
        />
      )}

      {/* Admin Edit Form */}
      {isAdmin && product && (
        <ProductForm
          mode="edit"
          product={product}
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          onSuccess={() => {
            setIsEditFormOpen(false);
            // Reload page to show updated product data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default ProductDetail;

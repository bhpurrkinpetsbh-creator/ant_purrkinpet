import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const checkoutSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(8, "Phone number must be at least 8 digits").max(20),
  address_line1: z.string().min(5, "Address is required").max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(2, "City is required").max(100),
  postal_code: z.string().max(20).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, loading } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      city: "Manama",
    },
  });

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.products?.price || 0);
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = 2.0;
  const total = subtotal + deliveryFee;

  // Show loading state while cart is being fetched
  if (loading) {
    return (
      <div className="container py-12 min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  // Only redirect if cart is empty and not loading
  if (cartCount === 0 && !loading) {
    navigate("/cart");
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
      // Store checkout data in sessionStorage for payment page
      sessionStorage.setItem("checkoutData", JSON.stringify({
        ...data,
        subtotal,
        deliveryFee,
        total,
        cartItems: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.products?.name,
          product_sku: item.products?.sku,
          quantity: item.quantity,
          unit_price: item.products?.price,
          total_price: parseFloat(item.products?.price || 0) * item.quantity,
        })),
      }));

      // Navigate to payment page
      navigate("/payment");
    } catch (error) {
      console.error("Error processing checkout:", error);
      toast({
        title: "Error",
        description: "Failed to process checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/cart">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  placeholder="John Doe"
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+973 XXXX XXXX"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address_line1">Address Line 1 *</Label>
                <Input
                  id="address_line1"
                  {...register("address_line1")}
                  placeholder="Street address"
                />
                {errors.address_line1 && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.address_line1.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  {...register("address_line2")}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register("city")} placeholder="Manama" />
                  {errors.city && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    {...register("postal_code")}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-hero hover:opacity-90 mt-6"
                size="lg"
                disabled={isProcessing}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.products?.name} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    {(parseFloat(item.products?.price || 0) * item.quantity).toFixed(2)} BHD
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{subtotal.toFixed(2)} BHD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-semibold">{deliveryFee.toFixed(2)} BHD</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">{total.toFixed(2)} BHD</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, Plus, Edit2, Trash2 } from "lucide-react";

const ADDRESS_LABELS = ["Home", "Work", "Office", "Custom"] as const;

const checkoutSchema = z.object({
  label: z.string().min(2, "Label must be at least 2 characters").max(100),
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(8, "Phone number must be at least 8 digits").max(20),
  address_line1: z.string().min(5, "Address is required").max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(2, "City is required").max(100),
  postal_code: z.string().max(20).optional(),
  is_default: z.boolean().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type SavedAddress = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string | null;
  country: string;
  is_default: boolean;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, loading } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCustomLabel, setShowCustomLabel] = useState(false);
  const [customLabelValue, setCustomLabelValue] = useState("");

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      label: "",
      full_name: "",
      email: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "Manama",
      postal_code: "",
      is_default: false,
    },
  });

  // Load saved addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load saved addresses
      const { data: addresses } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("customer_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (addresses && addresses.length > 0) {
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find(a => a.is_default) || addresses[0];
        setSelectedAddressId(defaultAddress.id);
        setShowForm(false);
      } else {
        setShowForm(true);
        setIsAddingNew(true);
      }

      // Set email from user
      form.setValue("email", user.email || "");
    };

    loadAddresses();
  }, [form]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.products?.price || 0);
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="container py-12 min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (cartCount === 0 && !loading) {
    navigate("/cart");
    return null;
  }

  const handleAddNewAddress = () => {
    setIsAddingNew(true);
    setEditingAddressId(null);
    setSelectedAddressId(null);
    setShowForm(true);
    setShowCustomLabel(false);
    setCustomLabelValue("");
    form.reset({
      label: "Home",
      full_name: "",
      email: form.getValues("email"),
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "Manama",
      postal_code: "",
      is_default: savedAddresses.length === 0,
    });
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddressId(address.id);
    setIsAddingNew(false);
    setShowForm(true);
    
    // Check if address label is custom (not in predefined list)
    const isCustomLabel = !ADDRESS_LABELS.slice(0, -1).includes(address.label as any);
    setShowCustomLabel(isCustomLabel);
    setCustomLabelValue(isCustomLabel ? address.label : "");
    
    form.reset({
      label: isCustomLabel ? "Custom" : address.label,
      full_name: address.full_name,
      email: form.getValues("email"),
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      postal_code: address.postal_code || "",
      is_default: address.is_default,
    });
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from("customer_addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;

      const updatedAddresses = savedAddresses.filter(a => a.id !== addressId);
      setSavedAddresses(updatedAddresses);

      if (selectedAddressId === addressId) {
        if (updatedAddresses.length > 0) {
          const defaultAddress = updatedAddresses.find(a => a.is_default) || updatedAddresses[0];
          setSelectedAddressId(defaultAddress.id);
        } else {
          setSelectedAddressId(null);
          setShowForm(true);
          setIsAddingNew(true);
        }
      }

      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
    setDeleteAddressId(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsAddingNew(false);
    setEditingAddressId(null);
    setShowCustomLabel(false);
    setCustomLabelValue("");
    if (savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddress = savedAddresses.find(a => a.is_default) || savedAddresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Validate custom label if selected
      if (data.label === "Custom" && !customLabelValue.trim()) {
        toast({
          title: "Error",
          description: "Please enter a custom label",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      let shippingData;

      if (isAddingNew || editingAddressId) {
        // Save new or update existing address
        if (data.is_default) {
          await supabase
            .from("customer_addresses")
            .update({ is_default: false })
            .eq("customer_id", user.id);
        }

        const finalLabel = data.label === "Custom" ? customLabelValue : data.label;

        const addressData = {
          customer_id: user.id,
          label: finalLabel,
          full_name: data.full_name,
          phone: data.phone,
          address_line1: data.address_line1,
          address_line2: data.address_line2 || null,
          city: data.city,
          postal_code: data.postal_code || null,
          country: "Bahrain",
          is_default: data.is_default || false,
        };

        if (editingAddressId) {
          const { error } = await supabase
            .from("customer_addresses")
            .update(addressData)
            .eq("id", editingAddressId);

          if (error) throw error;
        } else {
          const { data: newAddress, error } = await supabase
            .from("customer_addresses")
            .insert(addressData)
            .select()
            .single();

          if (error) throw error;
          setSavedAddresses([...savedAddresses, newAddress]);
          setSelectedAddressId(newAddress.id);
        }

        shippingData = {
          name: data.full_name,
          email: data.email,
          phone: data.phone,
          address_line1: data.address_line1,
          address_line2: data.address_line2,
          city: data.city,
          postal_code: data.postal_code,
        };
      } else {
        const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);
        if (!selectedAddress) {
          toast({
            title: "Error",
            description: "Please select an address",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        shippingData = {
          name: selectedAddress.full_name,
          email: data.email,
          phone: selectedAddress.phone,
          address_line1: selectedAddress.address_line1,
          address_line2: selectedAddress.address_line2,
          city: selectedAddress.city,
          postal_code: selectedAddress.postal_code,
        };
      }

      sessionStorage.setItem("checkoutData", JSON.stringify({
        ...shippingData,
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
          {/* Saved Addresses Section */}
          {!loading && savedAddresses.length > 0 && !showForm && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Select Shipping Address</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewAddress}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>

              <RadioGroup
                value={selectedAddressId || ""}
                onValueChange={setSelectedAddressId}
                className="space-y-3"
              >
                {savedAddresses.map((address) => (
                  <Card key={address.id} className="p-4 cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                      <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{address.label}</span>
                            {address.is_default && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="font-medium">{address.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}{address.postal_code && `, ${address.postal_code}`}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                        </div>
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteAddressId(address.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </RadioGroup>

              <Button
                onClick={form.handleSubmit(onSubmit)}
                className="w-full bg-gradient-hero hover:opacity-90 mt-6"
                size="lg"
                disabled={!selectedAddressId || isProcessing}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </Button>
            </Card>
          )}

          {/* Address Form */}
          {showForm && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </h2>
                {savedAddresses.length > 0 && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancelForm}>
                    Cancel
                  </Button>
                )}
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Label *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === "Custom") {
                              setShowCustomLabel(true);
                            } else {
                              setShowCustomLabel(false);
                              setCustomLabelValue("");
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select address type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ADDRESS_LABELS.map((label) => (
                              <SelectItem key={label} value={label}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showCustomLabel && (
                    <div>
                      <Label htmlFor="custom-label">Custom Label *</Label>
                      <Input
                        id="custom-label"
                        placeholder="Enter custom label"
                        value={customLabelValue}
                        onChange={(e) => setCustomLabelValue(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+973 XXXX XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1 *</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Apartment, suite, etc. (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Manama" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_default"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Set as default address
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-hero hover:opacity-90"
                    size="lg"
                    disabled={isProcessing}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {isProcessing ? "Processing..." : "Save & Continue to Payment"}
                  </Button>
                </form>
              </Form>
            </Card>
          )}
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
                <span className="font-semibold text-secondary">FREE</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">{total.toFixed(2)} BHD</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAddressId} onOpenChange={() => setDeleteAddressId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAddressId && handleDeleteAddress(deleteAddressId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Checkout;

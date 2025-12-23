import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Search, Plus, Minus, Trash2, Truck, X } from "lucide-react";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    customPrice?: number;
}

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
}

const TalabatEntry = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [talabatOrderId, setTalabatOrderId] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAccess();
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchProducts();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const checkAccess = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || user.email !== "mail2shaid@gmail.com") {
                toast.error("Access denied");
                navigate("/");
                return;
            }

            setIsAuthorized(true);
        } catch (error) {
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("id, name, price, image_url")
                .eq("is_active", true)
                .ilike("name", `%${searchQuery}%`)
                .limit(10);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                customPrice: product.price // Allow editing for Talabat pricing
            }];
        });
        setSearchQuery("");
        setSearchResults([]);
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const updatePrice = (id: string, newPrice: number) => {
        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, customPrice: newPrice } : item
        ));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + ((item.customPrice || item.price) * item.quantity), 0);

    const submitOrder = async () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        if (!talabatOrderId.trim()) {
            toast.error("Please enter the Talabat Order ID");
            return;
        }

        setIsProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Generate order number
            const orderNumber = `TAL-${talabatOrderId.trim().replace(/[^a-zA-Z0-9]/g, '')}`;

            // Create order with Talabat channel
            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
                    customer_id: user?.id,
                    customer_email: "talabat@purrkinpets.com",
                    order_number: orderNumber,
                    subtotal: total,
                    total: total,
                    status: "delivered",
                    payment_status: "paid",
                    payment_method: "talabat",
                    shipping_name: "Talabat Delivery",
                    shipping_address_line1: "Talabat Order",
                    shipping_city: "Bahrain",
                    channel: "talabat",
                    external_order_id: talabatOrderId.trim()
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items with all required fields
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.customPrice || item.price,
                total_price: (item.customPrice || item.price) * item.quantity
            }));

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItems);

            if (itemsError) throw itemsError;

            toast.success(`Talabat order ${talabatOrderId} logged successfully!`);
            setCart([]);
            setTalabatOrderId("");
        } catch (error: any) {
            console.error("Submit error:", error);
            toast.error("Failed to log order: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/pos">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Truck className="h-6 w-6 text-orange-400" />
                            Talabat Order Entry
                        </h1>
                        <p className="text-slate-400">Log delivery partner orders for inventory sync</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left - Search & Add */}
                    <div className="space-y-4">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Order Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Talabat Order ID *</Label>
                                    <Input
                                        placeholder="e.g. TAL-12345"
                                        value={talabatOrderId}
                                        onChange={(e) => setTalabatOrderId(e.target.value)}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300">Search Products</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search by name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="bg-slate-700 rounded-lg border border-slate-600 max-h-60 overflow-y-auto">
                                        {searchResults.map(product => (
                                            <button
                                                key={product.id}
                                                onClick={() => addToCart(product)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-600 transition-colors border-b border-slate-600 last:border-0 text-left"
                                            >
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-white text-sm">{product.name}</div>
                                                    <div className="text-green-400 text-xs">{product.price.toFixed(3)} BHD</div>
                                                </div>
                                                <Plus className="h-5 w-5 text-green-400" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right - Cart */}
                    <div>
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Order Items</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        No items added yet
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {cart.map(item => (
                                                <div key={item.id} className="bg-slate-700 rounded-lg p-3">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="text-white text-sm font-medium line-clamp-2">{item.name}</div>
                                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="text-white font-bold w-6 text-center text-sm">{item.quantity}</span>
                                                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Input
                                                                type="number"
                                                                step="0.001"
                                                                value={item.customPrice || item.price}
                                                                onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                                                                className="w-20 h-7 text-right bg-slate-600 border-slate-500 text-white text-sm"
                                                            />
                                                            <span className="text-slate-400 text-xs">BHD</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-slate-600 pt-4">
                                            <div className="flex justify-between items-center text-xl">
                                                <span className="text-slate-300">Total</span>
                                                <span className="font-bold text-white">{total.toFixed(3)} BHD</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={submitOrder}
                                            disabled={isProcessing || !talabatOrderId.trim()}
                                            className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-lg"
                                        >
                                            {isProcessing ? "Logging..." : "Log Talabat Order"}
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TalabatEntry;

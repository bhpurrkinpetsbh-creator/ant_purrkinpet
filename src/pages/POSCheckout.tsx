import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, X, Printer } from "lucide-react";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    barcode?: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    barcode: string | null;
    stock_quantity: number | null;
}

const POSCheckout = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastOrder, setLastOrder] = useState<any>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkAccess();
    }, []);

    useEffect(() => {
        // Focus search input on load
        if (isAuthorized && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isAuthorized]);

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
        setIsSearching(true);
        try {
            // Search by name (barcode search will work after DB migration)
            const { data, error } = await supabase
                .from("products")
                .select("id, name, price, image_url, stock_quantity")
                .eq("is_active", true)
                .ilike("name", `%${searchQuery}%`)
                .limit(10);

            if (error) throw error;

            // Cast data to expected type (barcode column may not exist yet)
            const products = (data || []).map(p => ({
                ...p,
                barcode: null
            })) as Product[];

            setSearchResults(products);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
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
                image_url: product.image_url,
                barcode: product.barcode || undefined
            }];
        });
        setSearchQuery("");
        setSearchResults([]);
        searchInputRef.current?.focus();
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

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;

    const processPayment = async (paymentMethod: string) => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        setIsProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Generate order number
            const orderNumber = `POS-${Date.now().toString(36).toUpperCase()}`;

            // Create order with required fields
            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
                    customer_id: user?.id,
                    customer_email: "pos@purrkinpets.com",
                    order_number: orderNumber,
                    subtotal: total,
                    total: total,
                    status: "delivered",
                    payment_status: "paid",
                    payment_method: paymentMethod.toLowerCase(),
                    shipping_name: "POS Store Sale",
                    shipping_address_line1: "In-Store Purchase",
                    shipping_city: "Bahrain",
                    channel: "pos_store"
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
                unit_price: item.price,
                total_price: item.price * item.quantity
            }));

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Update stock quantities directly
            for (const item of cart) {
                const { data: product } = await supabase
                    .from("products")
                    .select("stock_quantity")
                    .eq("id", item.id)
                    .single();

                if (product) {
                    const newQty = Math.max(0, (product.stock_quantity || 0) - item.quantity);
                    await supabase
                        .from("products")
                        .update({ stock_quantity: newQty })
                        .eq("id", item.id);
                }
            }

            setLastOrder({ ...order, items: cart, paymentMethod, total_amount: total });
            setShowReceipt(true);
            toast.success(`Sale completed! ${paymentMethod} payment received.`);
            setCart([]);
        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error("Failed to process sale: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const closeReceipt = () => {
        setShowReceipt(false);
        setLastOrder(null);
        searchInputRef.current?.focus();
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
        <div className="min-h-screen bg-slate-900 flex">
            {/* Left Side - Products */}
            <div className="flex-1 p-4 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <Link to="/pos">
                        <Button variant="outline" size="icon" className="shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Scan barcode or search product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-14 text-lg bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="bg-slate-800 rounded-lg border border-slate-700 mb-4 max-h-96 overflow-y-auto">
                        {searchResults.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-0"
                            >
                                <img
                                    src={product.image_url || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded"
                                    onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                                />
                                <div className="flex-1 text-left">
                                    <div className="text-white font-medium">{product.name}</div>
                                    {product.barcode && (
                                        <div className="text-slate-400 text-sm font-mono">{product.barcode}</div>
                                    )}
                                </div>
                                <div className="text-green-400 font-bold text-lg">
                                    {product.price.toFixed(3)} BHD
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {cart.length === 0 && searchResults.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-slate-500">
                            <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-xl">Scan a barcode or search for products</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side - Cart */}
            <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Current Sale</h2>
                    <p className="text-slate-400 text-sm">{cart.length} items</p>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(item => (
                        <div key={item.id} className="bg-slate-700 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="text-white font-medium text-sm line-clamp-2">{item.name}</div>
                                    <div className="text-slate-400 text-xs">{item.price.toFixed(3)} BHD each</div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 p-1">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => updateQuantity(item.id, -1)}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => updateQuantity(item.id, 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="text-green-400 font-bold">
                                    {(item.price * item.quantity).toFixed(3)} BHD
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total & Payment */}
                <div className="p-4 border-t border-slate-700 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-lg">Total</span>
                        <span className="text-3xl font-bold text-white">{total.toFixed(3)} BHD</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            onClick={() => processPayment("Cash")}
                            disabled={isProcessing || cart.length === 0}
                            className="h-16 bg-green-600 hover:bg-green-500 flex-col gap-1"
                        >
                            <Banknote className="h-6 w-6" />
                            <span className="text-xs">Cash</span>
                        </Button>
                        <Button
                            onClick={() => processPayment("Card")}
                            disabled={isProcessing || cart.length === 0}
                            className="h-16 bg-blue-600 hover:bg-blue-500 flex-col gap-1"
                        >
                            <CreditCard className="h-6 w-6" />
                            <span className="text-xs">Card</span>
                        </Button>
                        <Button
                            onClick={() => processPayment("Benefit")}
                            disabled={isProcessing || cart.length === 0}
                            className="h-16 bg-purple-600 hover:bg-purple-500 flex-col gap-1"
                        >
                            <Smartphone className="h-6 w-6" />
                            <span className="text-xs">Benefit</span>
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setCart([])}
                        disabled={cart.length === 0}
                        className="w-full"
                    >
                        Clear Cart
                    </Button>
                </div>
            </div>

            {/* Receipt Modal */}
            {showReceipt && lastOrder && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-sm w-full p-6 text-black">
                        <div className="text-center border-b pb-4 mb-4">
                            <h3 className="text-xl font-bold">Purrkin Pets</h3>
                            <p className="text-sm text-gray-500">Thank you for your purchase!</p>
                        </div>

                        <div className="space-y-2 border-b pb-4 mb-4">
                            {lastOrder.items.map((item: CartItem) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>{(item.price * item.quantity).toFixed(3)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between font-bold text-lg mb-4">
                            <span>Total</span>
                            <span>{lastOrder.total_amount.toFixed(3)} BHD</span>
                        </div>

                        <div className="text-center text-sm text-gray-500 mb-4">
                            Payment: {lastOrder.paymentMethod}
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={closeReceipt} className="flex-1">
                                Done
                            </Button>
                            <Button variant="outline" onClick={() => window.print()} className="gap-2">
                                <Printer className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSCheckout;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, CreditCard, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  shipping_name: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_postal_code: string | null;
  customer_notes: string | null;
  items: OrderItem[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to view orders");
        navigate("/auth");
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = ordersData.map(order => order.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      const ordersWithItems = ordersData.map(order => ({
        ...order,
        items: itemsData?.filter(item => item.order_id === order.id) || []
      }));

      setOrders(ordersWithItems);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'processing': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'shipped': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="font-display text-4xl font-bold mb-8">My Orders</h1>
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to see your orders here
          </p>
          <Button onClick={() => navigate("/shop")}>Browse Products</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-4xl font-bold mb-8">My Orders</h1>
      
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrders.has(order.id);
          
          return (
            <Card key={order.id} className="overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => toggleOrderExpanded(order.id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        Delivery: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.payment_status)}>
                        Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        <span>
                          {order.payment_method === 'card' 
                            ? 'Benefit Bank Scan' 
                            : order.payment_method || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {order.total.toFixed(3)} BD
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-accent/5">
                  <div className="p-6 space-y-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-4">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start gap-4 p-3 bg-background rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.product_name}</p>
                              {item.product_sku && (
                                <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{item.total_price.toFixed(3)} BD</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} × {item.unit_price.toFixed(3)} BD
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h4>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{order.shipping_name}</p>
                        <p>{order.shipping_address_line1}</p>
                        {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                        <p>
                          {order.shipping_city}
                          {order.shipping_postal_code && `, ${order.shipping_postal_code}`}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-semibold mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{order.subtotal.toFixed(3)} BD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery Fee</span>
                          <span className="text-secondary font-semibold">
                            {order.delivery_fee === 0 ? 'FREE' : `${order.delivery_fee.toFixed(3)} BD`}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-base">
                          <span>Total</span>
                          <span className="text-primary">{order.total.toFixed(3)} BD</span>
                        </div>
                      </div>
                    </div>

                    {order.customer_notes && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Customer Notes</h4>
                          <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;

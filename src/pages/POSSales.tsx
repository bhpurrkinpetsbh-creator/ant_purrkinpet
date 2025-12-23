import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Globe, Store, Truck, Package } from "lucide-react";
import { format } from "date-fns";

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string | null;
    channel: string | null;
    external_order_id: string | null;
}

const POSSales = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeChannel, setActiveChannel] = useState<string>("all");
    const navigate = useNavigate();

    useEffect(() => {
        checkAccess();
    }, []);

    useEffect(() => {
        if (isAuthorized) {
            fetchOrders();
        }
    }, [isAuthorized, activeChannel]);

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

    const fetchOrders = async () => {
        try {
            let query = supabase
                .from("orders")
                .select("id, created_at, total, status, channel, external_order_id")
                .order("created_at", { ascending: false })
                .limit(100);

            if (activeChannel !== "all") {
                query = query.eq("channel", activeChannel);
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders((data as unknown as Order[]) || []);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load orders");
        }
    };

    const getChannelBadge = (channel: string | null) => {
        switch (channel) {
            case "pos_store":
                return <Badge className="bg-green-600"><Store className="h-3 w-3 mr-1" /> Store</Badge>;
            case "talabat":
                return <Badge className="bg-orange-600"><Truck className="h-3 w-3 mr-1" /> Talabat</Badge>;
            case "website":
                return <Badge className="bg-blue-600"><Globe className="h-3 w-3 mr-1" /> Website</Badge>;
            default:
                return <Badge variant="outline"><Package className="h-3 w-3 mr-1" /> Other</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "delivered":
                return <Badge className="bg-green-500">Delivered</Badge>;
            case "pending":
                return <Badge className="bg-yellow-500">Pending</Badge>;
            case "cancelled":
                return <Badge className="bg-red-500">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Calculate stats
    const stats = {
        all: orders.length,
        website: orders.filter(o => o.channel === "website" || !o.channel).length,
        pos_store: orders.filter(o => o.channel === "pos_store").length,
        talabat: orders.filter(o => o.channel === "talabat").length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/pos">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Sales History</h1>
                        <p className="text-slate-400">View orders by channel</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-white">{stats.all}</div>
                            <p className="text-slate-400 text-sm">Total Orders</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-blue-400">{stats.website}</div>
                            <p className="text-slate-400 text-sm">Website</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-green-400">{stats.pos_store}</div>
                            <p className="text-slate-400 text-sm">Store POS</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-orange-400">{stats.talabat}</div>
                            <p className="text-slate-400 text-sm">Talabat</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-purple-400">{stats.totalRevenue.toFixed(3)}</div>
                            <p className="text-slate-400 text-sm">Revenue (BHD)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Channel Tabs */}
                <Tabs value={activeChannel} onValueChange={setActiveChannel}>
                    <TabsList className="bg-slate-800 border-slate-700 mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="website" className="gap-1">
                            <Globe className="h-4 w-4" /> Website
                        </TabsTrigger>
                        <TabsTrigger value="pos_store" className="gap-1">
                            <Store className="h-4 w-4" /> Store
                        </TabsTrigger>
                        <TabsTrigger value="talabat" className="gap-1">
                            <Truck className="h-4 w-4" /> Talabat
                        </TabsTrigger>
                    </TabsList>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-slate-700">
                                        <tr className="text-left text-slate-400 text-sm">
                                            <th className="p-4">Order ID</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Channel</th>
                                            <th className="p-4">External ID</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                                <td className="p-4 text-white font-mono text-sm">
                                                    {order.id.slice(0, 8)}...
                                                </td>
                                                <td className="p-4 text-slate-300">
                                                    {format(new Date(order.created_at), "MMM d, HH:mm")}
                                                </td>
                                                <td className="p-4">
                                                    {getChannelBadge(order.channel)}
                                                </td>
                                                <td className="p-4 text-slate-400 font-mono text-sm">
                                                    {order.external_order_id || "-"}
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="p-4 text-right text-white font-medium">
                                                    {order.total?.toFixed(3)} BHD
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                                    No orders found for this channel
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </div>
    );
};

export default POSSales;

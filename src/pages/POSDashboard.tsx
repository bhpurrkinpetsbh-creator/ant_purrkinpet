import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingCart, Package, Receipt, BarChart3, Truck, ArrowLeft } from "lucide-react";

const POSDashboard = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [todayStats, setTodayStats] = useState({
        totalSales: 0,
        orderCount: 0,
        posOrders: 0,
        talabatOrders: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Please login to access POS");
                navigate("/auth");
                return;
            }

            // Only mail2shaid@gmail.com can access POS
            if (user.email !== "mail2shaid@gmail.com") {
                toast.error("Access denied. POS is restricted.");
                navigate("/");
                return;
            }

            setIsAuthorized(true);
            fetchTodayStats();
        } catch (error) {
            console.error("Error checking access:", error);
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayStats = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: orders, error } = await supabase
                .from("orders")
                .select("total_amount, channel")
                .gte("created_at", today.toISOString());

            if (error) throw error;

            const stats = {
                totalSales: orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
                orderCount: orders?.length || 0,
                posOrders: orders?.filter(o => o.channel === "pos_store").length || 0,
                talabatOrders: orders?.filter(o => o.channel === "talabat").length || 0
            };

            setTodayStats(stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-white text-xl">Loading POS...</div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Purrkin Pets POS</h1>
                        <p className="text-slate-400">Point of Sale System</p>
                    </div>
                    <Link to="/admin">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Admin
                        </Button>
                    </Link>
                </div>

                {/* Today's Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-400">
                                {todayStats.totalSales.toFixed(3)} BHD
                            </div>
                            <p className="text-slate-400 text-sm">Today's Sales</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-400">
                                {todayStats.orderCount}
                            </div>
                            <p className="text-slate-400 text-sm">Total Orders</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-purple-400">
                                {todayStats.posOrders}
                            </div>
                            <p className="text-slate-400 text-sm">Store Sales</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-orange-400">
                                {todayStats.talabatOrders}
                            </div>
                            <p className="text-slate-400 text-sm">Talabat Orders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/pos/checkout">
                        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 hover:from-green-500 hover:to-green-600 transition-all cursor-pointer h-full">
                            <CardHeader>
                                <ShoppingCart className="h-12 w-12 text-white mb-2" />
                                <CardTitle className="text-white text-2xl">New Sale</CardTitle>
                                <CardDescription className="text-green-100">
                                    Start a new in-store checkout
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link to="/pos/talabat">
                        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 hover:from-orange-400 hover:to-orange-500 transition-all cursor-pointer h-full">
                            <CardHeader>
                                <Truck className="h-12 w-12 text-white mb-2" />
                                <CardTitle className="text-white text-2xl">Talabat Entry</CardTitle>
                                <CardDescription className="text-orange-100">
                                    Log a Talabat/Delivery order
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link to="/pos/sales">
                        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 hover:from-blue-500 hover:to-blue-600 transition-all cursor-pointer h-full">
                            <CardHeader>
                                <BarChart3 className="h-12 w-12 text-white mb-2" />
                                <CardTitle className="text-white text-2xl">Sales History</CardTitle>
                                <CardDescription className="text-blue-100">
                                    View all sales by channel
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default POSDashboard;

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserGuideModal } from "@/components/admin/UserGuideModal";
import { SupportDialog } from "@/components/admin/SupportDialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Package,
  BarChart3,
  Trash2,
  TrendingUp,
  Users,
  DollarSign,
  ExternalLink,
  AlertCircle,
  UserCog,
  BookOpen,
  HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalRevenue: number;
  totalCustomers: number;
  totalOrders: number;
  activeOrders: number;
  completedToday: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  deletedProducts: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalCustomers: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedToday: 0,
    pendingOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    inStockProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    deletedProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch orders data with error handling
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*");

      if (ordersError) {
        console.error("Orders fetch error:", ordersError);
      }

      console.log("Fetched orders:", orders);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeOrders = orders?.filter(o =>
        o.status === "pending" || o.status === "processing" || o.status === "confirmed"
      ).length || 0;

      const completedToday = orders?.filter(o => {
        const orderDate = new Date(o.created_at);
        return o.status === "delivered" && orderDate >= today;
      }).length || 0;

      const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;

      const totalRevenue = orders?.reduce((sum, order) => {
        const amount = (order as any).total_amount || (order as any).total || 0;
        return sum + amount;
      }, 0) || 0;

      console.log("Total Revenue:", totalRevenue);

      // Fetch customers count
      const { count: customersCount, error: customersError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      if (customersError) {
        console.error("Customers fetch error:", customersError);
      }

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, is_active, stock_quantity, low_stock_threshold");

      if (productsError) {
        console.error("Products fetch error:", productsError);
      }

      console.log("Fetched products:", products);

      const activeProducts = products?.filter(p => p.is_active).length || 0;
      const draftProducts = products?.filter(p => !p.is_active).length || 0;

      // Use product-specific threshold (default to 5 if not set)
      const inStockProducts = products?.filter(p => {
        const threshold = p.low_stock_threshold ?? 5;
        return p.is_active && (p.stock_quantity || 0) > threshold;
      }).length || 0;

      const lowStockProducts = products?.filter(p => {
        const threshold = p.low_stock_threshold ?? 5;
        const stock = p.stock_quantity || 0;
        return p.is_active && stock > 0 && stock <= threshold;
      }).length || 0;

      const outOfStockProducts = products?.filter(p =>
        p.is_active && (p.stock_quantity || 0) === 0
      ).length || 0;

      // Fetch deleted products count
      const { count: deletedCount, error: deletedError } = await supabase
        .from("deleted_products")
        .select("*", { count: "exact", head: true });

      if (deletedError) {
        console.error("Deleted products fetch error:", deletedError);
      }

      setStats({
        totalRevenue,
        totalCustomers: customersCount || 0,
        totalOrders: orders?.length || 0,
        activeOrders,
        completedToday,
        pendingOrders,
        totalProducts: products?.length || 0,
        activeProducts,
        draftProducts,
        inStockProducts,
        lowStockProducts,
        outOfStockProducts,
        deletedProducts: deletedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      label: "Total Revenue",
      value: `BD ${stats.totalRevenue.toFixed(2)} `,
      icon: DollarSign,
      change: `${stats.totalOrders} orders`,
      trend: "up" as const
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: "All time",
      trend: "up" as const
    },
    {
      label: "Active Products",
      value: stats.activeProducts.toString(),
      icon: TrendingUp,
      change: `${stats.totalProducts} total`,
      trend: "up" as const
    }
  ];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2 text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome back! Manage your entire store from one place
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                <div className="flex items-center mt-2">
                  <Badge variant={stat.trend === "up" ? "default" : "destructive"} className="text-xs font-bold">
                    {stat.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">vs last week</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Admin Tabs */}
      <Card className="border shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-muted/30 px-6 py-4">
            <TabsList className="grid w-full grid-cols-4 h-11 bg-background">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Inventory
              </TabsTrigger>
              <TabsTrigger
                value="deleted"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deleted
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Orders Tab */}
          <TabsContent value="overview" className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link to="/admin/orders" className="group">
                  <h2 className="text-2xl font-bold flex items-center gap-2 hover:text-primary transition-colors">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    Orders Management
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                </Link>
                <p className="text-muted-foreground mt-1">View, track, and manage customer orders</p>
              </div>
              <Button
                onClick={() => navigate("/admin/orders")}
                className="bg-primary hover:bg-primary/90"
              >
                Open Full Page <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border bg-muted/30">
                <div className="text-sm text-muted-foreground font-semibold mb-1">Active Orders</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.activeOrders}</div>
              </Card>
              <Card className="p-4 border bg-muted/30">
                <div className="text-sm text-muted-foreground font-semibold mb-1">Completed Today</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.completedToday}</div>
              </Card>
              <Card className="p-4 border bg-muted/30">
                <div className="text-sm text-muted-foreground font-semibold mb-1">Pending</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.pendingOrders}</div>
              </Card>
            </div>

            <Card className="p-4 bg-muted/20 border">
              <p className="text-center text-muted-foreground">
                Click "Open Full Page" to access the complete orders management interface
              </p>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link to="/admin/products" className="group">
                  <h2 className="text-2xl font-bold flex items-center gap-2 hover:text-primary transition-colors">
                    <Package className="h-6 w-6 text-primary" />
                    Products Management
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                </Link>
                <p className="text-muted-foreground mt-1">Add, edit, and organize your product catalog</p>
              </div>
              <Button
                onClick={() => navigate("/admin/products")}
                className="bg-primary hover:bg-primary/90"
              >
                Open Full Page <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="p-4 border bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all group"
                onClick={() => navigate("/admin/products")}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-muted-foreground font-semibold mb-1">Total Products</div>
                    <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.totalProducts}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
              <Card
                className="p-4 border bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all group"
                onClick={() => navigate("/admin/products?filter=active")}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-muted-foreground font-semibold mb-1">Active</div>
                    <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.activeProducts}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
              <Card
                className="p-4 border bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all group"
                onClick={() => navigate("/admin/products?filter=draft")}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-muted-foreground font-semibold mb-1">Draft</div>
                    <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.draftProducts}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            </div>

            <Card className="p-4 bg-muted/20 border">
              <p className="text-center text-muted-foreground">
                Click "Open Full Page" to access the complete product management interface
              </p>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link to="/admin/inventory" className="group">
                  <h2 className="text-2xl font-bold flex items-center gap-2 hover:text-primary transition-colors">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    Inventory Management
                    {!loading && stats.lowStockProducts > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {stats.lowStockProducts} Low Stock
                      </Badge>
                    )}
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                </Link>
                <p className="text-muted-foreground mt-1">Track stock levels and manage inventory</p>
              </div>
              <Button
                onClick={() => navigate("/admin/inventory")}
                className="bg-primary hover:bg-primary/90"
              >
                Open Full Page <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border bg-muted/30">
                <div className="text-sm text-muted-foreground font-semibold mb-1">In Stock</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.inStockProducts}</div>
              </Card>
              <Card className="p-4 border bg-muted/30">
                <div className="text-sm text-muted-foreground font-semibold mb-1">Low Stock</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.lowStockProducts}</div>
              </Card>
              <Card className="p-4 border bg-muted/30">
                <div className="text-sm text-muted-foreground font-semibold mb-1">Out of Stock</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.outOfStockProducts}</div>
              </Card>
            </div>

            <Card className="p-4 bg-muted/20 border">
              <p className="text-center text-muted-foreground">
                Click "Open Full Page" to access the complete inventory management interface
              </p>
            </Card>
          </TabsContent>

          {/* Deleted Products Tab */}
          <TabsContent value="deleted" className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link to="/admin/deleted-products" className="group">
                  <h2 className="text-2xl font-bold flex items-center gap-2 hover:text-primary transition-colors">
                    <Trash2 className="h-6 w-6 text-primary" />
                    Deleted Products
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                </Link>
                <p className="text-muted-foreground mt-1">Review and restore deleted products</p>
              </div>
              <Button
                onClick={() => navigate("/admin/deleted-products")}
                className="bg-primary hover:bg-primary/90"
              >
                Open Full Page <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border bg-muted/30">
                <div className="text-sm text-muted-foreground font-semibold mb-1">In Trash</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.deletedProducts}</div>
              </Card>
              <Card className="p-4 border bg-muted/30">
                <div className="text-sm text-muted-foreground font-semibold mb-1">Can Be Restored</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.deletedProducts}</div>
              </Card>
              <Card className="p-4 border bg-muted/30">
                <div className="text-sm text-muted-foreground font-semibold mb-1">Auto-delete in</div>
                <div className="text-2xl font-bold text-foreground">30 days</div>
              </Card>
            </div>

            <Card className="p-4 bg-muted/20 border">
              <p className="text-center text-muted-foreground">
                Click "Open Full Page" to access the complete deleted products management interface
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-8 p-6 bg-muted/20 border shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">
              Need Help?
            </h3>
            <p className="text-muted-foreground">
              Access our admin guide or contact support for assistance
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsGuideOpen(true)}>
              View Guide
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsSupportOpen(true)}>
              Contact Support
            </Button>
          </div>
        </div>
      </Card>

      <UserGuideModal open={isGuideOpen} onOpenChange={setIsGuideOpen} />
      <SupportDialog open={isSupportOpen} onOpenChange={setIsSupportOpen} />
    </div>
  );
};

export default AdminDashboard;

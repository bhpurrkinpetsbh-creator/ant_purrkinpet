import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package, Search, Edit, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { LowStockProducts } from "@/components/admin/LowStockProducts";
import { InventoryTransactions } from "@/components/admin/InventoryTransactions";
import { StockAdjustment } from "@/components/admin/StockAdjustment";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  image_url: string;
  price: number;
  brands?: { name: string } | null;
  categories?: { name: string } | null;
}

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login to access this page");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchProducts();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands(name),
          categories(name)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setIsAdjustmentDialogOpen(true);
  };

  const handleAdjustmentSuccess = () => {
    fetchProducts();
  };

  const getStockStatus = (stock: number | null, threshold: number | null) => {
    if (stock === null) return { label: "Unknown", variant: "secondary" as const };
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (threshold !== null && stock <= threshold) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">
          Monitor stock levels, view transactions, and manage inventory
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all-products">All Products</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <LowStockProducts />

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Overview of your inventory status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Products</div>
                  <div className="text-2xl font-bold">{products.length}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">In Stock</div>
                  <div className="text-2xl font-bold text-green-600">
                    {products.filter(p => (p.stock_quantity ?? 0) > 0).length}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Out of Stock</div>
                  <div className="text-2xl font-bold text-red-600">
                    {products.filter(p => (p.stock_quantity ?? 0) === 0).length}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Units</div>
                  <div className="text-2xl font-bold">
                    {products.reduce((sum, p) => sum + (p.stock_quantity ?? 0), 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    All Products
                  </CardTitle>
                  <CardDescription>Manage inventory for all products</CardDescription>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading products...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const status = getStockStatus(product.stock_quantity, product.low_stock_threshold);
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div className="font-medium">{product.name}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {product.sku || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {product.categories?.name || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {product.brands?.name || '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {product.stock_quantity ?? 0}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {product.low_stock_threshold ?? '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdjustStock(product)}
                                className="gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Adjust
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <InventoryTransactions />
        </TabsContent>
      </Tabs>

      {selectedProduct && (
        <StockAdjustment
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          currentStock={selectedProduct.stock_quantity ?? 0}
          isOpen={isAdjustmentDialogOpen}
          onClose={() => setIsAdjustmentDialogOpen(false)}
          onSuccess={handleAdjustmentSuccess}
        />
      )}
    </div>
  );
};

export default AdminInventory;

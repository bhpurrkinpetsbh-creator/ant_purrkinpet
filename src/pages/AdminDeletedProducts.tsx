import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Undo2, Trash2, Search, AlertTriangle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DeletedProduct {
  id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  image_url: string;
  price: number;
  deleted_at: string;
  auto_purge_date: string;
  days_until_purge: number;
  deletion_reason: string | null;
  deleted_by_email: string | null;
}

const AdminDeletedProducts = () => {
  const [deletedProducts, setDeletedProducts] = useState<DeletedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchDeletedProducts();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      navigate('/');
      toast.error("Access denied. Admin privileges required.");
    }
  };

  const fetchDeletedProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deleted_products_view')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) throw error;

      setDeletedProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching deleted products:", error);
      toast.error(error.message || "Failed to load deleted products");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (deletedProductId: string, productName: string) => {
    if (!confirm(`Are you sure you want to restore "${productName}"?\n\nThis will move the product back to the active products list.`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('restore_deleted_product', {
        p_deleted_product_id: deletedProductId
      });

      if (error) throw error;

      toast.success(`"${productName}" has been restored successfully`);
      fetchDeletedProducts();
    } catch (error: any) {
      console.error("Error restoring product:", error);
      toast.error(error.message || "Failed to restore product");
    }
  };

  const handlePermanentDelete = async (deletedProductId: string, productName: string) => {
    if (!confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete "${productName}"?\n\nThis action CANNOT be undone and the product will be lost forever!`)) {
      return;
    }

    // Double confirmation for permanent delete
    if (!confirm(`Final confirmation: Type "DELETE" in the next prompt to permanently delete "${productName}"`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('permanently_delete_product', {
        p_deleted_product_id: deletedProductId
      });

      if (error) throw error;

      toast.success(`"${productName}" has been permanently deleted`);
      fetchDeletedProducts();
    } catch (error: any) {
      console.error("Error permanently deleting product:", error);
      toast.error(error.message || "Failed to permanently delete product");
    }
  };

  const filteredProducts = deletedProducts.filter(product =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getDaysUntilPurgeBadge = (days: number) => {
    if (days <= 3) {
      return <Badge variant="destructive" className="gap-1">
        <Clock className="h-3 w-3" />
        {days} days left
      </Badge>;
    } else if (days <= 7) {
      return <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-700">
        <Clock className="h-3 w-3" />
        {days} days left
      </Badge>;
    } else {
      return <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        {days} days left
      </Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Deleted Products</h1>
        <p className="text-muted-foreground">
          Products are kept for 30 days before automatic deletion. You can restore or permanently delete them.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Trash
              </CardTitle>
              <CardDescription>
                {deletedProducts.length} deleted product{deletedProducts.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deleted products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading deleted products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No deleted products match your search" : "No deleted products"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Deleted On</TableHead>
                    <TableHead>Auto-Delete</TableHead>
                    <TableHead>Deleted By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{product.product_name}</div>
                            {product.deletion_reason && (
                              <div className="text-xs text-muted-foreground">
                                Reason: {product.deletion_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.sku || "-"}
                      </TableCell>
                      <TableCell>{product.price} BHD</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(product.deleted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getDaysUntilPurgeBadge(product.days_until_purge)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.deleted_by_email || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(product.id, product.product_name)}
                            className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Undo2 className="h-4 w-4" />
                            Restore
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePermanentDelete(product.id, product.product_name)}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Forever
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {deletedProducts.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Auto-Purge Information</p>
              <p className="text-muted-foreground">
                Products in trash are automatically and permanently deleted after 30 days.
                Products with fewer days remaining are highlighted in red.
                Restore products before they are automatically purged to prevent permanent data loss.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeletedProducts;

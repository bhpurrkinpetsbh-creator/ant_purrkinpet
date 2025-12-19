import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Search, Trash2, ArrowLeft, ArrowUpDown, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductForm } from "@/components/admin/ProductForm";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number | null;
  image_url: string;
  is_active: boolean | null;
  is_featured: boolean | null;
  brands?: { name: string } | null;
  categories?: { name: string } | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [sortColumn, setSortColumn] = useState<'name' | 'sku' | 'category' | 'brand' | 'price' | 'stock'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sku':
          comparison = (a.sku || '').localeCompare(b.sku || '');
          break;
        case 'category':
          comparison = (a.categories?.name || '').localeCompare(b.categories?.name || '');
          break;
        case 'brand':
          comparison = (a.brands?.name || '').localeCompare(b.brands?.name || '');
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(filtered);
  }, [searchQuery, products, sortColumn, sortDirection]);

  const handleSort = (column: 'name' | 'sku' | 'category' | 'brand' | 'price' | 'stock') => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login to access this page");
        navigate("/auth");
        return;
      }

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
        .order('created_at', { ascending: false });

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

  const handleAddProduct = () => {
    setFormMode('add');
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormMode('edit');
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?\n\nThis product will be moved to trash and automatically deleted after 30 days.\nYou can restore it from the Deleted Products page.`)) {
      return;
    }

    try {
      // Call the soft_delete_product function
      const { error } = await supabase.rpc('soft_delete_product', {
        p_product_id: productId,
        p_deletion_reason: 'Deleted from admin panel'
      });

      if (error) throw error;

      toast.success("Product moved to trash. It will be permanently deleted after 30 days.");
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleExport = () => {
    try {
      // Headers for CSV
      const headers = ["Product Name", "SKU", "Category", "Brand", "Price (BHD)", "Stock", "Status"];

      // Map data to CSV rows
      const rows = filteredProducts.map(product => [
        `"${product.name}"`, // Quote to handle commas in names
        `"${product.sku || ''}"`,
        `"${product.categories?.name || '-'}"`,
        `"${product.brands?.name || '-'}"`,
        product.price,
        product.stock_quantity ?? 0,
        product.is_active ? "Active" : "Inactive"
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `purrkin_pets_products_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Products exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export products");
    }
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
        <h1 className="text-3xl font-bold mb-2">Product Management</h1>
        <p className="text-muted-foreground">
          Add, edit, and manage your product catalog
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                {products.length} total products
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsExportDialogOpen(true)} className="gap-2">
                  <Download className="h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={handleAddProduct} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading products...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Product
                        <ArrowUpDown className={`h-3 w-3 ${sortColumn === 'name' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('sku')}
                    >
                      <div className="flex items-center gap-1">
                        SKU
                        <ArrowUpDown className={`h-3 w-3 ${sortColumn === 'sku' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        Category
                        <ArrowUpDown className={`h-3 w-3 ${sortColumn === 'category' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('brand')}
                    >
                      <div className="flex items-center gap-1">
                        Brand
                        <ArrowUpDown className={`h-3 w-3 ${sortColumn === 'brand' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Price
                        <ArrowUpDown className={`h-3 w-3 ${sortColumn === 'price' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('stock')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Stock
                        <ArrowUpDown className={`h-3 w-3 ${sortColumn === 'stock' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.is_featured && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.sku || '-'}
                      </TableCell>
                      <TableCell>{product.categories?.name || '-'}</TableCell>
                      <TableCell>{product.brands?.name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="font-semibold">{product.price} BHD</div>
                        {product.compare_at_price && (
                          <div className="text-xs text-muted-foreground line-through">
                            {product.compare_at_price} BHD
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.stock_quantity ?? 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {
        isFormOpen && (
          <ProductForm
            mode={formMode}
            product={selectedProduct}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleFormSuccess}
          />
        )
      }

      <AlertDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Products?</AlertDialogTitle>
            <AlertDialogDescription>
              This will download a CSV file containing all currently {searchQuery ? "filtered" : "available"} products ({filteredProducts.length} items).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExport}>
              Download Excel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default AdminProducts;

import { useState, useEffect, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Search, Trash2, ArrowLeft, ArrowUpDown, Download, History, Calendar, Bell, Loader2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductHistory } from "@/components/admin/ProductHistory";
import { BulkProductUpload } from "@/components/admin/BulkProductUpload";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { EmptyFieldsTab } from "@/components/admin/EmptyFieldsTab";
import { ProductWarningIndicator } from "@/components/admin/ProductWarningIndicator";
import { FolderOpen, AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  offer_price: number | null;
  is_on_offer: boolean | null;
  stock_quantity: number | null;
  image_url: string;
  is_active: boolean | null;
  is_featured: boolean | null;
  expiration_date: string | null;
  barcode?: string | null;
  subcategory?: string | null;
  brands?: { name: string } | null;
  categories?: { name: string } | null;
}

// Helper function to determine expiry status
const getExpiryStatus = (expirationDate: string | null) => {
  if (!expirationDate) return { status: 'none', label: '-', color: 'text-muted-foreground' };

  const today = new Date();
  const expiry = new Date(expirationDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'expired', label: 'Expired', color: 'text-red-600 font-medium' };
  } else if (diffDays <= 30) {
    return { status: 'critical', label: `${diffDays}d left`, color: 'text-red-600 font-medium' };
  } else if (diffDays <= 60) {
    return { status: 'warning', label: `${diffDays}d left`, color: 'text-orange-500 font-medium' };
  } else {
    const months = Math.floor(diffDays / 30);
    return { status: 'ok', label: `${months}mo+`, color: 'text-green-600' };
  }
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [sortColumn, setSortColumn] = useState<'name' | 'sku' | 'subcategory' | 'brand' | 'price' | 'stock'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isCheckingExpiry, setIsCheckingExpiry] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const scrollPositionRef = useRef<number>(0); // Track scroll position for edit operations
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'inactive') setStatusFilter('inactive');
    else if (filter === 'active') setStatusFilter('active');
  }, []);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(p => p.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(p => !p.is_active);
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
        case 'subcategory':
          comparison = (a.subcategory || '').localeCompare(b.subcategory || '');
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
  }, [searchQuery, products, sortColumn, sortDirection, statusFilter]);

  const handleSort = (column: 'name' | 'sku' | 'subcategory' | 'brand' | 'price' | 'stock') => {
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
    // Save current scroll position before opening edit dialog
    scrollPositionRef.current = window.scrollY;
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
      setSelectedProducts(new Set());
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleFormSuccess = async () => {
    const savedScrollPosition = scrollPositionRef.current;
    const wasEdit = formMode === 'edit';

    setIsFormOpen(false);
    setSelectedProduct(null);
    await fetchProducts();

    // Restore scroll position after data is loaded and DOM is updated
    if (wasEdit && savedScrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo({ top: savedScrollPosition, behavior: 'instant' });
      }, 300);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean | null, productName: string) => {
    const newStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, is_active: newStatus } : p
      ));
      setFilteredProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, is_active: newStatus } : p
      ));

      toast.success(`${productName} is now ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (error: any) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handleUpdatePrice = async (productId: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, ...updates } : p
      ));

      toast.success("Product updated successfully");
    } catch (error: any) {
      console.error("Error updating product price:", error);
      toast.error("Failed to update product");
    }
  };

  const handleCheckExpiry = async () => {
    try {
      setIsCheckingExpiry(true);
      const { data, error } = await supabase.functions.invoke('check-expiring-products');

      if (error) throw error;

      toast.success(data.message || "Email notification check completed");
    } catch (error: any) {
      console.error("Error checking expiration:", error);
      toast.error(error.message || "Failed to trigger expiration check");
    } finally {
      setIsCheckingExpiry(false);
    }
  };

  const handleExport = () => {
    try {
      // Headers for CSV
      const headers = ["Product Name", "SKU", "Barcode", "Category", "Brand", "Price (BHD)", "Stock", "Status"];

      // Map data to CSV rows
      const rows = filteredProducts.map(product => [
        `"${product.name}"`, // Quote to handle commas in names
        `"${product.sku || ''}"`,
        `"${product.barcode || ''}"`,
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

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    const productNames = filteredProducts
      .filter(p => selectedProducts.has(p.id))
      .map(p => p.name)
      .slice(0, 3)
      .join(", ");
    const moreText = selectedProducts.size > 3 ? ` and ${selectedProducts.size - 3} more` : "";

    if (!confirm(`Are you sure you want to delete ${selectedProducts.size} products?\n\n${productNames}${moreText}\n\nThese products will be moved to trash and automatically deleted after 30 days.`)) {
      return;
    }

    setIsBulkDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const productId of selectedProducts) {
      try {
        const { error } = await supabase.rpc('soft_delete_product', {
          p_product_id: productId,
          p_deletion_reason: 'Bulk deleted from admin panel'
        });
        if (error) throw error;
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Error deleting product:", productId, error);
      }
    }

    setIsBulkDeleting(false);
    setSelectedProducts(new Set());
    fetchProducts();

    if (errorCount === 0) {
      toast.success(`${successCount} products moved to trash successfully`);
    } else {
      toast.warning(`${successCount} deleted, ${errorCount} failed`);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelection = new Set(selectedProducts);
    if (checked) {
      newSelection.add(productId);
    } else {
      newSelection.delete(productId);
    }
    setSelectedProducts(newSelection);
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

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="products" className="gap-2">
            <Edit className="h-4 w-4" />
            All Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="empty-fields" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Empty Fields
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Product History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Products</CardTitle>
                  <CardDescription>
                    {filteredProducts.length} {statusFilter === 'all' ? 'total' : statusFilter} products
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                      className="h-8"
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === 'active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('active')}
                      className="h-8"
                    >
                      Active
                    </Button>
                    <Button
                      variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('inactive')}
                      className="h-8"
                    >
                      Inactive
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 w-full justify-end">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, SKU or barcode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCheckExpiry}
                        disabled={isCheckingExpiry}
                        className="gap-2 border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      >
                        {isCheckingExpiry ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                        Check Expiry
                      </Button>
                      <Button variant="outline" onClick={() => setIsExportDialogOpen(true)} className="gap-2">
                        <Download className="h-4 w-4" />
                        Excel
                      </Button>
                      <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)} className="gap-2">
                        <Upload className="h-4 w-4" />
                        Bulk Upload
                      </Button>
                      {isSelectMode ? (
                        <>
                          {selectedProducts.size > 0 && (
                            <Button
                              variant="destructive"
                              onClick={handleBulkDelete}
                              disabled={isBulkDeleting}
                              className="gap-2"
                            >
                              {isBulkDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Delete ({selectedProducts.size})
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => { setIsSelectMode(false); setSelectedProducts(new Set()); }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => setIsSelectMode(true)} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Select
                          </Button>
                          <Button onClick={handleAddProduct} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </>
                      )}
                    </div>
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
                        {isSelectMode && (
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                              onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            />
                          </TableHead>
                        )}
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
                          onClick={() => handleSort('subcategory')}
                        >
                          <div className="flex items-center gap-1">
                            Subcategory
                            <ArrowUpDown className={`h-3 w-3 ${sortColumn === 'subcategory' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                        </TableHead>
                        <TableHead className="text-right min-w-[120px]">MRP (BHD)</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 transition-colors text-right min-w-[120px]"
                          onClick={() => handleSort('price')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Website Price
                            <ArrowUpDown className={`h-3 w-3 ${sortColumn === 'price' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                        </TableHead>
                        <TableHead className="text-center">On Offer</TableHead>
                        <TableHead className="text-right min-w-[120px]">Offer Price</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
                          onClick={() => handleSort('stock')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Stock
                            <ArrowUpDown className={`h-3 w-3 ${sortColumn === 'stock' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                        </TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className={isSelectMode && selectedProducts.has(product.id) ? 'bg-primary/5' : ''}>
                          {isSelectMode && (
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.has(product.id)}
                                onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {product.name}
                                  <ProductWarningIndicator product={product} />
                                </div>
                                <div className="flex gap-2 mt-1">
                                  {product.sku && (
                                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                      SKU: {product.sku}
                                    </span>
                                  )}
                                  {product.barcode && (
                                    <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 font-mono border border-blue-100">
                                      BC: {product.barcode}
                                    </span>
                                  )}
                                </div>
                                {product.is_featured && (
                                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 mt-1">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.subcategory || '-'}</TableCell>

                          {/* MRP / Original Price */}
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.001"
                              className="w-24 text-right inline-block h-8 px-2"
                              defaultValue={product.compare_at_price || ""}
                              onBlur={(e) => {
                                const val = e.target.value === "" ? null : parseFloat(e.target.value);
                                if (val !== product.compare_at_price) {
                                  handleUpdatePrice(product.id, { compare_at_price: val });
                                }
                              }}
                            />
                          </TableCell>

                          {/* Website Price */}
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.001"
                              className="w-24 text-right inline-block h-8 px-2 font-semibold"
                              defaultValue={product.price}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val !== product.price) {
                                  handleUpdatePrice(product.id, { price: val });
                                }
                              }}
                            />
                          </TableCell>

                          {/* On Offer Toggle */}
                          <TableCell className="text-center">
                            <Switch
                              checked={product.is_on_offer ?? false}
                              onCheckedChange={(checked) => handleUpdatePrice(product.id, { is_on_offer: checked })}
                            />
                          </TableCell>

                          {/* Offer Price */}
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.001"
                              disabled={!product.is_on_offer}
                              className={`w-24 text-right inline-block h-8 px-2 ${product.is_on_offer ? 'border-primary/50 bg-primary/5 font-bold text-primary' : 'opacity-40'}`}
                              defaultValue={product.offer_price || ""}
                              onBlur={(e) => {
                                const val = e.target.value === "" ? null : parseFloat(e.target.value);
                                if (val !== product.offer_price) {
                                  handleUpdatePrice(product.id, { offer_price: val });
                                }
                              }}
                            />
                          </TableCell>

                          <TableCell className="text-right font-medium">
                            {product.stock_quantity ?? 0}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const expiry = getExpiryStatus(product.expiration_date);
                              return (
                                <div className="flex items-center gap-1">
                                  {product.expiration_date && (
                                    <Calendar className={`h-3 w-3 ${expiry.color}`} />
                                  )}
                                  <span className={expiry.color}>
                                    {expiry.label}
                                  </span>
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={product.is_active ?? false}
                                onCheckedChange={() => handleToggleStatus(product.id, product.is_active, product.name)}
                              />
                              <span className={`text-sm ${product.is_active ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                                {product.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
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
                      {filteredProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={isSelectMode ? 11 : 10} className="h-24 text-center text-muted-foreground font-medium">
                            No {statusFilter === "all" ? "" : statusFilter} products found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories & Subcategories</CardTitle>
              <CardDescription>
                Manage product categories and their subcategories. New categories will appear in navigation automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empty-fields">
          <EmptyFieldsTab products={products} onEditProduct={handleEditProduct} />
        </TabsContent>

        <TabsContent value="history">
          <ProductHistory />
        </TabsContent>
      </Tabs >

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

      <BulkProductUpload
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={fetchProducts}
      />

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

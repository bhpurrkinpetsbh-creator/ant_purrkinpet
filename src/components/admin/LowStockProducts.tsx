import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, RefreshCw, Edit } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { StockAdjustment } from "./StockAdjustment";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  price: number;
  image_url: string;
  category_name: string | null;
  brand_name: string | null;
}

export const LowStockProducts = () => {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<LowStockProduct | null>(null);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const { fetchLowStockProducts } = useInventory();

  const loadLowStockProducts = async () => {
    setLoading(true);
    const data = await fetchLowStockProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleAdjustStock = (product: LowStockProduct) => {
    setSelectedProduct(product);
    setIsAdjustmentDialogOpen(true);
  };

  const handleAdjustmentSuccess = () => {
    loadLowStockProducts();
  };

  useEffect(() => {
    loadLowStockProducts();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Products
          </CardTitle>
          <CardDescription>Products that need restocking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Products
              {products.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {products.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLowStockProducts}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>All products are well stocked!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md"
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{product.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {product.sku && <span>SKU: {product.sku}</span>}
                    {product.category_name && (
                      <>
                        <span>•</span>
                        <span>{product.category_name}</span>
                      </>
                    )}
                    {product.brand_name && (
                      <>
                        <span>•</span>
                        <span>{product.brand_name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          (product.stock_quantity ?? 0) === 0
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        Stock: {product.stock_quantity ?? 0}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Threshold: {product.low_stock_threshold}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdjustStock(product)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Adjust
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

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
    </Card>
  );
};

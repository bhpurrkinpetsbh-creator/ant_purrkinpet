import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, RefreshCw, ArrowUp, ArrowDown, RotateCw } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { format } from "date-fns";

interface Transaction {
  id: string;
  product_id: string;
  transaction_type: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  products?: {
    name: string;
    sku: string | null;
    image_url: string;
  };
}

export const InventoryTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchRecentTransactions } = useInventory();

  const loadTransactions = async () => {
    setLoading(true);
    const data = await fetchRecentTransactions(100);
    setTransactions(data as any);
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'stock_in':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'stock_out':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'order':
        return <ArrowDown className="h-4 w-4 text-blue-600" />;
      case 'return':
        return <ArrowUp className="h-4 w-4 text-purple-600" />;
      case 'adjustment':
        return <RotateCw className="h-4 w-4 text-orange-600" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getTransactionBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'stock_in':
        return 'default';
      case 'stock_out':
        return 'destructive';
      case 'order':
        return 'secondary';
      case 'return':
        return 'outline';
      case 'adjustment':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Inventory Transactions
          </CardTitle>
          <CardDescription>Recent inventory changes and audit trail</CardDescription>
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
              <History className="h-5 w-5" />
              Inventory Transactions
            </CardTitle>
            <CardDescription>Recent inventory changes and audit trail</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTransactions}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No inventory transactions yet</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Previous</TableHead>
                  <TableHead className="text-right">New</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.products?.image_url && (
                          <img
                            src={transaction.products.image_url}
                            alt={transaction.products.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm">
                            {transaction.products?.name || 'Unknown Product'}
                          </div>
                          {transaction.products?.sku && (
                            <div className="text-xs text-muted-foreground">
                              SKU: {transaction.products.sku}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getTransactionBadgeVariant(transaction.transaction_type)}
                        className="gap-1"
                      >
                        {getTransactionIcon(transaction.transaction_type)}
                        {formatTransactionType(transaction.transaction_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          transaction.quantity_change > 0
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {transaction.quantity_change > 0 ? '+' : ''}
                        {transaction.quantity_change}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {transaction.previous_quantity}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {transaction.new_quantity}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {transaction.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

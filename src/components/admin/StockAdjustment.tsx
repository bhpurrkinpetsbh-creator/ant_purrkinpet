import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory } from "@/hooks/useInventory";
import { Package, Plus, Minus, RefreshCw } from "lucide-react";

interface StockAdjustmentProps {
  productId: string;
  productName: string;
  currentStock: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StockAdjustment = ({
  productId,
  productName,
  currentStock,
  isOpen,
  onClose,
  onSuccess
}: StockAdjustmentProps) => {
  const [adjustmentType, setAdjustmentType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('stock_in');
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { adjustStock } = useInventory();

  const handleSubmit = async () => {
    const quantityNum = parseInt(quantity);

    if (isNaN(quantityNum) || quantityNum === 0) {
      return;
    }

    setLoading(true);

    // Determine the actual quantity change based on type
    let quantityChange = quantityNum;
    if (adjustmentType === 'stock_out') {
      quantityChange = -quantityNum;
    }

    const success = await adjustStock(productId, quantityChange, adjustmentType, notes);

    setLoading(false);

    if (success) {
      setQuantity('');
      setNotes('');
      setAdjustmentType('stock_in');
      onClose();
      onSuccess?.();
    }
  };

  const getNewStock = () => {
    const quantityNum = parseInt(quantity) || 0;
    if (adjustmentType === 'stock_out') {
      return currentStock - quantityNum;
    }
    return currentStock + quantityNum;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Adjust Stock
          </DialogTitle>
          <DialogDescription>
            Make manual adjustments to inventory for <strong>{productName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Stock</Label>
            <div className="text-2xl font-bold">{currentStock} units</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Adjustment Type</Label>
            <Select
              value={adjustmentType}
              onValueChange={(value: any) => setAdjustmentType(value)}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock_in">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>Stock In (Receiving/Restock)</span>
                  </div>
                </SelectItem>
                <SelectItem value="stock_out">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-600" />
                    <span>Stock Out (Damage/Loss)</span>
                  </div>
                </SelectItem>
                <SelectItem value="adjustment">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-orange-600" />
                    <span>Manual Adjustment (Count Correction)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {quantity && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">New Stock Level</div>
              <div className="text-2xl font-bold">
                {getNewStock()} units
                <span className={`text-base ml-2 ${
                  adjustmentType === 'stock_out' ? 'text-red-600' : 'text-green-600'
                }`}>
                  ({adjustmentType === 'stock_out' ? '-' : '+'}{quantity})
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this adjustment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!quantity || loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Adjust Stock'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

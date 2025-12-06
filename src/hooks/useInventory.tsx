import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type InventoryTransaction = Tables<"inventory_transactions">;
type Product = Tables<"products">;

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

export const useInventory = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch low stock products
  const fetchLowStockProducts = async (): Promise<LowStockProduct[]> => {
    try {
      const { data, error } = await supabase
        .from('low_stock_products')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching low stock products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch low stock products",
        variant: "destructive"
      });
      return [];
    }
  };

  // Fetch inventory transactions for a specific product
  const fetchProductTransactions = async (productId: string): Promise<InventoryTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching product transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory transactions",
        variant: "destructive"
      });
      return [];
    }
  };

  // Fetch all recent inventory transactions
  const fetchRecentTransactions = async (limit: number = 50): Promise<InventoryTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*, products(name, sku, image_url)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching recent transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory transactions",
        variant: "destructive"
      });
      return [];
    }
  };

  // Manual stock adjustment
  const adjustStock = async (
    productId: string,
    quantityChange: number,
    transactionType: 'stock_in' | 'stock_out' | 'adjustment',
    notes?: string
  ): Promise<boolean> => {
    try {
      // Call the Supabase function to log the transaction
      const { error } = await supabase.rpc('log_inventory_transaction', {
        p_product_id: productId,
        p_transaction_type: transactionType,
        p_quantity_change: quantityChange,
        p_reference_type: 'manual',
        p_notes: notes || null
      });

      if (error) throw error;

      toast({
        title: "Stock adjusted",
        description: `Successfully adjusted stock by ${quantityChange > 0 ? '+' : ''}${quantityChange}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to adjust stock",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get current stock for a product
  const getProductStock = async (productId: string): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data?.stock_quantity ?? null;
    } catch (error: any) {
      console.error('Error fetching product stock:', error);
      return null;
    }
  };

  // Check if product is in stock
  const isProductInStock = async (productId: string, requestedQuantity: number = 1): Promise<boolean> => {
    const currentStock = await getProductStock(productId);
    if (currentStock === null) return false;
    return currentStock >= requestedQuantity;
  };

  // Update low stock threshold for a product
  const updateLowStockThreshold = async (productId: string, threshold: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ low_stock_threshold: threshold })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Threshold updated",
        description: `Low stock threshold set to ${threshold}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating threshold:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update threshold",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    loading,
    fetchLowStockProducts,
    fetchProductTransactions,
    fetchRecentTransactions,
    adjustStock,
    getProductStock,
    isProductInStock,
    updateLowStockThreshold
  };
};

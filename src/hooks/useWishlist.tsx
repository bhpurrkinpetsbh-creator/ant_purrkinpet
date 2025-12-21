import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWishlistItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            price,
            image_url,
            stock_quantity,
            compare_at_price,
            offer_price,
            is_on_offer
          )
        `)
        .eq('customer_id', user.id);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchWishlistItems();
    });

    // Subscribe to real-time wishlist changes
    const wishlistChannel = supabase
      .channel('wishlist_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist_items'
        },
        () => {
          fetchWishlistItems();
        }
      )
      .subscribe();

    // Fallback cross-component sync
    const onWishlistUpdated = () => { fetchWishlistItems(); };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'wishlist_updated_at') fetchWishlistItems();
    };
    window.addEventListener('wishlist:updated', onWishlistUpdated as EventListener);
    window.addEventListener('storage', onStorage);

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(wishlistChannel);
      window.removeEventListener('wishlist:updated', onWishlistUpdated as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const addToWishlist = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to wishlist",
          variant: "destructive"
        });
        return false;
      }

      // Ensure customer profile exists
      const { data: customerProfile } = await supabase
        .from('customers')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!customerProfile) {
        const { error: customerInsertError } = await supabase
          .from('customers')
          .insert({ id: user.id, full_name: user.email });
        if (customerInsertError) throw customerInsertError;
      }

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('customer_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Already in wishlist",
          description: "This item is already in your wishlist"
        });
        return false;
      }

      // Add to wishlist
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          customer_id: user.id,
          product_id: productId
        });

      if (error) throw error;

      await fetchWishlistItems();
      window.dispatchEvent(new Event('wishlist:updated'));
      try { localStorage.setItem('wishlist_updated_at', Date.now().toString()); } catch { }

      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist"
      });

      return true;
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to wishlist",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('customer_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchWishlistItems();
      window.dispatchEvent(new Event('wishlist:updated'));
      try { localStorage.setItem('wishlist_updated_at', Date.now().toString()); } catch { }

      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist"
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from wishlist",
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const wishlistCount = wishlistItems.length;

  return {
    wishlistItems,
    wishlistCount,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist: fetchWishlistItems
  };
};

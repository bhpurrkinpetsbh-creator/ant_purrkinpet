-- Update existing product_images records to copy SKU from products table
UPDATE public.product_images pi
SET sku = p.sku
FROM public.products p
WHERE pi.product_id = p.id;

-- Create function to automatically set SKU from products table
CREATE OR REPLACE FUNCTION public.sync_product_image_sku()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get SKU from products table
  SELECT sku INTO NEW.sku
  FROM public.products
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-populate SKU on insert or update
CREATE TRIGGER sync_product_image_sku_trigger
BEFORE INSERT OR UPDATE OF product_id ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_image_sku();
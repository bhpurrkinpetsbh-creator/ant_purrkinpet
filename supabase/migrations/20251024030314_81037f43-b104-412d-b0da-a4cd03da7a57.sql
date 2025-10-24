-- Add SKU column to product_images table
ALTER TABLE public.product_images
ADD COLUMN sku character varying;

-- Add index on SKU for better query performance
CREATE INDEX idx_product_images_sku ON public.product_images(sku);

-- Add comment to document the column
COMMENT ON COLUMN public.product_images.sku IS 'Product SKU for easier identification and bulk updates';
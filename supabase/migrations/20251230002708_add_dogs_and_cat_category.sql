-- SQL to add "Dogs and Cat" category with combined images
-- First, let's check what images Dogs and Cats have
-- Run this in Supabase SQL Editor to see current images:
-- SELECT name, slug, image_url FROM categories WHERE slug IN ('dogs', 'cats');

-- Option 1: If you want to use the Dogs image
-- INSERT INTO categories (name, slug, description, is_active, display_order, image_url)
-- SELECT 'Dogs and Cat', 'dogs-and-cat', 'Products for both dogs and cats', true, 8,
--        (SELECT image_url FROM categories WHERE slug = 'dogs' LIMIT 1);

-- Option 2: If you want to use the Cats image  
-- INSERT INTO categories (name, slug, description, is_active, display_order, image_url)
-- SELECT 'Dogs and Cat', 'dogs-and-cat', 'Products for both dogs and cats', true, 8,
--        (SELECT image_url FROM categories WHERE slug = 'cats' LIMIT 1);

-- Option 3: Use a composite image (recommended - we'll need to create this)
-- For now, let's use the Dogs image as default:
INSERT INTO categories (name, slug, description, is_active, display_order, image_url)
SELECT 
    'Dogs and Cat' as name,
    'dogs-and-cat' as slug,
    'Products suitable for both dogs and cats' as description,
    true as is_active,
    8 as display_order,
    (SELECT image_url FROM categories WHERE slug = 'dogs' LIMIT 1) as image_url
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'dogs-and-cat'
);

-- If you want to update it later with a custom combined image:
-- UPDATE categories 
-- SET image_url = 'YOUR_IMAGE_URL_HERE'
-- WHERE slug = 'dogs-and-cat';

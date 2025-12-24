-- Migration: Add Rabbits and Turtles Categories
-- Description: Adds two new main pet categories: Rabbits and Turtles

-- Insert Rabbits category
INSERT INTO categories (name, slug, description, is_active, display_order)
VALUES ('Rabbits', 'rabbits', 'Everything for your pet rabbits - food, hutches, bedding, toys and more', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert Turtles category
INSERT INTO categories (name, slug, description, is_active, display_order)
VALUES ('Turtles', 'turtles', 'Complete turtle care - food, tanks, lighting, heating and accessories', true, 7)
ON CONFLICT (slug) DO NOTHING;

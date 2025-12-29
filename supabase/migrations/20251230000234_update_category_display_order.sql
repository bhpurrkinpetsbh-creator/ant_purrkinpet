-- Update category display order
-- New order: Dogs(1), Cats(2), Birds(3), Fishes(4), Rabbits(5), Turtles(6), Small Pets(7)

UPDATE categories SET display_order = 1 WHERE slug = 'dogs';
UPDATE categories SET display_order = 2 WHERE slug = 'cats';
UPDATE categories SET display_order = 3 WHERE slug = 'birds';
UPDATE categories SET display_order = 4 WHERE slug = 'fish';
UPDATE categories SET display_order = 5 WHERE slug = 'rabbits';
UPDATE categories SET display_order = 6 WHERE slug = 'turtles';
UPDATE categories SET display_order = 7 WHERE slug = 'small-pets';

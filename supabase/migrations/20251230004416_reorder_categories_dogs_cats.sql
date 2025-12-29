-- Reorder categories to place 'Dogs & Cats' after 'Cats'

-- 1. Dogs
UPDATE categories SET display_order = 1 WHERE slug = 'dogs';

-- 2. Cats
UPDATE categories SET display_order = 2 WHERE slug = 'cats';

-- 3. Dogs & Cats (dogs-cats)
UPDATE categories SET display_order = 3 WHERE slug = 'dogs-cats';
-- Handle the other slug variation just in case
UPDATE categories SET display_order = 3 WHERE slug = 'dogs-and-cat';

-- 4. Birds
UPDATE categories SET display_order = 4 WHERE slug = 'birds';

-- 5. Fish
UPDATE categories SET display_order = 5 WHERE slug = 'fish';

-- 6. Rabbits
UPDATE categories SET display_order = 6 WHERE slug = 'rabbits';

-- 7. Turtles
UPDATE categories SET display_order = 7 WHERE slug = 'turtles';

-- 8. Small Pets
UPDATE categories SET display_order = 8 WHERE slug = 'small-pets';

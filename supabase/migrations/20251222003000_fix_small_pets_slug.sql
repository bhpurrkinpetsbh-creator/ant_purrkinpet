-- Update the slug for 'Small Pets' to use a hyphen instead of a space
-- This ensures consistency with the frontend links and follows URL best practices
UPDATE categories 
SET slug = 'small-pets' 
WHERE name = 'Small Pets' OR slug = 'small pets';

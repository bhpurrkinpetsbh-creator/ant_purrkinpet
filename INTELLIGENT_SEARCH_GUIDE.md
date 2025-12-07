# Intelligent Search System - User Guide

**Date:** December 6, 2025
**Version:** 1.0.0

## Overview

The PurrkinPets shop now features an **intelligent search system** that understands context and keywords, making it easier for customers to find exactly what they're looking for.

## How It Works

### Previous Search (Simple Substring Match)
- Only searched product names
- Required exact word matches
- Example: "cat" would only find products with "cat" in the name

### New Intelligent Search (Context-Aware)
- Searches across multiple fields: product name, description, and category
- Understands pet types and product types
- Uses keyword mapping and relevance scoring
- Provides smart results ranked by relevance

## Search Examples

### Pet Type Searches

| Search Query | What It Finds |
|--------------|---------------|
| `cat` | All cat-related products (food, treats, toys, accessories) |
| `dog` | All dog-related products |
| `fish` | Fish food, aquarium supplies, fish accessories |
| `bird` | Bird food, cages, bird toys |
| `kitten` | Kitten-specific products |
| `puppy` | Puppy-specific products |

### Product Type Searches

| Search Query | What It Finds |
|--------------|---------------|
| `treats` or `treat` | All pet treats across all categories |
| `food` | All pet food products |
| `toys` | All pet toys |
| `accessories` | Collars, leashes, carriers, etc. |
| `bowls` | Food and water bowls |
| `beds` | Pet beds and sleeping mats |

### Combined Searches (Most Powerful)

| Search Query | What It Finds |
|--------------|---------------|
| `cat treats` | Only cat treats (combines both keywords) |
| `dog toys` | Only dog toys |
| `fish food` | Only fish food |
| `dry food` | Dry/kibble food for all pets |
| `wet food` | Wet/canned food for all pets |
| `cat accessories` | Cat collars, carriers, etc. |
| `dog bowl` | Dog food/water bowls |

### Food Characteristic Searches

| Search Query | What It Finds |
|--------------|---------------|
| `dry food` | Dry kibble products |
| `wet food` | Canned/wet food products |
| `organic` | Organic pet food |
| `grain free` | Grain-free products |
| `raw` | Raw or freeze-dried food |

## Technical Features

### Keyword Recognition

The system recognizes these keyword categories:

1. **Pet Types:**
   - Cat: cat, cats, feline, kitten, kitty
   - Dog: dog, dogs, canine, puppy, puppies
   - Fish: fish, aquarium, aquatic
   - Bird: bird, birds, avian, parrot, parakeet, budgie
   - Rabbit: rabbit, bunny, rabbits, bunnies
   - Hamster: hamster, gerbil, guinea pig
   - Reptile: reptile, lizard, snake, turtle, tortoise

2. **Product Types:**
   - Treats: treat, treats, snack, snacks, chew, chews
   - Food: food, meal, nutrition, diet, kibble, pellet, pellets
   - Toys: toy, toys, play, ball, interactive
   - Accessories: accessory, accessories, supplies
   - Bowls: bowl, feeder, dish
   - Beds: bed, sleeping, cushion, mat
   - Collars: collar, harness
   - Leashes: leash, lead
   - Carriers: carrier, crate, cage
   - Grooming: grooming, brush, shampoo, nail
   - Litter: litter, sandbox
   - Tanks: tank, aquarium

3. **Food Characteristics:**
   - Dry: dry, kibble
   - Wet: wet, canned, can
   - Organic: organic, natural
   - Grain-free: grain-free, grain free, grainless
   - Raw: raw, freeze-dried, freeze dried

### Relevance Scoring System

Products are ranked by relevance score based on:

- **Exact name match:** 100 points (highest priority)
- **Name starts with query:** 50 points
- **Name contains query:** 30 points
- **Pet type match in name:** 40 points
- **Pet type match in category:** 35 points
- **Product type match in name:** 40 points
- **Product type match in category:** 35 points
- **Category name match:** 25 points
- **Food characteristic match:** 20 points (name), 10 points (description)
- **Description contains query:** 15 points
- **Other terms match:** 15 points (name), 10 points (category), 5 points (description)

**Minimum score threshold:** 10 points (filters out irrelevant results)

## Implementation Files

### 1. Search Utility
**File:** `src/utils/intelligentSearch.ts`

Main functions:
- `intelligentProductSearch()` - Main search function
- `getSearchSuggestions()` - Future search autocomplete feature

### 2. Shop Page Integration
**File:** `src/pages/Shop.tsx`

Changes:
- Added `description` field to product queries
- Imported and integrated `intelligentProductSearch` function
- Replaced simple substring search with intelligent search
- Maintained category filtering and sorting functionality

## Testing the Search

### Test Scenarios

1. **Test Pet-Specific Search:**
   - Search: `cat treats`
   - Expected: Only cat treats shown
   - Search: `dog toys`
   - Expected: Only dog toys shown

2. **Test Product Type Search:**
   - Search: `treats`
   - Expected: All treats (cat, dog, fish, etc.)
   - Search: `food`
   - Expected: All food products

3. **Test Food Characteristics:**
   - Search: `dry food`
   - Expected: Dry kibble products
   - Search: `wet food`
   - Expected: Canned/wet food products

4. **Test Category + Search Combination:**
   - Select Category: `cat-food`
   - Search: `dry`
   - Expected: Only dry cat food

5. **Test Relevance Ranking:**
   - Search: `cat`
   - Expected: Products with "cat" in name appear first, followed by products with cat in category, then description

## Future Enhancements

Potential features to add:

1. **Search Autocomplete**
   - Use `getSearchSuggestions()` function
   - Show dropdown with suggestions as user types

2. **Search History**
   - Store recent searches in localStorage
   - Quick access to previous searches

3. **Popular Searches**
   - Track most common search queries
   - Display popular searches on shop page

4. **Filter by Brand**
   - Add brand filter to search results
   - Search within specific brands

5. **Advanced Filters**
   - Price range filtering
   - Rating filtering
   - Stock availability filtering

6. **Search Analytics**
   - Track search queries
   - Identify products customers are looking for but can't find
   - Improve inventory based on search data

## Browser Compatibility

The search system works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **No database changes required** - search happens client-side
- **Fast response time** - instant filtering as you type
- **Optimized scoring** - efficient relevance calculation
- **Memory efficient** - processes only loaded products

## Support

For issues or questions about the intelligent search:
1. Check if products have proper descriptions in database
2. Verify category names are descriptive
3. Ensure product names include relevant keywords
4. Test with different search terms from the examples above

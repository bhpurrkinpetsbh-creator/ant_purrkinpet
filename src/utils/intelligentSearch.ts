/**
 * Intelligent Product Search Utility
 *
 * Provides context-aware search that understands:
 * - Pet types (cat, dog, fish, bird, etc.)
 * - Product types (treats, food, toys, accessories, etc.)
 * - Product characteristics (dry, wet, organic, etc.)
 */

export type ProductForSearch = {
  id: string;
  name: string;
  description: string | null;
  categories?: {
    name: string;
    slug: string;
  } | null;
  brand_id: string | null;
  [key: string]: any;
};

// Keyword mappings for intelligent search
const PET_TYPE_KEYWORDS = {
  cat: ['cat', 'cats', 'feline', 'kitten', 'kitty'],
  dog: ['dog', 'dogs', 'canine', 'puppy', 'puppies'],
  fish: ['fish', 'aquarium', 'aquatic'],
  bird: ['bird', 'birds', 'avian', 'parrot', 'parakeet', 'budgie'],
  rabbit: ['rabbit', 'bunny', 'rabbits', 'bunnies'],
  hamster: ['hamster', 'gerbil', 'guinea pig'],
  reptile: ['reptile', 'lizard', 'snake', 'turtle', 'tortoise'],
};

const PRODUCT_TYPE_KEYWORDS = {
  treat: ['treat', 'treats', 'snack', 'snacks', 'chew', 'chews'],
  food: ['food', 'meal', 'nutrition', 'diet', 'kibble', 'pellet', 'pellets'],
  toy: ['toy', 'toys', 'play', 'ball', 'interactive'],
  accessory: ['accessory', 'accessories', 'supplies'],
  bowl: ['bowl', 'feeder', 'dish'],
  bed: ['bed', 'sleeping', 'cushion', 'mat'],
  collar: ['collar', 'harness'],
  leash: ['leash', 'lead'],
  carrier: ['carrier', 'crate', 'cage'],
  grooming: ['grooming', 'brush', 'shampoo', 'nail'],
  litter: ['litter', 'sandbox'],
  tank: ['tank', 'aquarium'],
};

const FOOD_CHARACTERISTICS = {
  dry: ['dry', 'kibble'],
  wet: ['wet', 'canned', 'can'],
  organic: ['organic', 'natural'],
  grain_free: ['grain-free', 'grain free', 'grainless'],
  raw: ['raw', 'freeze-dried', 'freeze dried'],
};

/**
 * Normalizes text for search comparison
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Checks if text contains any of the keywords
 */
function containsAnyKeyword(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text);
  return keywords.some(keyword => normalized.includes(keyword));
}

/**
 * Extracts search context from query
 */
function extractSearchContext(query: string) {
  const normalized = normalizeText(query);
  const tokens = normalized.split(/\s+/);

  const context = {
    petTypes: [] as string[],
    productTypes: [] as string[],
    characteristics: [] as string[],
    otherTerms: [] as string[],
  };

  // Check for pet types
  Object.entries(PET_TYPE_KEYWORDS).forEach(([type, keywords]) => {
    if (containsAnyKeyword(normalized, keywords)) {
      context.petTypes.push(type);
    }
  });

  // Check for product types
  Object.entries(PRODUCT_TYPE_KEYWORDS).forEach(([type, keywords]) => {
    if (containsAnyKeyword(normalized, keywords)) {
      context.productTypes.push(type);
    }
  });

  // Check for food characteristics
  Object.entries(FOOD_CHARACTERISTICS).forEach(([char, keywords]) => {
    if (containsAnyKeyword(normalized, keywords)) {
      context.characteristics.push(char);
    }
  });

  // Collect remaining terms that don't match keywords
  tokens.forEach(token => {
    const isKeyword =
      Object.values(PET_TYPE_KEYWORDS).some(keywords => keywords.includes(token)) ||
      Object.values(PRODUCT_TYPE_KEYWORDS).some(keywords => keywords.includes(token)) ||
      Object.values(FOOD_CHARACTERISTICS).some(keywords => keywords.includes(token));

    if (!isKeyword && token.length > 2) {
      context.otherTerms.push(token);
    }
  });

  return context;
}

/**
 * Calculates relevance score for a product based on search query
 */
function calculateRelevanceScore(
  product: ProductForSearch,
  query: string,
  context: ReturnType<typeof extractSearchContext>
): number {
  let score = 0;
  const normalized = normalizeText(query);
  const productName = normalizeText(product.name);
  const productDesc = normalizeText(product.description || '');
  const categoryName = normalizeText(product.categories?.name || '');

  // Exact name match - highest priority (100 points)
  if (productName === normalized) {
    score += 100;
  }

  // Name starts with query (50 points)
  if (productName.startsWith(normalized)) {
    score += 50;
  }

  // Name contains query (30 points)
  if (productName.includes(normalized)) {
    score += 30;
  }

  // Category name matches (25 points)
  if (categoryName.includes(normalized)) {
    score += 25;
  }

  // Description contains query (15 points)
  if (productDesc.includes(normalized)) {
    score += 15;
  }

  // Pet type matching
  context.petTypes.forEach(petType => {
    const keywords = PET_TYPE_KEYWORDS[petType as keyof typeof PET_TYPE_KEYWORDS];
    if (containsAnyKeyword(productName, keywords)) {
      score += 40;
    }
    if (containsAnyKeyword(categoryName, keywords)) {
      score += 35;
    }
    if (containsAnyKeyword(productDesc, keywords)) {
      score += 10;
    }
  });

  // Product type matching
  context.productTypes.forEach(productType => {
    const keywords = PRODUCT_TYPE_KEYWORDS[productType as keyof typeof PRODUCT_TYPE_KEYWORDS];
    if (containsAnyKeyword(productName, keywords)) {
      score += 40;
    }
    if (containsAnyKeyword(categoryName, keywords)) {
      score += 35;
    }
    if (containsAnyKeyword(productDesc, keywords)) {
      score += 10;
    }
  });

  // Food characteristics matching
  context.characteristics.forEach(char => {
    const keywords = FOOD_CHARACTERISTICS[char as keyof typeof FOOD_CHARACTERISTICS];
    if (containsAnyKeyword(productName, keywords)) {
      score += 20;
    }
    if (containsAnyKeyword(productDesc, keywords)) {
      score += 10;
    }
  });

  // Other terms matching
  context.otherTerms.forEach(term => {
    if (productName.includes(term)) {
      score += 15;
    }
    if (categoryName.includes(term)) {
      score += 10;
    }
    if (productDesc.includes(term)) {
      score += 5;
    }
  });

  return score;
}

/**
 * Intelligent product search function
 *
 * @param products - Array of products to search
 * @param query - Search query string
 * @param minScore - Minimum relevance score to include in results (default: 10)
 * @returns Filtered and sorted products by relevance
 */
export function intelligentProductSearch<T extends ProductForSearch>(
  products: T[],
  query: string,
  minScore: number = 10
): T[] {
  // Empty query returns all products
  if (!query || query.trim().length === 0) {
    return products;
  }

  const context = extractSearchContext(query);

  // Calculate scores for all products
  const scoredProducts = products.map(product => ({
    product,
    score: calculateRelevanceScore(product, query, context),
  }));

  // Filter by minimum score and sort by score descending
  return scoredProducts
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);
}

/**
 * Generates search suggestions based on common queries
 */
export function getSearchSuggestions(query: string): string[] {
  if (!query || query.length < 2) {
    return [];
  }

  const normalized = normalizeText(query);
  const suggestions: string[] = [];

  // Pet type suggestions
  Object.entries(PET_TYPE_KEYWORDS).forEach(([type, keywords]) => {
    if (keywords.some(k => k.startsWith(normalized))) {
      suggestions.push(`${type} food`, `${type} treats`, `${type} toys`);
    }
  });

  // Product type suggestions
  Object.entries(PRODUCT_TYPE_KEYWORDS).forEach(([type, keywords]) => {
    if (keywords.some(k => k.startsWith(normalized))) {
      suggestions.push(type);
    }
  });

  // Return unique suggestions (max 5)
  return [...new Set(suggestions)].slice(0, 5);
}

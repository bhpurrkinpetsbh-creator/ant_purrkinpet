/**
 * Natural Language Parser for Customer Queries
 * 
 * Extracts intent from queries like:
 * "cat treats less than 10 bd"
 * "show me wet food of meo"
 * "dog products rich in bone strength"
 */

export interface SearchIntent {
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    brands: string[];
    keywords: string[];
    rawQuery: string;
    searchTerms: string;
}

const CATEGORY_MAP: Record<string, string[]> = {
    dogs: ['dog', 'dogs', 'puppy', 'puppies', 'canine'],
    cats: ['cat', 'cats', 'kitten', 'kittens', 'feline'],
    fish: ['fish', 'aquarium', 'aquatic', 'tank'],
    birds: ['bird', 'birds', 'parrot', 'parakeet'],
    'small pets': ['small pet', 'small pets', 'rabbit', 'bunny', 'hamster', 'guinea pig'],
};

const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
    'Dry Food': ['dry food', 'kibble', 'dry'],
    'Wet Food': ['wet food', 'canned', 'can', 'wet'],
    'Treats': ['treat', 'treats', 'snack', 'snacks', 'chew'],
    'Toys': ['toy', 'toys', 'play'],
    'Accessories': ['accessory', 'accessories', 'collar', 'leash', 'harness', 'bed'],
};

// Known brands - this should ideally be dynamic but for the parser we can start with common ones
const KNOWN_BRANDS = ['meo', 'royal canin', 'purina', 'pedigree', 'whiskas', 'sheba', 'applaws'];

export function parseSearchQuery(query: string): SearchIntent {
    const normalized = query.toLowerCase().trim();
    const intent: SearchIntent = {
        brands: [],
        keywords: [],
        rawQuery: query,
        searchTerms: "",
    };

    // 1. Extract Price
    // Handle "between X and Y"
    const betweenRegex = /(?:between|from)\s*(\d+(?:\.\d+)?)\s*(?:and|to|&|-)\s*(\d+(?:\.\d+)?)\s*(?:bd|bhd|dinars?)?/i;
    const betweenMatch = normalized.match(betweenRegex);
    if (betweenMatch) {
        intent.minPrice = parseFloat(betweenMatch[1]);
        intent.maxPrice = parseFloat(betweenMatch[2]);
    } else {
        // Handle "less than / under / below"
        const maxPriceRegex = /(?:less than|under|below|up to|<)\s*(\d+(?:\.\d+)?)\s*(?:bd|bhd|dinars?)?/i;
        const maxMatch = normalized.match(maxPriceRegex);
        if (maxMatch) {
            intent.maxPrice = parseFloat(maxMatch[1]);
        }

        // Handle "greater than / above / over"
        const minPriceRegex = /(?:greater than|above|over|more than|>)\s*(\d+(?:\.\d+)?)\s*(?:bd|bhd|dinars?)?/i;
        const minMatch = normalized.match(minPriceRegex);
        if (minMatch) {
            intent.minPrice = parseFloat(minMatch[1]);
        }
    }

    // 2. Extract Category
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => normalized.includes(k))) {
            intent.category = category;
            break;
        }
    }

    // 3. Extract Subcategory
    for (const [sub, keywords] of Object.entries(SUBCATEGORY_KEYWORDS)) {
        if (keywords.some(k => normalized.includes(k))) {
            intent.subcategory = sub;
            break;
        }
    }

    // 4. Extract Brands
    KNOWN_BRANDS.forEach(brand => {
        if (normalized.includes(brand)) {
            intent.brands.push(brand);
        }
    });

    // 5. Extract Keywords (benefits/characteristics)
    const benefitKeywords = [
        'bone strength', 'hair growth', 'skin care', 'digestive',
        'indoor', 'outdoor', 'sterilized', 'senior', 'junior',
        'shiny coat', 'joint health', 'weight control', 'dental care',
        'immune system', 'energy', 'vitality', 'hypoallergenic'
    ];
    benefitKeywords.forEach(kb => {
        if (normalized.includes(kb)) {
            intent.keywords.push(kb);
        }
    });

    // 6. Clean up "noise" words from original query for search string
    const noiseWords = [
        'show me', 'all', 'less than', 'under', 'below', 'bd', 'bhd', 'dinars', 'dinar',
        'than', 'of', 'in', 'rich', 'products', 'product', 'items', 'item', 'for', 'with',
        'greater than', 'above', 'over', 'more than', 'between', 'from', 'and', 'up to'
    ];

    let searchTerms = normalized;
    noiseWords.forEach(word => {
        searchTerms = searchTerms.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    });

    // Also remove the category/subcategory names if found to avoid redundancy in search
    if (intent.category) {
        const catKeywords = CATEGORY_MAP[intent.category];
        catKeywords.forEach(k => searchTerms = searchTerms.replace(new RegExp(`\\b${k}\\b`, 'g'), ''));
    }

    intent.keywords.push(...searchTerms.trim().split(/\s+/).filter(t => t.length > 2));

    // Remove duplicates and noise from keywords
    intent.keywords = [...new Set(intent.keywords)].filter(k => k.length > 0);
    intent.searchTerms = searchTerms.trim();

    return intent;
}

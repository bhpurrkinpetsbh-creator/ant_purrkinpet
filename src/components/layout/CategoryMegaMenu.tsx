import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Home, Dog, Cat, Bird, Fish, Rabbit, Tag, Sparkles } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
}

// Subcategory definitions matching Shop.tsx
const SUBCATEGORIES: Record<string, { label: string; keywords: string[] }[]> = {
    dogs: [
        { label: "Dry Dog Food", keywords: ["dry food", "kibble", "dry"] },
        { label: "Wet Dog Food", keywords: ["wet food", "canned", "wet"] },
        { label: "Dog Treats & Bones", keywords: ["treat", "snack", "biscuit", "chew", "bone"] },
        { label: "Dog Toys", keywords: ["toy", "ball", "rope", "plush"] },
        { label: "Dog Bowls & Feeders", keywords: ["bowl", "feeder", "water"] },
        { label: "Dog Grooming & Care", keywords: ["shampoo", "brush", "grooming", "care"] },
        { label: "Dog Collars & Leashes", keywords: ["collar", "leash", "harness"] },
        { label: "Dog Beds & Baskets", keywords: ["bed", "basket", "mat", "blanket"] },
    ],
    cats: [
        { label: "Dry Cat Food", keywords: ["dry food", "kibble", "dry"] },
        { label: "Wet Cat Food", keywords: ["wet food", "canned", "wet"] },
        { label: "Cat Treats", keywords: ["treat", "snack"] },
        { label: "Cat Toys", keywords: ["toy", "mouse", "feather", "ball"] },
        { label: "Cat Litter & Boxes", keywords: ["litter", "litter box", "sand"] },
        { label: "Cat Bowls & Feeders", keywords: ["bowl", "feeder", "water"] },
        { label: "Cat Grooming & Care", keywords: ["shampoo", "brush", "grooming"] },
        { label: "Cat Beds & Furniture", keywords: ["bed", "tree", "scratcher", "furniture"] },
    ],
    birds: [
        { label: "Bird Food & Seeds", keywords: ["food", "seed", "pellet"] },
        { label: "Bird Cages", keywords: ["cage", "aviary"] },
        { label: "Bird Toys & Perches", keywords: ["toy", "perch", "swing"] },
        { label: "Bird Accessories", keywords: ["bowl", "feeder", "bath"] },
    ],
    fish: [
        { label: "Fish Food", keywords: ["food", "flake", "pellet"] },
        { label: "Aquariums & Tanks", keywords: ["aquarium", "tank", "bowl"] },
        { label: "Filters & Pumps", keywords: ["filter", "pump", "air"] },
        { label: "Decorations & Plants", keywords: ["decoration", "plant", "gravel"] },
    ],
    "small-pets": [
        { label: "Small Pet Food", keywords: ["food", "hay", "pellet"] },
        { label: "Cages & Habitats", keywords: ["cage", "habitat", "hutch"] },
        { label: "Bedding & Litter", keywords: ["bedding", "litter", "substrate"] },
        { label: "Small Pet Toys", keywords: ["toy", "wheel", "tunnel"] },
    ],
};

export const CategoryMegaMenu = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, slug, image_url')
                .eq('is_active', true)
                .order('display_order');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSubcategoriesForCategory = (slug: string) => {
        return SUBCATEGORIES[slug] || [];
    };

    if (loading || categories.length === 0) {
        return null;
    }

    // Category icons mapping
    const CATEGORY_ICONS: Record<string, React.ReactNode> = {
        dogs: <Dog className="h-4 w-4" />,
        cats: <Cat className="h-4 w-4" />,
        birds: <Bird className="h-4 w-4" />,
        fish: <Fish className="h-4 w-4" />,
        "small-pets": <Rabbit className="h-4 w-4" />,
    };

    return (
        <nav className="hidden lg:flex items-center">
            {/* Home Link */}
            <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
                <Home className="h-4 w-4 text-primary" />
                Home
            </Link>

            {categories.map((category) => {
                const subcategories = getSubcategoriesForCategory(category.slug);
                const hasSubcategories = subcategories.length > 0;
                const icon = CATEGORY_ICONS[category.slug] || <Sparkles className="h-4 w-4" />;

                return (
                    <div
                        key={category.id}
                        className="relative group"
                        onMouseEnter={() => setActiveCategory(category.id)}
                        onMouseLeave={() => setActiveCategory(null)}
                    >
                        {/* Category Trigger */}
                        <Link
                            to={`/shop?category=${category.slug}`}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                            <span className="text-primary">{icon}</span>
                            {category.name}
                            {hasSubcategories && (
                                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeCategory === category.id ? 'rotate-180' : ''}`} />
                            )}
                        </Link>

                        {/* Mega Menu Dropdown - Only show if has subcategories */}
                        {hasSubcategories && (
                            <div
                                className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50 transition-all duration-200 ${activeCategory === category.id
                                    ? 'opacity-100 visible translate-y-0'
                                    : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                                    }`}
                            >
                                <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-6 min-w-[480px]">
                                    {/* Subcategories Grid - 2 columns like reference image */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                        {subcategories.map((sub, index) => (
                                            <Link
                                                key={index}
                                                to={`/shop?category=${category.slug}&subcategory=${encodeURIComponent(sub.label)}`}
                                                className="text-sm text-gray-700 hover:text-primary transition-colors py-1"
                                                onClick={() => setActiveCategory(null)}
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>

                                    {/* View All Link */}
                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                        <Link
                                            to={`/shop?category=${category.slug}`}
                                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                            onClick={() => setActiveCategory(null)}
                                        >
                                            View All {category.name} →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Offer Zone Link */}
            <Link
                to="/shop?offers=true"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
                <Tag className="h-4 w-4 text-primary" />
                Offer Zone
            </Link>
        </nav>
    );
};

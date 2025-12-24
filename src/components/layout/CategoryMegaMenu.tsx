import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Home, Dog, Cat, Bird, Fish, Rabbit, Tag, Sparkles, Turtle } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
}

interface Subcategory {
    name: string;
    category_id: string;
}

export const CategoryMegaMenu = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>({});
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategoriesAndSubcategories();
    }, []);

    const fetchCategoriesAndSubcategories = async () => {
        try {
            // Fetch categories
            const { data: categoriesData, error: catError } = await supabase
                .from('categories')
                .select('id, name, slug, image_url')
                .eq('is_active', true)
                .order('display_order');

            if (catError) throw catError;
            setCategories(categoriesData || []);

            // Fetch unique subcategories from products (same source as Category Management)
            const { data: productsWithSubs, error: subsError } = await supabase
                .from("products")
                .select("category_id, subcategory")
                .not("subcategory", "is", null)
                .eq("is_active", true);

            if (subsError) throw subsError;

            // Build subcategories map by category_id
            const subsMap: Record<string, Set<string>> = {};
            productsWithSubs?.forEach((p) => {
                if (p.category_id && p.subcategory) {
                    if (!subsMap[p.category_id]) {
                        subsMap[p.category_id] = new Set();
                    }
                    subsMap[p.category_id].add(p.subcategory);
                }
            });

            // Convert Sets to arrays
            const subsMapArray: Record<string, string[]> = {};
            Object.entries(subsMap).forEach(([catId, subsSet]) => {
                subsMapArray[catId] = Array.from(subsSet).sort();
            });
            setSubcategoriesMap(subsMapArray);

        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSubcategoriesForCategory = (categoryId: string) => {
        return subcategoriesMap[categoryId] || [];
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
        rabbits: <Rabbit className="h-4 w-4" />,
        turtles: <Turtle className="h-4 w-4" />,
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
                const subcategories = getSubcategoriesForCategory(category.id);
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
                                <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-6 min-w-[400px]">
                                    {/* Subcategories Grid - 2 columns */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                        {subcategories.map((subName, index) => (
                                            <Link
                                                key={index}
                                                to={`/shop?category=${category.slug}&subcategory=${encodeURIComponent(subName)}`}
                                                className="text-sm text-gray-700 hover:text-primary transition-colors py-1"
                                                onClick={() => setActiveCategory(null)}
                                            >
                                                {subName}
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

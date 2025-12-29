import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Home, Dog, Cat, Bird, Fish, Rabbit, Tag, Sparkles, Turtle, PawPrint } from "lucide-react";

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

        // Listen for category updates from Category Management
        const handleCategoriesUpdate = () => {
            fetchCategoriesAndSubcategories();
        };
        window.addEventListener('categories:updated', handleCategoriesUpdate);
        return () => window.removeEventListener('categories:updated', handleCategoriesUpdate);
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

            // Fetch subcategories from subcategories table
            const { data: dbSubcategories, error: dbSubsError } = await supabase
                .from("subcategories")
                .select("name, category_id");

            // Don't throw error if table doesn't exist yet  
            if (dbSubsError && !dbSubsError.message.includes('does not exist')) {
                console.warn('Error fetching subcategories table:', dbSubsError);
            }

            // Fetch unique subcategories from products (for backward compatibility)
            const { data: productsWithSubs, error: subsError } = await supabase
                .from("products")
                .select("category_id, subcategory")
                .not("subcategory", "is", null)
                .eq("is_active", true);

            if (subsError) throw subsError;

            // Build subcategories map by category_id - start with database subcategories
            const subsMap: Record<string, Set<string>> = {};

            // Add from subcategories table
            dbSubcategories?.forEach((sub) => {
                if (sub.category_id && sub.name) {
                    if (!subsMap[sub.category_id]) {
                        subsMap[sub.category_id] = new Set();
                    }
                    subsMap[sub.category_id].add(sub.name);
                }
            });

            // Add from products (merge with table subcategories)
            productsWithSubs?.forEach((p) => {
                if (p.category_id && p.subcategory) {
                    if (!subsMap[p.category_id]) {
                        subsMap[p.category_id] = new Set();
                    }
                    subsMap[p.category_id].add(p.subcategory);
                }
            });

            // Convert Sets to sorted arrays
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

    // Show placeholder while loading to prevent layout shift
    if (loading) {
        return (
            <nav className="hidden lg:flex items-center animate-pulse">
                <div className="h-8 w-16 bg-muted rounded mx-2" />
                <div className="h-8 w-20 bg-muted rounded mx-2" />
                <div className="h-8 w-16 bg-muted rounded mx-2" />
                <div className="h-8 w-20 bg-muted rounded mx-2" />
            </nav>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    // Category icons mapping
    const CATEGORY_ICONS: Record<string, React.ReactNode> = {
        dogs: <Dog className="h-4 w-4" />,
        cats: <Cat className="h-4 w-4" />,
        "dogs-and-cat": (
            <div className="flex items-center gap-0.5">
                <Dog className="h-3.5 w-3.5" />
                <Cat className="h-3.5 w-3.5" />
            </div>
        ),
        "dogs-cats": (
            <div className="flex items-center gap-0.5">
                <Dog className="h-3.5 w-3.5" />
                <Cat className="h-3.5 w-3.5" />
            </div>
        ),
        birds: <Bird className="h-4 w-4" />,
        fish: <Fish className="h-4 w-4" />,
        "small-pets": <Rabbit className="h-4 w-4" />,
        rabbits: <Rabbit className="h-4 w-4" />,
        turtles: <Turtle className="h-4 w-4" />,
    };

    return (
        <nav className="hidden lg:flex items-center gap-2">


            {categories.map((category) => {
                const subcategories = getSubcategoriesForCategory(category.id);
                const hasSubcategories = subcategories.length > 0;
                const icon = CATEGORY_ICONS[category.slug] || <Sparkles className="h-4 w-4" />;
                const isActive = activeCategory === category.id;

                return (
                    <div
                        key={category.id}
                        className="relative group h-full"
                        onMouseEnter={() => setActiveCategory(category.id)}
                        onMouseLeave={() => setActiveCategory(null)}
                    >
                        {/* Category Trigger */}
                        <Link
                            to={`/shop?category=${category.slug}`}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full group/link ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
                                }`}
                        >
                            <span className="text-primary transition-transform duration-300 group-hover/link:scale-110 group-hover/link:-rotate-12">
                                {icon}
                            </span>
                            {category.name}
                            {hasSubcategories && (
                                <ChevronDown
                                    className={`h-3 w-3 transition-transform duration-300 ${isActive ? 'rotate-180 text-primary' : 'text-gray-400 group-hover/link:text-primary'}`}
                                />
                            )}
                        </Link>

                        {/* Mega Menu Dropdown */}
                        {hasSubcategories && (
                            <div
                                className={`absolute left-0 top-full pt-1 z-50 transition-all duration-200 w-[240px] ${isActive
                                    ? 'opacity-100 visible translate-y-0'
                                    : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                                    }`}
                            >
                                <div className="bg-white rounded-xl shadow-xl border border-border/50 overflow-hidden">
                                    <div className="p-1 bg-muted/30 border-b border-border/50">
                                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {category.name} Categories
                                        </div>
                                    </div>

                                    <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {subcategories.map((subName, index) => (
                                            <Link
                                                key={index}
                                                to={`/shop?category=${category.slug}&subcategory=${encodeURIComponent(subName)}`}
                                                className="block px-3 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-md transition-colors"
                                                onClick={() => setActiveCategory(null)}
                                            >
                                                {subName}
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="p-2 border-t border-border/50 bg-gray-50/50">
                                        <Link
                                            to={`/shop?category=${category.slug}`}
                                            className="flex items-center justify-center p-2 text-xs font-bold text-primary uppercase tracking-wide hover:bg-primary/10 rounded-md transition-colors"
                                            onClick={() => setActiveCategory(null)}
                                        >
                                            View All {category.name}
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
                to="/shop?offer=true"
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 bg-red-50/50 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-full hover:shadow-sm"
            >
                <Tag className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Offer Zone
            </Link>
        </nav>
    );
};

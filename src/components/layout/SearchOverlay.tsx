import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string;
    stock_quantity: number;
    category?: { name: string } | null;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Fetch products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data } = await supabase
                .from("products")
                .select("id, name, slug, price, image_url, stock_quantity, sku, description, category:categories(name), brand:brands(name)")
                .eq("is_active", true)
                .limit(200);

            if (data) {
                setProducts(data as Product[]);
            }
            setLoading(false);
        };

        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    // Focus input when overlay opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Handle search with word-based matching
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            const queryWords = query.split(/\s+/).filter(word => word.length > 2);

            const results = products.filter(p => {
                const name = p.name?.toLowerCase() || '';
                const category = (p.category as any)?.name?.toLowerCase() || '';
                const brand = (p as any).brand?.name?.toLowerCase() || '';
                const description = (p as any).description?.toLowerCase() || '';
                const sku = (p as any).sku?.toString().toLowerCase() || '';

                const searchText = `${name} ${category} ${brand} ${description} ${sku}`;

                // Exact phrase match
                if (searchText.includes(query)) return true;

                // Match if contains at least 2 words from query (or all words if fewer than 2)
                const matchedWords = queryWords.filter(word => searchText.includes(word));
                return matchedWords.length >= Math.min(2, queryWords.length);
            });

            // Sort by relevance (more matching words = higher priority)
            results.sort((a, b) => {
                const aText = `${a.name} ${(a.category as any)?.name} ${(a as any).brand?.name}`.toLowerCase();
                const bText = `${b.name} ${(b.category as any)?.name} ${(b as any).brand?.name}`.toLowerCase();
                const aMatches = queryWords.filter(word => aText.includes(word)).length;
                const bMatches = queryWords.filter(word => bText.includes(word)).length;
                return bMatches - aMatches;
            });

            setSearchResults(results.slice(0, 6));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, products]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const handleProductClick = (slug: string) => {
        navigate(`/product/${slug}`);
        onClose();
        setSearchQuery("");
    };

    const handleViewAll = () => {
        navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
        onClose();
        setSearchQuery("");
    };

    const handleClear = () => {
        setSearchQuery("");
        inputRef.current?.focus();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm overflow-y-auto">
            <div className="container max-w-4xl mx-auto px-4 pt-8 md:pt-16 pb-8">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close search"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 font-display">
                    What Are You Looking For?
                </h1>

                {/* Search Input */}
                <div className="relative mb-8">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Start typing to search..."
                        className="w-full text-lg md:text-xl py-4 px-4 border-b-2 border-gray-300 focus:border-primary outline-none bg-transparent placeholder:text-gray-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={handleClear}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-4 w-4" />
                            CLEAR
                        </button>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                )}

                {/* Search Results */}
                {!loading && searchQuery && searchResults.length > 0 && (
                    <div className="space-y-4">
                        {searchResults.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => handleProductClick(product.slug)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-primary font-bold text-lg">
                                        BD {product.price.toFixed(3)}
                                    </p>
                                    <p className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {product.stock_quantity > 0 ? 'In stock' : 'Out of stock'}
                                    </p>
                                </div>
                            </button>
                        ))}

                        {/* View All Results Button */}
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleViewAll}
                                className="rounded-full px-8"
                            >
                                VIEW ALL RESULTS
                            </Button>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && searchQuery && searchResults.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No products found for "{searchQuery}"</p>
                        <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
                    </div>
                )}

                {/* Empty State - Popular Categories */}
                {!loading && !searchQuery && (
                    <div className="text-center py-8">
                        <p className="text-gray-400">Start typing to search for products</p>
                    </div>
                )}
            </div>
        </div>
    );
};

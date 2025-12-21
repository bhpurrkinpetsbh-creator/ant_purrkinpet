import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState, useRef } from "react";
import { toast } from "sonner";

export interface Product {
    id: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    offer_price?: number | null;
    is_on_offer?: boolean | null;
    image_url: string;
    slug: string;
    category_id?: string | null;
}

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [parallaxStyle, setParallaxStyle] = useState({ transform: 'translate(0, 0) scale(1)' });
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Only show discount if product is marked as "On Offer" and has an offer_price
    const isDiscounted = product.is_on_offer === true && product.offer_price && product.offer_price < product.price;
    const discountPercentage = isDiscounted
        ? Math.round(((product.price - product.offer_price!) / product.price) * 100)
        : 0;
    const displayPrice = isDiscounted ? product.offer_price! : product.price;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAdding) return;
        setIsAdding(true);

        const success = await addToCart(product.id, 1);

        if (success) {
            toast.success("Added to cart", {
                description: product.name,
                duration: 2000,
            });
            setTimeout(() => setIsAdding(false), 1000);
        } else {
            setIsAdding(false);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setParallaxStyle({
            transform: `translate(${x * 10}px, ${y * 10}px) scale(1.05)`
        });
    };

    const handleMouseLeave = () => {
        setParallaxStyle({ transform: 'translate(0, 0) scale(1)' });
    };

    return (
        <Card className="group relative overflow-hidden h-full border-none shadow-md hover:shadow-xl transition-all duration-300">
            {/* Image Container */}
            <div
                ref={imageContainerRef}
                className="relative aspect-square overflow-hidden bg-gray-50"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {isDiscounted && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce-subtle">
                        -{discountPercentage}%
                    </div>
                )}

                <Link to={`/product/${product.id}`} className="block h-full w-full">
                    <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 transition-transform duration-300 ease-out"
                        style={parallaxStyle}
                    />
                </Link>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 pointer-events-none">
                    {/* Re-enable pointer events for buttons */}
                    <div className="flex gap-2 pointer-events-auto">
                        <Button size="icon" variant="secondary" className="btn-ripple rounded-full hover:bg-white hover:scale-110 transition-all" asChild>
                            <Link to={`/product/${product.id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            size="icon"
                            className={`btn-ripple rounded-full transition-all ${isAdding ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90 hover:scale-110'}`}
                            onClick={handleAddToCart}
                            disabled={isAdding}
                        >
                            {isAdding ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                    <Link to={`/product/${product.id}`}>
                        {product.name}
                    </Link>
                </h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-xl text-primary">BD {displayPrice.toFixed(3)}</span>
                    {isDiscounted && (
                        <span className="text-sm text-muted-foreground line-through">
                            BD {product.price.toFixed(3)}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ProductCard;

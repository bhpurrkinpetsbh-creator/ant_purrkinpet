import { AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Product {
    image_url: string;
    subcategory?: string | null;
    categories?: { name: string } | null;
}

interface ProductWarningIndicatorProps {
    product: Product;
}

export const ProductWarningIndicator = ({ product }: ProductWarningIndicatorProps) => {
    const warnings: string[] = [];

    if (!product.image_url || product.image_url === '') {
        warnings.push('No image');
    }
    if (!product.categories) {
        warnings.push('No category');
    }
    if (!product.subcategory || product.subcategory === '') {
        warnings.push('No subcategory');
    }

    if (warnings.length === 0) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertTriangle className="h-4 w-4 text-orange-500 cursor-help flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="bg-orange-50 border-orange-200">
                    <div className="text-sm">
                        <p className="font-semibold text-orange-900 mb-1">Missing Data:</p>
                        <ul className="list-disc list-inside text-orange-700 space-y-0.5">
                            {warnings.map((warning, idx) => (
                                <li key={idx}>{warning}</li>
                            ))}
                        </ul>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

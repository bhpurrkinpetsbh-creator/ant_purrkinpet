import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    Search,
    ChevronDown,
    ChevronUp,
    Plus,
    Edit,
    Trash2,
    RotateCcw,
    Star,
    StarOff,
    Power,
    PowerOff,
    DollarSign,
    Tag,
    Bookmark,
    RefreshCw
} from "lucide-react";

interface HistoryEntry {
    id: string;
    product_id: string;
    product_name: string;
    product_sku: string | null;
    action_type: string;
    changed_fields: any; // JSON type from Supabase
    performed_by: string | null;
    performed_at: string | null;
    notes: string | null;
}

const ACTION_CONFIG: Record<string, {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
}> = {
    created: {
        label: 'Created',
        color: 'text-green-700',
        bgColor: 'bg-green-100 border-green-200',
        icon: Plus
    },
    updated: {
        label: 'Updated',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100 border-yellow-200',
        icon: Edit
    },
    deleted: {
        label: 'Deleted',
        color: 'text-red-700',
        bgColor: 'bg-red-100 border-red-200',
        icon: Trash2
    },
    restored: {
        label: 'Restored',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100 border-blue-200',
        icon: RotateCcw
    },
    activated: {
        label: 'Activated',
        color: 'text-green-700',
        bgColor: 'bg-green-100 border-green-200',
        icon: Power
    },
    deactivated: {
        label: 'Deactivated',
        color: 'text-red-700',
        bgColor: 'bg-red-100 border-red-200',
        icon: PowerOff
    },
    featured: {
        label: 'Featured',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100 border-purple-200',
        icon: Star
    },
    unfeatured: {
        label: 'Unfeatured',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100 border-gray-200',
        icon: StarOff
    },
    price_changed: {
        label: 'Price Changed',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100 border-orange-200',
        icon: DollarSign
    },
    category_changed: {
        label: 'Category Changed',
        color: 'text-cyan-700',
        bgColor: 'bg-cyan-100 border-cyan-200',
        icon: Tag
    },
    brand_changed: {
        label: 'Brand Changed',
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-100 border-indigo-200',
        icon: Bookmark
    },
};

const FIELD_LABELS: Record<string, string> = {
    name: 'Name',
    description: 'Description',
    price: 'Website Price',
    compare_at_price: 'MRP / Original Price',
    offer_price: 'Offer Price',
    is_on_offer: 'On Offer Check',
    category_id: 'Category',
    brand_id: 'Brand',
    is_active: 'Active Status',
    is_featured: 'Featured Status',
    stock_quantity: 'Stock Quantity',
    sku: 'SKU',
    image_url: 'Image',
};

export const ProductHistory = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAction, setFilterAction] = useState<string>("all");
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [categories, setCategories] = useState<Record<string, string>>({});
    const [brands, setBrands] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchHistory();
        fetchCategoriesAndBrands();
    }, []);

    const fetchCategoriesAndBrands = async () => {
        try {
            const [categoriesRes, brandsRes] = await Promise.all([
                supabase.from('categories').select('id, name'),
                supabase.from('brands').select('id, name'),
            ]);

            if (categoriesRes.data) {
                const catMap: Record<string, string> = {};
                categoriesRes.data.forEach(c => catMap[c.id] = c.name);
                setCategories(catMap);
            }

            if (brandsRes.data) {
                const brandMap: Record<string, string> = {};
                brandsRes.data.forEach(b => brandMap[b.id] = b.name);
                setBrands(brandMap);
            }
        } catch (error) {
            console.error("Error fetching categories/brands:", error);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('product_history')
                .select('*')
                .order('performed_at', { ascending: false })
                .limit(200);

            if (error) throw error;
            setHistory(data || []);
        } catch (error: any) {
            console.error("Error fetching product history:", error);
            toast.error("Failed to load product history");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = (id: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatValue = (field: string, value: any): string => {
        if (value === null || value === undefined) return 'None';

        if (field === 'category_id') {
            return categories[value] || value;
        }
        if (field === 'brand_id') {
            return brands[value] || value;
        }
        if (field === 'is_active' || field === 'is_featured' || field === 'is_on_offer') {
            return value ? 'Yes' : 'No';
        }
        if (field === 'price' || field === 'compare_at_price' || field === 'offer_price') {
            return `${value} BHD`;
        }
        if (field === 'description' && typeof value === 'string' && value.length > 100) {
            return value.substring(0, 100) + '...';
        }
        if (field === 'image_url' && typeof value === 'string') {
            return 'Image updated';
        }
        return String(value);
    };

    const filteredHistory = history.filter(entry => {
        const matchesSearch = !searchQuery ||
            entry.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.product_sku?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterAction === 'all' || entry.action_type === filterAction;

        return matchesSearch && matchesFilter;
    });

    const getActionConfig = (actionType: string) => {
        return ACTION_CONFIG[actionType] || {
            label: actionType,
            color: 'text-gray-700',
            bgColor: 'bg-gray-100 border-gray-200',
            icon: Edit,
        };
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                        Loading product history...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Product History</CardTitle>
                        <CardDescription>
                            Track all changes made to products over time
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchHistory} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mt-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by product name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterAction} onValueChange={setFilterAction}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="created">Created</SelectItem>
                            <SelectItem value="updated">Updated</SelectItem>
                            <SelectItem value="deleted">Deleted</SelectItem>
                            <SelectItem value="restored">Restored</SelectItem>
                            <SelectItem value="activated">Activated</SelectItem>
                            <SelectItem value="deactivated">Deactivated</SelectItem>
                            <SelectItem value="featured">Featured</SelectItem>
                            <SelectItem value="unfeatured">Unfeatured</SelectItem>
                            <SelectItem value="price_changed">Price Changed</SelectItem>
                            <SelectItem value="category_changed">Category Changed</SelectItem>
                            <SelectItem value="brand_changed">Brand Changed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent>
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No product history found</p>
                        <p className="text-sm mt-1">Changes to products will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredHistory.map((entry) => {
                            const config = getActionConfig(entry.action_type);
                            const IconComponent = config.icon;
                            const isExpanded = expandedItems.has(entry.id);
                            const hasChangedFields = entry.changed_fields &&
                                Object.keys(entry.changed_fields).length > 0 &&
                                entry.action_type !== 'created' &&
                                entry.action_type !== 'deleted' &&
                                entry.action_type !== 'restored';

                            return (
                                <Collapsible key={entry.id} open={isExpanded}>
                                    <div className={`border rounded-lg p-4 transition-all ${config.bgColor}`}>
                                        <CollapsibleTrigger
                                            className="w-full"
                                            onClick={() => toggleExpanded(entry.id)}
                                            disabled={!hasChangedFields}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                                                        <IconComponent className={`h-5 w-5 ${config.color}`} />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">{entry.product_name}</span>
                                                            {entry.product_sku && (
                                                                <span className="text-xs text-muted-foreground bg-white/50 px-2 py-0.5 rounded">
                                                                    {entry.product_sku}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className={`${config.color} border-current`}>
                                                                {config.label}
                                                            </Badge>
                                                            {entry.notes && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    {entry.notes}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-right">
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(entry.performed_at)}
                                                    </span>
                                                    {hasChangedFields && (
                                                        isExpanded ? (
                                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            {hasChangedFields && entry.changed_fields && (
                                                <div className="mt-4 pt-4 border-t border-current/10">
                                                    <h4 className="text-sm font-medium mb-3">Changes Made:</h4>
                                                    <div className="space-y-2">
                                                        {Object.entries(entry.changed_fields).map(([field, values]) => {
                                                            const typedValues = values as { old?: any; new?: any };
                                                            return (
                                                                <div
                                                                    key={field}
                                                                    className="flex items-start gap-2 bg-white/50 rounded-lg p-3"
                                                                >
                                                                    <span className="text-sm font-medium min-w-24">
                                                                        {FIELD_LABELS[field] || field}:
                                                                    </span>
                                                                    <div className="flex items-center gap-2 text-sm flex-1">
                                                                        {typedValues.old !== undefined && (
                                                                            <>
                                                                                <span className="text-red-600 line-through">
                                                                                    {formatValue(field, typedValues.old)}
                                                                                </span>
                                                                                <span className="text-muted-foreground">→</span>
                                                                            </>
                                                                        )}
                                                                        <span className="text-green-600 font-medium">
                                                                            {formatValue(field, typedValues.new)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>
                            );
                        })}
                    </div>
                )}

                {filteredHistory.length > 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-6 pt-4 border-t">
                        Showing {filteredHistory.length} of {history.length} entries
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

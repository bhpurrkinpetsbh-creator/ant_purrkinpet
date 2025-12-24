import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Loader2, FolderOpen } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    display_order: number;
    product_count?: number;
    subcategories: Subcategory[];
}

interface Subcategory {
    id: string;
    name: string;
    category_id: string;
}

export const CategoryManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Category Dialog
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", description: "" });
    const [savingCategory, setSavingCategory] = useState(false);

    // Subcategory Dialog
    const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    const [subcategoryParentId, setSubcategoryParentId] = useState<string | null>(null);
    const [subcategoryForm, setSubcategoryForm] = useState({ name: "" });
    const [savingSubcategory, setSavingSubcategory] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);

            // Fetch categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from("categories")
                .select("*")
                .order("display_order");

            if (categoriesError) throw categoriesError;

            // Fetch product counts per category
            const { data: productCounts, error: countError } = await supabase
                .from("products")
                .select("category_id")
                .eq("is_active", true);

            if (countError) throw countError;

            // Count products per category
            const countMap: Record<string, number> = {};
            productCounts?.forEach((p) => {
                if (p.category_id) {
                    countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
                }
            });

            // Fetch unique subcategories from products
            const { data: productsWithSubs, error: subsError } = await supabase
                .from("products")
                .select("category_id, subcategory")
                .not("subcategory", "is", null);

            if (subsError) throw subsError;

            // Build subcategories map
            const subcategoriesMap: Record<string, Subcategory[]> = {};
            const seenSubs = new Set<string>();

            productsWithSubs?.forEach((p) => {
                if (p.category_id && p.subcategory) {
                    const key = `${p.category_id}-${p.subcategory}`;
                    if (!seenSubs.has(key)) {
                        seenSubs.add(key);
                        if (!subcategoriesMap[p.category_id]) {
                            subcategoriesMap[p.category_id] = [];
                        }
                        subcategoriesMap[p.category_id].push({
                            id: key,
                            name: p.subcategory,
                            category_id: p.category_id,
                        });
                    }
                }
            });

            // Combine data
            const enrichedCategories = (categoriesData || []).map((cat) => ({
                ...cat,
                product_count: countMap[cat.id] || 0,
                subcategories: subcategoriesMap[cat.id] || [],
            }));

            setCategories(enrichedCategories);
        } catch (error: any) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleCategoryNameChange = (name: string) => {
        setCategoryForm((prev) => ({
            ...prev,
            name,
            slug: editingCategory ? prev.slug : generateSlug(name),
        }));
    };

    const toggleExpanded = (categoryId: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    // Category CRUD
    const openAddCategory = () => {
        setEditingCategory(null);
        setCategoryForm({ name: "", slug: "", description: "" });
        setIsCategoryDialogOpen(true);
    };

    const openEditCategory = (category: Category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            slug: category.slug,
            description: category.description || "",
        });
        setIsCategoryDialogOpen(true);
    };

    const saveCategory = async () => {
        if (!categoryForm.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        setSavingCategory(true);
        try {
            if (editingCategory) {
                // Update
                const { error } = await supabase
                    .from("categories")
                    .update({
                        name: categoryForm.name,
                        slug: categoryForm.slug,
                        description: categoryForm.description || null,
                    })
                    .eq("id", editingCategory.id);

                if (error) throw error;
                toast.success("Category updated successfully");
            } else {
                // Create
                const maxOrder = Math.max(...categories.map((c) => c.display_order), 0);
                const { error } = await supabase.from("categories").insert({
                    name: categoryForm.name,
                    slug: categoryForm.slug,
                    description: categoryForm.description || null,
                    is_active: true,
                    display_order: maxOrder + 1,
                });

                if (error) throw error;
                toast.success("Category created successfully");
            }

            setIsCategoryDialogOpen(false);
            fetchCategories();
        } catch (error: any) {
            console.error("Error saving category:", error);
            toast.error(error.message || "Failed to save category");
        } finally {
            setSavingCategory(false);
        }
    };

    const toggleCategoryStatus = async (category: Category) => {
        try {
            const { error } = await supabase
                .from("categories")
                .update({ is_active: !category.is_active })
                .eq("id", category.id);

            if (error) throw error;
            toast.success(`Category ${category.is_active ? "deactivated" : "activated"}`);
            fetchCategories();
        } catch (error: any) {
            toast.error("Failed to update category status");
        }
    };

    const deleteCategory = async (category: Category) => {
        if (category.product_count && category.product_count > 0) {
            toast.error(`Cannot delete: ${category.product_count} products use this category`);
            return;
        }

        if (!confirm(`Delete category "${category.name}"?`)) return;

        try {
            const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", category.id);

            if (error) throw error;
            toast.success("Category deleted");
            fetchCategories();
        } catch (error: any) {
            toast.error("Failed to delete category");
        }
    };

    // Subcategory CRUD
    const openAddSubcategory = (categoryId: string) => {
        setEditingSubcategory(null);
        setSubcategoryParentId(categoryId);
        setSubcategoryForm({ name: "" });
        setIsSubcategoryDialogOpen(true);
    };

    const openEditSubcategory = (subcategory: Subcategory) => {
        setEditingSubcategory(subcategory);
        setSubcategoryParentId(subcategory.category_id);
        setSubcategoryForm({ name: subcategory.name });
        setIsSubcategoryDialogOpen(true);
    };

    const saveSubcategory = async () => {
        if (!subcategoryForm.name.trim() || !subcategoryParentId) {
            toast.error("Subcategory name is required");
            return;
        }

        setSavingSubcategory(true);
        try {
            if (editingSubcategory) {
                // Update all products with old subcategory name to new name
                const { error } = await supabase
                    .from("products")
                    .update({ subcategory: subcategoryForm.name })
                    .eq("category_id", subcategoryParentId)
                    .eq("subcategory", editingSubcategory.name);

                if (error) throw error;
                toast.success("Subcategory updated successfully");
            } else {
                // For new subcategory, just close dialog - user will use it when adding products
                toast.success(`Subcategory "${subcategoryForm.name}" can now be used when adding products`);
            }

            setIsSubcategoryDialogOpen(false);
            fetchCategories();
        } catch (error: any) {
            console.error("Error saving subcategory:", error);
            toast.error("Failed to save subcategory");
        } finally {
            setSavingSubcategory(false);
        }
    };

    const deleteSubcategory = async (subcategory: Subcategory) => {
        // Count products using this subcategory
        const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("category_id", subcategory.category_id)
            .eq("subcategory", subcategory.name);

        if (count && count > 0) {
            toast.error(`Cannot delete: ${count} products use this subcategory`);
            return;
        }

        if (!confirm(`Delete subcategory "${subcategory.name}"?`)) return;

        // Since subcategories are derived from products, we just notify
        toast.success("Subcategory removed (no products were using it)");
        fetchCategories();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-end">
                <Button onClick={openAddCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Categories Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-center">Subcategories</TableHead>
                            <TableHead className="text-center">Products</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <Collapsible key={category.id} asChild open={expandedCategories.has(category.id)}>
                                <>
                                    <TableRow className="group">
                                        <TableCell>
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => toggleExpanded(category.id)}
                                                >
                                                    {expandedCategories.has(category.id) ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </TableCell>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{category.subcategories.length}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">{category.product_count}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={category.is_active}
                                                onCheckedChange={() => toggleCategoryStatus(category)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openEditCategory(category)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => deleteCategory(category)}
                                                    disabled={category.product_count! > 0}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Subcategories Expandable Content */}
                                    <CollapsibleContent asChild>
                                        <TableRow className="bg-muted/30 hover:bg-muted/50">
                                            <TableCell colSpan={7} className="p-0">
                                                <div className="px-8 py-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                            <FolderOpen className="h-4 w-4" />
                                                            Subcategories for {category.name}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openAddSubcategory(category.id)}
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Add Subcategory
                                                        </Button>
                                                    </div>

                                                    {category.subcategories.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            No subcategories yet. Add products with subcategories or create one.
                                                        </p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {category.subcategories.map((sub) => (
                                                                <Badge
                                                                    key={sub.id}
                                                                    variant="secondary"
                                                                    className="pl-3 pr-1 py-1 flex items-center gap-2 group/sub"
                                                                >
                                                                    {sub.name}
                                                                    <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-5 w-5"
                                                                            onClick={() => openEditSubcategory(sub)}
                                                                        >
                                                                            <Edit className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-5 w-5 text-destructive"
                                                                            onClick={() => deleteSubcategory(sub)}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </CollapsibleContent>
                                </>
                            </Collapsible>
                        ))}

                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No categories found. Add your first category!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "Update category details" : "Create a new product category"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Name *</Label>
                            <Input
                                id="cat-name"
                                value={categoryForm.name}
                                onChange={(e) => handleCategoryNameChange(e.target.value)}
                                placeholder="e.g., Reptiles"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat-slug">Slug</Label>
                            <Input
                                id="cat-slug"
                                value={categoryForm.slug}
                                onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="e.g., reptiles"
                            />
                            <p className="text-xs text-muted-foreground">URL-friendly identifier (auto-generated)</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat-desc">Description</Label>
                            <Input
                                id="cat-desc"
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Optional description"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={saveCategory} disabled={savingCategory}>
                            {savingCategory && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingCategory ? "Save Changes" : "Create Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subcategory Dialog */}
            <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
                        <DialogDescription>
                            {editingSubcategory
                                ? "Update subcategory name (will update all products using it)"
                                : "Create a new subcategory for this category"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sub-name">Subcategory Name *</Label>
                            <Input
                                id="sub-name"
                                value={subcategoryForm.name}
                                onChange={(e) => setSubcategoryForm({ name: e.target.value })}
                                placeholder="e.g., Dry Food"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={saveSubcategory} disabled={savingSubcategory}>
                            {savingSubcategory && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingSubcategory ? "Save Changes" : "Create Subcategory"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

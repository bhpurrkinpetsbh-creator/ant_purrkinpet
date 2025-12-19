import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";

interface ProductFormProps {
  mode: 'add' | 'edit';
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductForm = ({ mode, product, isOpen, onClose, onSuccess }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compare_at_price: "",
    sku: "",
    stock_quantity: "",
    low_stock_threshold: "5",
    category_id: "",
    brand_id: "",
    weight_kg: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    meta_title: "",
    meta_description: "",
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    const initForm = async () => {
      if (isOpen) {
        // Wait for categories and brands to load first
        await fetchCategoriesAndBrands();

        if (mode === 'edit' && product) {
          setFormData({
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            price: product.price?.toString() || "",
            compare_at_price: product.compare_at_price?.toString() || "",
            sku: product.sku || "",
            stock_quantity: product.stock_quantity?.toString() || "",
            low_stock_threshold: product.low_stock_threshold?.toString() || "5",
            category_id: product.category_id || "",
            brand_id: product.brand_id || "",
            weight_kg: product.weight_kg?.toString() || "",
            length_cm: product.length_cm?.toString() || "",
            width_cm: product.width_cm?.toString() || "",
            height_cm: product.height_cm?.toString() || "",
            meta_title: product.meta_title || "",
            meta_description: product.meta_description || "",
            is_active: product.is_active ?? true,
            is_featured: product.is_featured ?? false,
          });
          setImagePreview(product.image_url || "");
        } else {
          // Reset form for add mode and auto-generate SKU
          fetchNextSku();
          setFormData({
            name: "",
            slug: "",
            description: "",
            price: "",
            compare_at_price: "",
            sku: "", // Will be set by fetchNextSku
            stock_quantity: "",
            low_stock_threshold: "5",
            category_id: "",
            brand_id: "",
            weight_kg: "",
            length_cm: "",
            width_cm: "",
            height_cm: "",
            meta_title: "",
            meta_description: "",
            is_active: true,
            is_featured: false,
          });
          setImagePreview("");
          setImageFile(null);
        }
      }
    };

    initForm();
  }, [isOpen, mode, product]);

  const fetchCategoriesAndBrands = async () => {
    setOptionsLoading(true);
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('name'),
        supabase.from('brands').select('*').eq('is_active', true).order('name'),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (brandsRes.error) throw brandsRes.error;

      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (error: any) {
      console.error("Error fetching categories/brands:", error);
      toast.error("Failed to load categories and brands");
    } finally {
      setOptionsLoading(false);
    }
  };

  const fetchNextSku = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_next_sku_safe');

      if (error) throw error;

      // Set the auto-generated SKU
      setFormData(prev => ({ ...prev, sku: data || "SKU1" }));
    } catch (error: any) {
      console.error("Error generating SKU:", error);
      // Fallback to SKU1 if there's an error
      setFormData(prev => ({ ...prev, sku: "SKU1" }));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) {
      if (mode === 'edit' && product?.image_url) {
        return product.image_url;
      }
      return null;
    }

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (mode === 'add' && !imageFile) {
      toast.error("Please upload a product image");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImage();
      if (!imageUrl && mode === 'add') {
        setLoading(false);
        return;
      }

      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        sku: formData.sku || null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : 5,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        length_cm: formData.length_cm ? parseFloat(formData.length_cm) : null,
        width_cm: formData.width_cm ? parseFloat(formData.width_cm) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        image_url: imageUrl!,
      };

      if (mode === 'add') {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success("Product created successfully!");
      } else {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success("Product updated successfully!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Fill in the details below to add a new product to your catalog'
              : 'Update the product details below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Product Image *</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <label htmlFor="image" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        Click to upload image
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="product-url-slug"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description"
                  rows={4}
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  {optionsLoading ? (
                    <div className="h-10 bg-muted rounded-md animate-pulse" />
                  ) : (
                    <Select
                      key={`cat-${categories.length}-${formData.category_id}`}
                      value={formData.category_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  {optionsLoading ? (
                    <div className="h-10 bg-muted rounded-md animate-pulse" />
                  ) : (
                    <Select
                      key={`brand-${brands.length}-${formData.brand_id}`}
                      value={formData.brand_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Active & Featured */}
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active (Visible in store)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured">Featured Product</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Regular Price (BHD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compare_at_price">Sale Price (BHD)</Label>
                  <Input
                    id="compare_at_price"
                    type="number"
                    step="0.001"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU
                  {mode === 'add' && (
                    <span className="text-xs text-muted-foreground ml-2">(Auto-generated, editable)</span>
                  )}
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Product SKU"
                />
                {mode === 'add' && (
                  <p className="text-xs text-muted-foreground">
                    SKU auto-generated based on last product. You can edit it if needed.
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: e.target.value }))}
                    placeholder="5"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  step="0.01"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length_cm">Length (cm)</Label>
                  <Input
                    id="length_cm"
                    type="number"
                    step="0.1"
                    value={formData.length_cm}
                    onChange={(e) => setFormData(prev => ({ ...prev, length_cm: e.target.value }))}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width_cm">Width (cm)</Label>
                  <Input
                    id="width_cm"
                    type="number"
                    step="0.1"
                    value={formData.width_cm}
                    onChange={(e) => setFormData(prev => ({ ...prev, width_cm: e.target.value }))}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input
                    id="height_cm"
                    type="number"
                    step="0.1"
                    value={formData.height_cm}
                    onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value }))}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              {/* Meta Title */}
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO page title"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                mode === 'add' ? 'Create Product' : 'Update Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog >
  );
};

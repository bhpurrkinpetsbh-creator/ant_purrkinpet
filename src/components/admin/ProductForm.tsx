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
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState("");

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
    subcategory: "",
    brand_id: "",
    weight_kg: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    meta_title: "",
    meta_description: "",
    is_active: true,
    is_featured: false,
    is_on_offer: false,
    offer_price: "",
    expiration_date: "",
  });

  // Subcategory options based on category
  const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
    dogs: ["Dry Food", "Wet Food", "Treats & Bones", "Toys", "Bowls & Feeders", "Grooming & Care", "Collars & Leashes", "Beds & Baskets", "Accessories"],
    cats: ["Dry Food", "Wet Food", "Treats", "Toys", "Litter & Boxes", "Bowls & Feeders", "Grooming & Care", "Beds & Furniture", "Accessories"],
    birds: ["Food & Seeds", "Cages", "Toys & Perches", "Accessories"],
    fish: ["Food", "Aquariums & Tanks", "Filters & Pumps", "Decorations & Plants", "Accessories"],
    "small-pets": ["Food", "Cages & Habitats", "Bedding & Litter", "Toys", "Accessories"],
  };

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
            subcategory: product.subcategory || "",
            brand_id: product.brand_id || "",
            weight_kg: product.weight_kg?.toString() || "",
            length_cm: product.length_cm?.toString() || "",
            width_cm: product.width_cm?.toString() || "",
            height_cm: product.height_cm?.toString() || "",
            meta_title: product.meta_title || "",
            meta_description: product.meta_description || "",
            is_active: product.is_active ?? true,
            is_featured: product.is_featured ?? false,
            is_on_offer: product.is_on_offer ?? false,
            offer_price: product.offer_price?.toString() || "",
            expiration_date: product.expiration_date || "",
          });
          setImagePreview(product.image_url || "");

          // Check if the subcategory is one of the predefined ones
          const selectedCategory = categories.find(c => c.id === product.category_id);
          const categorySlug = selectedCategory?.slug || "";
          const predefinedOptions = SUBCATEGORY_OPTIONS[categorySlug] || [];
          if (product.subcategory && !predefinedOptions.includes(product.subcategory)) {
            setShowCustomSubcategory(true);
            setCustomSubcategory(product.subcategory);
          } else {
            setShowCustomSubcategory(false);
            setCustomSubcategory("");
          }
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
            subcategory: "",
            brand_id: "",
            weight_kg: "",
            length_cm: "",
            width_cm: "",
            height_cm: "",
            meta_title: "",
            meta_description: "",
            is_active: true,
            is_featured: false,
            is_on_offer: false,
            offer_price: "",
            expiration_date: "",
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
        subcategory: showCustomSubcategory ? customSubcategory : (formData.subcategory || null),
        brand_id: formData.brand_id || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        length_cm: formData.length_cm ? parseFloat(formData.length_cm) : null,
        width_cm: formData.width_cm ? parseFloat(formData.width_cm) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_on_offer: formData.is_on_offer,
        offer_price: formData.offer_price ? parseFloat(formData.offer_price) : null,
        expiration_date: formData.expiration_date || null,
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold border-b pb-2">Product Information</h3>

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    {optionsLoading ? (
                      <div className="h-10 bg-muted rounded-md animate-pulse" />
                    ) : (
                      <Select
                        key={`cat-${categories.length}-${formData.category_id}`}
                        value={formData.category_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value, subcategory: "" }))}
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
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <div className="space-y-2">
                      {!showCustomSubcategory ? (
                        <>
                          {(() => {
                            const selectedCategory = categories.find(c => c.id === formData.category_id);
                            const categorySlug = selectedCategory?.slug || "";
                            const subcategoryOptions = SUBCATEGORY_OPTIONS[categorySlug] || [];

                            return (
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  {subcategoryOptions.length > 0 ? (
                                    <Select
                                      key={`subcat-${formData.category_id}-${formData.subcategory}`}
                                      value={formData.subcategory}
                                      onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select subcategory" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {subcategoryOptions.map((sub) => (
                                          <SelectItem key={sub} value={sub}>
                                            {sub}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <div className="h-10 bg-muted/50 rounded-md flex items-center justify-center text-sm text-muted-foreground border">
                                      Select a category first or add custom
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowCustomSubcategory(true)}
                                >
                                  Custom
                                </Button>
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={customSubcategory}
                            onChange={(e) => setCustomSubcategory(e.target.value)}
                            placeholder="Enter custom subcategory"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowCustomSubcategory(false);
                              setCustomSubcategory("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
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

              {/* Pricing Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold border-b pb-2">Pricing Strategy</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="compare_at_price">
                      MRP / Cost Price (BHD)
                      <span className="text-xs text-muted-foreground ml-1">(Original price)</span>
                    </Label>
                    <Input
                      id="compare_at_price"
                      type="number"
                      step="0.001"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Website Price (BHD) <span className="text-red-500">*</span>
                    </Label>
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
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/20">
                  <input
                    type="checkbox"
                    id="is_on_offer"
                    checked={formData.is_on_offer}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_on_offer: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="is_on_offer" className="cursor-pointer flex-1">
                    <span className="font-medium">🏷️ Mark as On Offer</span>
                    <span className="text-xs text-muted-foreground block">Show in Offer Zone with discount badge</span>
                  </Label>
                </div>

                {formData.is_on_offer && (
                  <div className="space-y-2 p-3 border-2 border-primary/30 rounded-md bg-primary/5">
                    <Label htmlFor="offer_price">
                      Offer Price (BHD) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="offer_price"
                      type="number"
                      step="0.001"
                      value={formData.offer_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, offer_price: e.target.value }))}
                      placeholder="Enter offer price"
                      className="border-primary/50"
                    />
                    {formData.offer_price && formData.price && parseFloat(formData.offer_price) < parseFloat(formData.price) && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Discount: {Math.round((1 - parseFloat(formData.offer_price) / parseFloat(formData.price)) * 100)}% OFF
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Inventory Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold border-b pb-2">Inventory & Shipping</h3>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Product SKU"
                  />
                </div>

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
                    <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                    <Input
                      id="low_stock_threshold"
                      type="number"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: e.target.value }))}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.01"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length_cm">L (cm)</Label>
                    <Input
                      id="length_cm"
                      type="number"
                      step="0.1"
                      value={formData.length_cm}
                      onChange={(e) => setFormData(prev => ({ ...prev, length_cm: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width_cm">W (cm)</Label>
                    <Input
                      id="width_cm"
                      type="number"
                      step="0.1"
                      value={formData.width_cm}
                      onChange={(e) => setFormData(prev => ({ ...prev, width_cm: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height_cm">H (cm)</Label>
                    <Input
                      id="height_cm"
                      type="number"
                      step="0.1"
                      value={formData.height_cm}
                      onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* SEO Section (Commented Out) */}
              {/* 
              <div className="space-y-4 p-4 border rounded-lg bg-card opacity-60">
                <h3 className="text-lg font-semibold border-b pb-2">SEO Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO description"
                    rows={2}
                  />
                </div>
              </div>
              */}
            </div>

            {/* Right Column - Image & Status (Secondary Details) */}
            <div className="space-y-8">
              {/* Image Upload Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-card text-center">
                <h3 className="text-lg font-semibold border-b pb-2">Product Image</h3>
                <div className="flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full aspect-square object-contain rounded-lg border bg-muted/20"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 shadow-lg"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="image" className="w-full cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-10 hover:bg-accent/50 transition-all group">
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="font-medium text-sm">Upload Image</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                      </div>
                      <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold border-b pb-2">Visibility & Status</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active" className="cursor-pointer">Active in Store</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured" className="cursor-pointer">Featured Product</Label>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                    />
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="expiration_date">Expiration Date</Label>
                    <Input
                      id="expiration_date"
                      type="date"
                      value={formData.expiration_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
                      className="w-full"
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                      Used for automated expiration alerts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-background pb-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="px-8 bg-primary hover:bg-primary/90">
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

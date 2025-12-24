import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileDown, Check, AlertTriangle, Loader2, X, ImageIcon, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductRow {
    name: string;
    price: number;
    description?: string;
    sku?: string;
    stock_quantity?: number;
    category?: string;
    subcategory?: string;
    brand?: string;
    status: "valid" | "error";
    errorMessage?: string;
}

interface BulkProductUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkProductUpload = ({ isOpen, onClose, onSuccess }: BulkProductUploadProps) => {
    // Subcategory options map (Same as ProductForm)
    const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
        dogs: ["Dry Food", "Wet Food", "Treats & Bones", "Toys", "Bowls & Feeders", "Grooming & Care", "Collars & Leashes", "Beds & Baskets", "Accessories"],
        cats: ["Dry Food", "Wet Food", "Treats", "Toys", "Litter & Boxes", "Bowls & Feeders", "Grooming & Care", "Beds & Furniture", "Accessories"],
        birds: ["Food & Seeds", "Cages", "Toys & Perches", "Accessories"],
        fish: ["Food", "Aquariums & Tanks", "Filters & Pumps", "Decorations & Plants", "Accessories"],
        "small-pets": ["Food", "Cages & Habitats", "Bedding & Litter", "Toys", "Accessories"],
    };

    const [step, setStep] = useState<1 | 2>(1);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [errorCount, setErrorCount] = useState(0);
    const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
    const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
    const [imageFiles, setImageFiles] = useState<Map<number, File>>(new Map()); // serial -> File
    const [dynamicSubcategories, setDynamicSubcategories] = useState<Record<string, string[]>>({}); // category_slug -> subcategories[]

    useEffect(() => {
        const fetchData = async () => {
            const [catRes, brandRes, productsRes] = await Promise.all([
                supabase.from("categories").select("id, name, slug").order('name'),
                supabase.from("brands").select("id, name").order('name'),
                // Fetch unique subcategories from existing products
                supabase.from("products").select("category_id, subcategory").not("subcategory", "is", null)
            ]);

            if (catRes.data) setCategories(catRes.data);
            if (brandRes.data) setBrands(brandRes.data);

            // Build dynamic subcategories map from existing products
            if (productsRes.data && catRes.data) {
                const categoryIdToSlug = new Map(catRes.data.map(c => [c.id, c.slug]));
                const dynamicSubs: Record<string, Set<string>> = {};

                productsRes.data.forEach(product => {
                    if (product.category_id && product.subcategory) {
                        const slug = categoryIdToSlug.get(product.category_id);
                        if (slug) {
                            if (!dynamicSubs[slug]) {
                                dynamicSubs[slug] = new Set();
                            }
                            dynamicSubs[slug].add(product.subcategory);
                        }
                    }
                });

                // Convert Sets to arrays
                const dynamicSubsArray: Record<string, string[]> = {};
                Object.entries(dynamicSubs).forEach(([slug, subsSet]) => {
                    dynamicSubsArray[slug] = Array.from(subsSet);
                });
                setDynamicSubcategories(dynamicSubsArray);
            }
        };
        fetchData();
    }, []);

    // Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setFile(null);
            setPreviewData([]);
            setImageFiles(new Map());
            setErrorCount(0);
        }
    }, [isOpen]);

    const handleDownloadSample = () => {
        const wb = XLSX.utils.book_new();

        const headers = ["Product Name", "Price (BHD)", "Description", "Category Name", "Subcategory Name", "Brand Name"];
        const sampleData = [
            ["Premium Dog Food", 15.500, "High quality chicken and rice formula", "Dogs", "Dry Food", "Royal Canin"],
            ["Cat Toy Mouse", 2.500, "Interactive mouse toy for cats", "Cats", "Toys", "Generic"]
        ];
        const templateSheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

        templateSheet['!cols'] = [
            { wch: 30 }, { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 25 }, { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(wb, templateSheet, "Template");

        // Reference sheet
        const refData: any[][] = [["Available Categories", "Available Subcategories (by Category)", "Available Brands"]];
        const allSubcategories: string[] = [];
        categories.forEach(cat => {
            // Combine predefined subcategories with dynamic ones from the database
            const predefinedSubs = SUBCATEGORY_OPTIONS[cat.slug] || [];
            const dynamicSubs = dynamicSubcategories[cat.slug] || [];
            const allUniqueSubs = [...new Set([...predefinedSubs, ...dynamicSubs])];

            allUniqueSubs.forEach(sub => {
                allSubcategories.push(`${cat.name}: ${sub}`);
            });
        });

        const maxRows = Math.max(categories.length, allSubcategories.length, brands.length);
        for (let i = 0; i < maxRows; i++) {
            refData.push([
                categories[i]?.name || "",
                allSubcategories[i] || "",
                brands[i]?.name || ""
            ]);
        }

        const refSheet = XLSX.utils.aoa_to_sheet(refData);
        refSheet['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, refSheet, "Valid Values Reference");

        XLSX.writeFile(wb, "purrkin_pets_product_template.xlsx");
        toast.success("Template downloaded! Check 'Valid Values Reference' sheet for allowed values.");
    };

    const validateRow = (row: any, currentCategories: { id: string; name: string; slug: string }[], dynamicSubs: Record<string, string[]>): ProductRow => {
        const name = row["Product Name"];
        const price = parseFloat(row["Price (BHD)"]);
        const categoryName = row["Category Name"];
        const subcategoryName = row["Subcategory Name"];

        let status: "valid" | "error" = "valid";
        let errorMessage = "";

        const validCategoryNames = currentCategories.map(c => c.name).join(", ");

        if (!name) {
            status = "error";
            errorMessage = "Missing Product Name";
        } else if (isNaN(price) || price < 0) {
            status = "error";
            errorMessage = "Invalid Price (must be a positive number)";
        } else if (!categoryName) {
            status = "error";
            errorMessage = `Missing Category (use: ${validCategoryNames})`;
        } else if (!subcategoryName) {
            status = "error";
            errorMessage = "Missing Subcategory";
        }

        if (status === "valid") {
            const matchedCategory = currentCategories.find(c => c.name.toLowerCase() === categoryName.toString().toLowerCase());

            if (!matchedCategory) {
                status = "error";
                errorMessage = `Invalid Category "${categoryName}". Valid: ${validCategoryNames}. (See template Excel "Valid Values" sheet)`;
            } else {
                // Combine predefined subcategories with dynamically fetched ones from the database
                const predefinedSubs = SUBCATEGORY_OPTIONS[matchedCategory.slug] || [];
                const dynamicSubsForCategory = dynamicSubs[matchedCategory.slug] || [];

                // Merge and deduplicate (case-insensitive)
                const allSubcategoriesLower = new Set(predefinedSubs.map(s => s.toLowerCase()));
                dynamicSubsForCategory.forEach(s => allSubcategoriesLower.add(s.toLowerCase()));

                const isValidSub = allSubcategoriesLower.has(subcategoryName.toString().toLowerCase());

                if (!isValidSub && (predefinedSubs.length > 0 || dynamicSubsForCategory.length > 0)) {
                    status = "error";
                    // Show all valid subcategories with reference to template
                    const allUniqueSubsForDisplay = [...new Set([...predefinedSubs, ...dynamicSubsForCategory])];
                    const validSubs = allUniqueSubsForDisplay.join(", ");
                    errorMessage = `Invalid Subcategory for ${matchedCategory.name}. Valid: ${validSubs}. (See template Excel "Valid Values" sheet)`;
                }
            }
        }

        return {
            name: name || "",
            price: isNaN(price) ? 0 : price,
            description: row["Description"] || "",
            stock_quantity: 99,
            category: categoryName || "",
            subcategory: subcategoryName || "",
            brand: row["Brand Name"] || "",
            status,
            errorMessage
        };
    };

    const MAX_PRODUCTS = 15;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (categories.length === 0) {
            toast.error("Categories not loaded yet. Please try again.");
            return;
        }

        setFile(selectedFile);
        setAnalyzing(true);
        setPreviewData([]);
        setErrorCount(0);

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // Check limit
                if (jsonData.length > MAX_PRODUCTS) {
                    toast.error(`Maximum ${MAX_PRODUCTS} products allowed per upload. You have ${jsonData.length} rows.`);
                    setFile(null);
                    setAnalyzing(false);
                    return;
                }

                const parsedData = jsonData.map((row: any) => validateRow(row, categories, dynamicSubcategories));

                setPreviewData(parsedData);
                setErrorCount(parsedData.filter(p => p.status === "error").length);
                setAnalyzing(false);
            };
            reader.readAsBinaryString(selectedFile);
        } catch (error) {
            console.error("Error parsing Excel:", error);
            toast.error("Failed to parse the Excel file");
            setAnalyzing(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImageMap = new Map(imageFiles);

        Array.from(files).forEach(file => {
            // Extract number from filename (e.g., "1.jpg" -> 1, "02.png" -> 2)
            const match = file.name.match(/^(\d+)\.(jpg|jpeg|png)$/i);
            if (match) {
                const serial = parseInt(match[1], 10);
                if (serial >= 1 && serial <= previewData.length) {
                    newImageMap.set(serial, file);
                }
            }
        });

        setImageFiles(newImageMap);
        toast.success(`${newImageMap.size} image(s) matched to products`);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substr(2, 4);
    };

    const uploadImage = async (file: File, productName: string): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
            return publicUrl;
        } catch (error) {
            console.error(`Failed to upload image for ${productName}:`, error);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (previewData.length === 0) return;
        if (errorCount > 0) {
            toast.error("Please fix or remove rows with errors before importing.");
            return;
        }

        setLoading(true);

        try {
            const { data: brandsData } = await supabase.from("brands").select("id, name");
            const categoryMap = new Map(categories?.map(c => [c.name.toLowerCase(), c.id]));
            const brandMap = new Map(brandsData?.map(b => [b.name.toLowerCase(), b.id]));

            // Get the last SKU number to continue the sequence
            const { data: lastProduct } = await supabase
                .from("products")
                .select("sku")
                .not("sku", "is", null)
                .order("created_at", { ascending: false })
                .limit(100);

            // Find highest SKU number (supports both "SKU341" and "SKU-00341" formats)
            let lastSkuNumber = 0;
            if (lastProduct) {
                lastProduct.forEach(p => {
                    if (p.sku) {
                        // Match "SKU" followed by optional dash, then digits
                        const match = p.sku.match(/SKU-?(\d+)/i);
                        if (match) {
                            const num = parseInt(match[1], 10);
                            if (num > lastSkuNumber) lastSkuNumber = num;
                        }
                    }
                });
            }

            // Upload images first and build image URLs
            const imageUrls: (string | null)[] = [];
            for (let i = 0; i < previewData.length; i++) {
                const serial = i + 1;
                const imageFile = imageFiles.get(serial);
                if (imageFile) {
                    const url = await uploadImage(imageFile, previewData[i].name);
                    imageUrls.push(url);
                } else {
                    imageUrls.push(null);
                }
            }

            // Prepare products with image URLs and auto-generated SKUs
            const productsToInsert = previewData.map((p, index) => {
                const cat = categories.find(c => c.name.toLowerCase() === p.category?.toLowerCase());
                const correctSubcategory = SUBCATEGORY_OPTIONS[cat?.slug || ""]?.find(sub => sub.toLowerCase() === p.subcategory?.toLowerCase()) || p.subcategory;

                // Auto-generate SKU: SKU342, SKU343, etc. (matching existing format)
                const newSkuNumber = lastSkuNumber + index + 1;
                const sku = `SKU${newSkuNumber}`;

                return {
                    name: p.name,
                    slug: generateSlug(p.name),
                    description: p.description || null,
                    price: p.price,
                    stock_quantity: 99,
                    sku: sku,
                    category_id: p.category ? categoryMap.get(p.category.toLowerCase()) || null : null,
                    subcategory: correctSubcategory || null,
                    brand_id: p.brand ? brandMap.get(p.brand.toLowerCase()) || null : null,
                    is_active: true,
                    image_url: imageUrls[index] || ""
                };
            });

            const { error } = await supabase.from("products").insert(productsToInsert);
            if (error) throw error;

            const imagesUploaded = imageUrls.filter(Boolean).length;
            toast.success(`Imported ${productsToInsert.length} products with ${imagesUploaded} images!`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Import error:", error);
            toast.error("Failed to import products: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Product Upload</DialogTitle>
                    <DialogDescription>
                        Step {step} of 2: {step === 1 ? "Upload Excel Data" : "Upload Images (Optional)"}
                    </DialogDescription>
                </DialogHeader>

                {/* Instruction Guide Image */}
                <div className="border rounded-lg overflow-hidden mb-4 max-w-2xl mx-auto">
                    <img
                        src="/bulk-upload-guide.png"
                        alt="Bulk Upload Instructions"
                        className="w-full h-auto"
                    />
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 py-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-green-500 text-white'}`}>
                        {step > 1 ? <Check className="h-4 w-4" /> : "1"}
                    </div>
                    <div className="w-12 h-0.5 bg-muted" />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        2
                    </div>
                </div>

                {step === 1 ? (
                    <div className="space-y-6">
                        {/* Step 1: Download Template */}
                        <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Prepare your file
                            </h3>
                            <div className="text-sm text-muted-foreground ml-8 space-y-2">
                                <p>Download the template and fill in your product details.</p>
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-xs">
                                    <strong>⚠️ Limit:</strong> Maximum <strong>15 products</strong> per upload
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={handleDownloadSample} className="gap-2 mt-2">
                                    <FileDown className="h-4 w-4" />
                                    Download Sample Template (.xlsx)
                                </Button>
                            </div>
                        </div>

                        {/* Step 1: Upload Excel */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Upload & Verify
                            </h3>

                            {!file ? (
                                <label className="block w-full cursor-pointer ml-8">
                                    <div className="border-2 border-dashed rounded-lg p-8 hover:bg-accent/50 transition-all text-center">
                                        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                                        <p className="font-medium text-sm">Click to upload or drag and drop</p>
                                        <p className="text-xs text-muted-foreground mt-1">.xlsx or .xls files only (max 15 products)</p>
                                    </div>
                                    <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                                </label>
                            ) : (
                                <div className="ml-8 space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded">
                                                <FileDown className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewData([]); }}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {analyzing ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Analyzing file...
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className="gap-1">
                                                    <Check className="h-3 w-3" />
                                                    {previewData.length} Found
                                                </Badge>
                                                {errorCount > 0 && (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {errorCount} Errors
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="border rounded-md max-h-[250px] overflow-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-12">#</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead>Name</TableHead>
                                                            <TableHead>Price</TableHead>
                                                            <TableHead>Category</TableHead>
                                                            <TableHead>Subcategory</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {previewData.map((row, i) => (
                                                            <TableRow key={i} className={row.status === "error" ? "bg-red-50" : ""}>
                                                                <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                                                                <TableCell>
                                                                    {row.status === "error" ? (
                                                                        <div className="flex items-center gap-1 text-red-600 font-medium text-xs">
                                                                            <AlertTriangle className="h-3 w-3" />
                                                                            {row.errorMessage}
                                                                        </div>
                                                                    ) : (
                                                                        <Check className="h-4 w-4 text-green-600" />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="font-medium">{row.name}</TableCell>
                                                                <TableCell>{row.price.toFixed(3)}</TableCell>
                                                                <TableCell>{row.category || "-"}</TableCell>
                                                                <TableCell>{row.subcategory || "-"}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Step 2: Image Upload */
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold flex items-center gap-2 text-blue-800">
                                <ImageIcon className="h-5 w-5" />
                                Upload Product Images (Optional)
                            </h3>
                            <p className="text-sm text-blue-600 mt-2">
                                Name your images as <strong>1.jpg</strong>, <strong>2.png</strong>, etc. to match product row numbers.
                            </p>
                        </div>

                        <label className="block w-full cursor-pointer">
                            <div className="border-2 border-dashed rounded-lg p-8 hover:bg-accent/50 transition-all text-center">
                                <ImageIcon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                                <p className="font-medium text-sm">Click to select images</p>
                                <p className="text-xs text-muted-foreground mt-1">.jpg or .png only</p>
                            </div>
                            <input type="file" accept=".jpg,.jpeg,.png" className="hidden" multiple onChange={handleImageUpload} />
                        </label>

                        <div className="border rounded-md max-h-[300px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Image</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.map((row, i) => {
                                        const serial = i + 1;
                                        const imageFile = imageFiles.get(serial);
                                        return (
                                            <TableRow key={i}>
                                                <TableCell className="font-bold text-muted-foreground">{serial}</TableCell>
                                                <TableCell className="font-medium">{row.name}</TableCell>
                                                <TableCell>
                                                    {imageFile ? (
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <Check className="h-4 w-4" />
                                                            <span className="text-sm">{imageFile.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No image ({serial}.jpg or {serial}.png)</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-6 gap-2">
                    {step === 2 && (
                        <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>

                    {step === 1 ? (
                        <Button
                            onClick={() => setStep(2)}
                            disabled={!file || errorCount > 0 || previewData.length === 0}
                            className="gap-2"
                        >
                            Next: Upload Images
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="gap-2"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Confirm & Import ({previewData.length} products)
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

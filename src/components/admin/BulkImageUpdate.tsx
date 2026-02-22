import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload,
  Check,
  Search,
  ImageOff,
  Loader2,
  AlertCircle,
  FolderUp,
  X,
  RotateCcw,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  image_url: string;
  categories?: { name: string } | null;
}

interface FileMatch {
  file: File;
  fileName: string; // name without extension
  preview: string;
  matchedProduct: Product | null;
  confidence: number; // 0-100
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

// Normalize a string for comparison
const normalize = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\.[^.]+$/, "") // remove file extension
    .replace(/[-_]+/g, " ") // replace hyphens/underscores with space
    .replace(/[^a-z0-9\s]/g, "") // remove special chars
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
};

// Calculate match score between two strings
const matchScore = (fileName: string, productName: string): number => {
  const a = normalize(fileName);
  const b = normalize(productName);

  // Exact match
  if (a === b) return 100;

  // One contains the other entirely
  if (b.includes(a) || a.includes(b)) {
    const ratio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    return Math.round(75 + ratio * 20); // 75-95
  }

  // Word overlap
  const aWords = a.split(" ").filter((w) => w.length > 1);
  const bWords = b.split(" ").filter((w) => w.length > 1);
  if (aWords.length === 0 || bWords.length === 0) return 0;

  let matchedWords = 0;
  for (const aw of aWords) {
    for (const bw of bWords) {
      if (aw === bw || bw.includes(aw) || aw.includes(bw)) {
        matchedWords++;
        break;
      }
    }
  }

  const wordScore = matchedWords / Math.max(aWords.length, bWords.length);
  return Math.round(wordScore * 75); // 0-75
};

// Find best matching product for a filename
const findBestMatch = (
  fileName: string,
  products: Product[]
): { product: Product | null; confidence: number } => {
  let bestProduct: Product | null = null;
  let bestScore = 0;

  for (const product of products) {
    const score = matchScore(fileName, product.name);
    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
    // Also try matching against SKU
    if (product.sku) {
      const skuScore = matchScore(fileName, product.sku);
      if (skuScore > bestScore) {
        bestScore = skuScore;
        bestProduct = product;
      }
    }
  }

  return { product: bestProduct, confidence: bestScore };
};

export const BulkImageUpdate = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileMatches, setFileMatches] = useState<FileMatch[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [viewMode, setViewMode] = useState<"drop" | "review">("drop");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Single-product upload state (for individual fixes)
  const [singleUploadingId, setSingleUploadingId] = useState<string | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(new Set());
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set());
  const singleFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Hover preview state
  const [hoverPreview, setHoverPreview] = useState<{ src: string; x: number; y: number; label?: string } | null>(null);

  const handleImgMouseEnter = (e: React.MouseEvent<HTMLImageElement>, src: string, label?: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPreview({
      src,
      x: rect.right + 8,
      y: rect.top,
      label,
    });
  };

  const handleImgMouseLeave = () => {
    setHoverPreview(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [productsRes, productImagesRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, sku, image_url, categories(name)")
          .order("name"),
        supabase
          .from("product_images")
          .select("product_id, image_url, is_primary"),
      ]);

      if (productsRes.error) throw productsRes.error;
      setProducts(productsRes.data || []);

      // Build a map of product_id -> product_images URLs
      const productImagesMap: Record<string, string[]> = {};
      (productImagesRes.data || []).forEach((img: any) => {
        if (!productImagesMap[img.product_id]) {
          productImagesMap[img.product_id] = [];
        }
        productImagesMap[img.product_id].push(img.image_url);
      });

      // Check which images are broken (main image + product_images)
      const brokenSet = new Set<string>();

      const checkImage = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
          if (!url) { resolve(true); return; } // empty = broken
          const img = new Image();
          img.onload = () => resolve(false);
          img.onerror = () => resolve(true);
          img.src = url;
        });
      };

      // Check all products in parallel
      const checks = (productsRes.data || []).map(async (product) => {
        // Check main image
        const mainBroken = await checkImage(product.image_url);
        if (mainBroken) {
          brokenSet.add(product.id);
          return;
        }

        // Check product_images table entries
        const detailUrls = productImagesMap[product.id] || [];
        for (const url of detailUrls) {
          const isBroken = await checkImage(url);
          if (isBroken) {
            brokenSet.add(product.id);
            return;
          }
        }
      });

      await Promise.all(checks);
      setBrokenImageIds(brokenSet);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );

      if (imageFiles.length === 0) {
        toast.error("No image files found in the selection");
        return;
      }

      const matches: FileMatch[] = imageFiles.map((file) => {
        const fileName = file.name.replace(/\.[^.]+$/, ""); // remove extension
        const preview = URL.createObjectURL(file);
        const { product, confidence } = findBestMatch(fileName, products);

        return {
          file,
          fileName,
          preview,
          matchedProduct: confidence >= 40 ? product : null,
          confidence: confidence >= 40 ? confidence : 0,
          status: "pending" as const,
        };
      });

      // Sort: matched first (high confidence), then unmatched
      matches.sort((a, b) => {
        if (a.matchedProduct && !b.matchedProduct) return -1;
        if (!a.matchedProduct && b.matchedProduct) return 1;
        return b.confidence - a.confidence;
      });

      setFileMatches(matches);
      setViewMode("review");

      const matchedCount = matches.filter((m) => m.matchedProduct).length;
      toast.success(
        `${imageFiles.length} images loaded. ${matchedCount} auto-matched to products.`
      );
    },
    [products]
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  // Manual product selection for unmatched files
  const handleManualMatch = (fileIndex: number, productId: string) => {
    const product = products.find((p) => p.id === productId) || null;
    setFileMatches((prev) =>
      prev.map((m, i) =>
        i === fileIndex
          ? { ...m, matchedProduct: product, confidence: product ? 100 : 0 }
          : m
      )
    );
  };

  // Remove a file from the list
  const handleRemoveFile = (fileIndex: number) => {
    setFileMatches((prev) => {
      const removed = prev[fileIndex];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== fileIndex);
    });
  };

  // Upload all matched files (optionally only 100% matches)
  const handleUploadAll = async (onlyExact: boolean = false) => {
    const toUpload = fileMatches.filter(
      (m) => m.matchedProduct && m.status === "pending" && (!onlyExact || m.confidence === 100)
    );
    if (toUpload.length === 0) {
      toast.error(onlyExact ? "No 100% matched files to upload" : "No matched files to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < fileMatches.length; i++) {
      const match = fileMatches[i];
      if (!match.matchedProduct || match.status !== "pending") continue;
      if (onlyExact && match.confidence !== 100) continue;

      // Update status to uploading
      setFileMatches((prev) =>
        prev.map((m, idx) => (idx === i ? { ...m, status: "uploading" } : m))
      );

      try {
        const fileExt = match.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, match.file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: publicUrl })
          .eq("id", match.matchedProduct.id);

        if (updateError) throw updateError;

        // Also update primary image in product_images table if it exists
        await supabase
          .from("product_images")
          .update({ image_url: publicUrl })
          .eq("product_id", match.matchedProduct.id)
          .eq("is_primary", true);

        // Delete non-primary broken images from product_images
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", match.matchedProduct.id)
          .neq("is_primary", true);

        // Update local state
        setFileMatches((prev) =>
          prev.map((m, idx) => (idx === i ? { ...m, status: "success" } : m))
        );
        setUpdatedIds((prev) => new Set([...prev, match.matchedProduct!.id]));
        setBrokenImageIds((prev) => {
          const next = new Set(prev);
          next.delete(match.matchedProduct!.id);
          return next;
        });
        successCount++;
      } catch (error: any) {
        console.error("Error uploading:", match.fileName, error);
        setFileMatches((prev) =>
          prev.map((m, idx) =>
            idx === i
              ? { ...m, status: "error", errorMessage: error.message }
              : m
          )
        );
        errorCount++;
      }

      setUploadProgress(
        Math.round(((successCount + errorCount) / toUpload.length) * 100)
      );
    }

    setIsUploading(false);

    if (errorCount === 0) {
      toast.success(`All ${successCount} images uploaded successfully!`);
    } else {
      toast.warning(`${successCount} uploaded, ${errorCount} failed`);
    }
  };

  // Single product image upload (for individual fixes)
  const handleSingleUpload = async (productId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setSingleUploadingId(productId);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: publicUrl })
        .eq("id", productId);
      if (updateError) throw updateError;

      // Also update primary image in product_images table if it exists
      await supabase
        .from("product_images")
        .update({ image_url: publicUrl })
        .eq("product_id", productId)
        .eq("is_primary", true);

      // Delete non-primary broken images from product_images
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId)
        .neq("is_primary", true);

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, image_url: publicUrl } : p))
      );
      setUpdatedIds((prev) => new Set([...prev, productId]));
      setBrokenImageIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      toast.success("Image updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload");
    } finally {
      setSingleUploadingId(null);
    }
  };

  const reset = () => {
    fileMatches.forEach((m) => {
      if (m.preview) URL.revokeObjectURL(m.preview);
    });
    setFileMatches([]);
    setViewMode("drop");
    setUploadProgress(0);
    setIsUploading(false);
  };

  // Stats
  const matchedCount = fileMatches.filter((m) => m.matchedProduct).length;
  const exactMatchCount = fileMatches.filter((m) => m.matchedProduct && m.confidence === 100).length;
  const unmatchedCount = fileMatches.filter((m) => !m.matchedProduct).length;
  const successCount = fileMatches.filter((m) => m.status === "success").length;
  const errorCount = fileMatches.filter((m) => m.status === "error").length;
  const pendingCount = fileMatches.filter(
    (m) => m.matchedProduct && m.status === "pending"
  ).length;
  const exactPendingCount = fileMatches.filter(
    (m) => m.matchedProduct && m.confidence === 100 && m.status === "pending"
  ).length;

  // Filter review list
  const filteredMatches = fileMatches.filter((m) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      m.fileName.toLowerCase().includes(q) ||
      m.matchedProduct?.name.toLowerCase().includes(q) ||
      m.matchedProduct?.sku?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">
          Loading products...
        </span>
      </div>
    );
  }

  // ── DROP ZONE VIEW ──
  if (viewMode === "drop") {
    return (
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">
              Bulk Image Upload — {brokenImageIds.size} broken image{brokenImageIds.size !== 1 ? "s" : ""} detected
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Name your image files by <strong>product name</strong> (e.g., <code className="bg-blue-100 px-1 rounded">Royal Canin Adult Dog Food.jpg</code>).
              Drop all files below and they'll be auto-matched to your products.
            </p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          ref={dropRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFiles(e.target.files);
              }
              e.target.value = "";
            }}
          />
          <FolderUp
            className={`h-16 w-16 mx-auto mb-4 transition-colors ${
              isDragging ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <h3 className="text-xl font-semibold mb-2">
            {isDragging ? "Drop images here!" : "Drop your product images here"}
          </h3>
          <p className="text-muted-foreground mb-4">
            or click to select files — supports up to 500 images at once
          </p>
          <p className="text-sm text-muted-foreground">
            JPG, PNG, WebP — max 5MB each
          </p>
        </div>

        {/* Individual broken images section */}
        {brokenImageIds.size > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Or fix individually ({brokenImageIds.size} broken)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {products
                .filter((p) => brokenImageIds.has(p.id))
                .map((product) => {
                  const isUpdated = updatedIds.has(product.id);
                  const isUploading = singleUploadingId === product.id;
                  return (
                    <div
                      key={product.id}
                      className={`border rounded-lg overflow-hidden text-center ${
                        isUpdated ? "border-green-300 bg-green-50/50" : "border-orange-200"
                      }`}
                    >
                      <div className="aspect-square bg-muted/20 flex items-center justify-center">
                        {isUpdated ? (
                          <img
                            src={
                              products.find((p) => p.id === product.id)
                                ?.image_url || "/placeholder.svg"
                            }
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <ImageOff className="h-8 w-8 text-orange-400" />
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        <p className="text-xs font-medium line-clamp-2 leading-tight">
                          {product.name}
                        </p>
                        <input
                          ref={(el) => (singleFileRefs.current[product.id] = el)}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSingleUpload(product.id, file);
                            e.target.value = "";
                          }}
                        />
                        <Button
                          variant={isUpdated ? "outline" : "default"}
                          size="sm"
                          className="w-full text-xs h-7"
                          disabled={isUploading}
                          onClick={() =>
                            singleFileRefs.current[product.id]?.click()
                          }
                        >
                          {isUploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isUpdated ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Upload className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── REVIEW & UPLOAD VIEW ──
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            Review Matches ({fileMatches.length} files)
          </h3>
          <div className="flex gap-3 mt-1 text-sm">
            <span className="text-green-600 font-medium">
              {matchedCount} matched ({exactMatchCount} at 100%)
            </span>
            {unmatchedCount > 0 && (
              <span className="text-orange-500 font-medium">
                {unmatchedCount} unmatched
              </span>
            )}
            {successCount > 0 && (
              <span className="text-green-600">
                {successCount} uploaded
              </span>
            )}
            {errorCount > 0 && (
              <span className="text-red-500">{errorCount} failed</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Start Over
          </Button>
          {exactPendingCount > 0 && exactPendingCount !== pendingCount && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUploadAll(true)}
              disabled={isUploading}
              className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Upload 100% Only ({exactPendingCount})
                </>
              )}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => handleUploadAll(false)}
            disabled={isUploading || pendingCount === 0}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Upload All Matched ({pendingCount})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {uploadProgress}% complete
          </p>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by filename or product name..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Match Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 font-medium">Image File</th>
                <th className="text-left p-3 font-medium">Matched Product</th>
                <th className="text-center p-3 font-medium w-24">Match</th>
                <th className="text-center p-3 font-medium w-24">Status</th>
                <th className="text-center p-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMatches.map((match, i) => {
                const realIndex = fileMatches.indexOf(match);
                return (
                  <tr
                    key={i}
                    className={
                      match.status === "success"
                        ? "bg-green-50/50"
                        : match.status === "error"
                        ? "bg-red-50/50"
                        : !match.matchedProduct
                        ? "bg-orange-50/30"
                        : ""
                    }
                  >
                    {/* File Preview + Name */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={match.preview}
                          alt={match.fileName}
                          className="w-10 h-10 object-cover rounded border cursor-zoom-in shrink-0"
                          onMouseEnter={(e) => handleImgMouseEnter(e, match.preview, "New image")}
                          onMouseLeave={handleImgMouseLeave}
                        />
                        <span className="font-medium text-sm break-all">
                          {match.fileName}
                        </span>
                      </div>
                    </td>

                    {/* Matched Product */}
                    <td className="p-3">
                      {match.matchedProduct ? (
                        <div className="flex items-start gap-3">
                          {match.matchedProduct.image_url && (
                            <img
                              src={match.matchedProduct.image_url}
                              alt={match.matchedProduct.name}
                              className="w-10 h-10 object-cover rounded border cursor-zoom-in shrink-0"
                              onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                              onMouseEnter={(e) => handleImgMouseEnter(e, match.matchedProduct!.image_url, "Current image")}
                              onMouseLeave={handleImgMouseLeave}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm break-words">
                              {match.matchedProduct.name}
                            </p>
                            <div className="flex gap-1 mt-0.5">
                              {match.matchedProduct.sku && (
                                <span className="text-[10px] bg-muted px-1 rounded font-mono">
                                  {match.matchedProduct.sku}
                                </span>
                              )}
                              {match.matchedProduct.categories?.name && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded">
                                  {match.matchedProduct.categories.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            className="text-sm border rounded px-2 py-1.5 max-w-[250px] bg-background"
                            value=""
                            onChange={(e) => {
                              if (e.target.value)
                                handleManualMatch(realIndex, e.target.value);
                            }}
                          >
                            <option value="">-- Select product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.sku ? `(${p.sku})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>

                    {/* Confidence */}
                    <td className="p-3 text-center">
                      {match.matchedProduct ? (
                        <Badge
                          variant="secondary"
                          className={
                            match.confidence >= 80
                              ? "bg-green-100 text-green-700"
                              : match.confidence >= 60
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-orange-100 text-orange-700"
                          }
                        >
                          {match.confidence}%
                        </Badge>
                      ) : (
                        <HelpCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      {match.status === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : match.status === "error" ? (
                        <div className="flex flex-col items-center">
                          <XCircle className="h-5 w-5 text-red-500" />
                        </div>
                      ) : match.status === "uploading" ? (
                        <Loader2 className="h-5 w-5 text-primary mx-auto animate-spin" />
                      ) : match.matchedProduct ? (
                        <span className="text-xs text-muted-foreground">
                          Ready
                        </span>
                      ) : (
                        <span className="text-xs text-orange-500">
                          No match
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      {match.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleRemoveFile(realIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Upload Bar */}
      {pendingCount > 0 && !isUploading && (
        <div className="flex items-center justify-between gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="font-medium">
            Ready to upload <strong>{pendingCount}</strong> matched images
            {exactPendingCount > 0 && <span className="text-green-600"> ({exactPendingCount} at 100%)</span>}
          </p>
          <div className="flex gap-2">
            {exactPendingCount > 0 && exactPendingCount !== pendingCount && (
              <Button variant="outline" onClick={() => handleUploadAll(true)} className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                <CheckCircle2 className="h-4 w-4" />
                100% Only
              </Button>
            )}
            <Button onClick={() => handleUploadAll(false)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload All
            </Button>
          </div>
        </div>
      )}
      {/* Hover Image Preview (fixed position, not clipped by overflow) */}
      {hoverPreview && (
        <div
          className="fixed z-[9999] bg-white rounded-lg shadow-2xl border p-1.5 pointer-events-none"
          style={{
            left: Math.min(hoverPreview.x, window.innerWidth - 220),
            top: Math.min(hoverPreview.y, window.innerHeight - 240),
          }}
        >
          <img
            src={hoverPreview.src}
            alt="Preview"
            className="w-48 h-48 object-contain rounded"
          />
          {hoverPreview.label && (
            <p className="text-[10px] text-center text-gray-400 mt-1">{hoverPreview.label}</p>
          )}
        </div>
      )}
    </div>
  );
};

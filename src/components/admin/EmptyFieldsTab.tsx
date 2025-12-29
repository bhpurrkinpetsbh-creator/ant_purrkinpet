import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Edit, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface Product {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    image_url: string;
    is_active: boolean | null;
    subcategory?: string | null;
    categories?: { name: string } | null;
}

interface EmptyFieldsTabProps {
    products: Product[];
    onEditProduct: (product: Product) => void;
}

export const EmptyFieldsTab = ({ products, onEditProduct }: EmptyFieldsTabProps) => {
    const [isNoImageOpen, setIsNoImageOpen] = useState(true);
    const [isNoCategoryOpen, setIsNoCategoryOpen] = useState(true);
    const [isNoSubcategoryOpen, setIsNoSubcategoryOpen] = useState(true);

    const noImageProducts = products.filter(p => !p.image_url || p.image_url === '');
    const noCategoryProducts = products.filter(p => !p.categories);
    const noSubcategoryProducts = products.filter(p => !p.subcategory || p.subcategory === '');

    return (
        <div className="space-y-4">
            {/* No Image - Collapsible */}
            <Collapsible open={isNoImageOpen} onOpenChange={setIsNoImageOpen}>
                <Card>
                    <CardHeader>
                        <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-muted/50 transition-colors rounded-md -m-2 p-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                <CardTitle className="text-lg">Products Without Images</CardTitle>
                                <Badge variant="secondary">{noImageProducts.length}</Badge>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isNoImageOpen ? '' : '-rotate-90'}`} />
                        </CollapsibleTrigger>
                        <CardDescription className="mt-2">
                            Products missing product images
                        </CardDescription>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {noImageProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell><span className="text-xs bg-muted px-2 py-1 rounded font-mono">{product.sku || '-'}</span></TableCell>
                                                <TableCell>{product.categories?.name || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={product.is_active ? "default" : "secondary"} className={product.is_active ? "bg-green-600" : ""}>
                                                        {product.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => onEditProduct(product)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Fix
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {noImageProducts.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    ✅ All products have images
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* No Category - Collapsible */}
            <Collapsible open={isNoCategoryOpen} onOpenChange={setIsNoCategoryOpen}>
                <Card>
                    <CardHeader>
                        <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-muted/50 transition-colors rounded-md -m-2 p-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <CardTitle className="text-lg">Products Without Category</CardTitle>
                                <Badge variant="secondary">{noCategoryProducts.length}</Badge>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isNoCategoryOpen ? '' : '-rotate-90'}`} />
                        </CollapsibleTrigger>
                        <CardDescription className="mt-2">
                            Products missing category assignment
                        </CardDescription>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {noCategoryProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                                        <span className="font-medium">{product.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell><span className="text-xs bg-muted px-2 py-1 rounded font-mono">{product.sku || '-'}</span></TableCell>
                                                <TableCell className="font-medium">{product.price.toFixed(3)} BHD</TableCell>
                                                <TableCell>
                                                    <Badge variant={product.is_active ? "default" : "secondary"} className={product.is_active ? "bg-green-600" : ""}>
                                                        {product.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => onEditProduct(product)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Fix
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {noCategoryProducts.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    ✅ All products have categories assigned
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* No Subcategory - Collapsible */}
            <Collapsible open={isNoSubcategoryOpen} onOpenChange={setIsNoSubcategoryOpen}>
                <Card>
                    <CardHeader>
                        <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-muted/50 transition-colors rounded-md -m-2 p-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                <CardTitle className="text-lg">Products Without Subcategory</CardTitle>
                                <Badge variant="secondary">{noSubcategoryProducts.length}</Badge>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isNoSubcategoryOpen ? '' : '-rotate-90'}`} />
                        </CollapsibleTrigger>
                        <CardDescription className="mt-2">
                            Products missing subcategory
                        </CardDescription>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {noSubcategoryProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                                        <span className="font-medium">{product.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell><span className="text-xs bg-muted px-2 py-1 rounded font-mono">{product.sku || '-'}</span></TableCell>
                                                <TableCell><Badge variant="outline">{product.categories?.name || '-'}</Badge></TableCell>
                                                <TableCell>
                                                    <Badge variant={product.is_active ? "default" : "secondary"} className={product.is_active ? "bg-green-600" : ""}>
                                                        {product.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => onEditProduct(product)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Fix
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {noSubcategoryProducts.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    ✅ All products have subcategories assigned
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        </div>
    );
};

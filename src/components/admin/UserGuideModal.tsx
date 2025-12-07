import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, Users, BarChart3, Settings } from "lucide-react";

interface UserGuideModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserGuideModal({ open, onOpenChange }: UserGuideModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display">Admin Dashboard Guide</DialogTitle>
                    <DialogDescription>
                        Learn how to manage your store effectively with this comprehensive guide.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-5 mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                        <TabsTrigger value="support">Support</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-6 pb-8">
                            <TabsContent value="overview" className="m-0 space-y-4">
                                <div className="p-6 bg-muted/30 rounded-lg border">
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                        Dashboard Overview
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        The main dashboard provides a quick snapshot of your business performance. Here you can track key metrics in real-time.
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li><strong>Total Revenue:</strong> Sum of all paid orders.</li>
                                        <li><strong>Active Orders:</strong> Count of orders currently being processed (Pending/Processing).</li>
                                        <li><strong>Inventory Status:</strong> Alerts for low stock items.</li>
                                        <li><strong>Recent Activity:</strong> Latest actions taken on the platform.</li>
                                    </ul>
                                </div>
                            </TabsContent>

                            <TabsContent value="products" className="m-0 space-y-4">
                                <div className="p-6 bg-muted/30 rounded-lg border">
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        Product Management
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Manage your catalog efficiently. You can add, edit, or delete products.
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="bg-background p-4 rounded-md shadow-sm">
                                            <h4 className="font-semibold mb-2">Adding Products</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Click the "Add Product" button. Fill in details like Name, Price, SKU, and upload images.
                                                Ensure you select the correct Category for better organization.
                                            </p>
                                        </div>
                                        <div className="bg-background p-4 rounded-md shadow-sm">
                                            <h4 className="font-semibold mb-2">Editing & Deleting</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Use the "Edit" icon to update details.
                                                Deleted products are moved to the "Trash" (Deleted Products) and can be restored if needed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="orders" className="m-0 space-y-4">
                                <div className="p-6 bg-muted/30 rounded-lg border">
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5 text-primary" />
                                        Order Processing
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Track customer orders from placement to delivery.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-yellow-500 pl-4">
                                            <h4 className="font-semibold">Pending</h4>
                                            <p className="text-sm text-muted-foreground">New orders that need confirmation. Verify payment and stock availability.</p>
                                        </div>
                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <h4 className="font-semibold">Processing</h4>
                                            <p className="text-sm text-muted-foreground">Orders being packed and prepared for shipping.</p>
                                        </div>
                                        <div className="border-l-4 border-green-500 pl-4">
                                            <h4 className="font-semibold">Shipped / Delivered</h4>
                                            <p className="text-sm text-muted-foreground">Orders that represent successful sales.</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="inventory" className="m-0 space-y-4">
                                <div className="p-6 bg-muted/30 rounded-lg border">
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        Inventory Control
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Keep track of your stock levels to prevent overselling.
                                    </p>
                                    <p className="text-sm">
                                        The inventory page lists all products with their current stock count.
                                        Low stock items are highlighted. You can quickly update stock numbers directly from this view.
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="support" className="m-0 space-y-4">
                                <div className="p-6 bg-muted/30 rounded-lg border">
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        Getting Help
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        If you encounter technical issues, use the "Contact Support" button.
                                    </p>
                                    <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
                                        <h4 className="font-semibold text-primary mb-1">New Feature: Screen & Voice Recording</h4>
                                        <p className="text-sm text-muted-foreground">
                                            You can now record your screen and voice directly within the support form to explain complex issues visually.
                                            This helps our team understand and resolve your problem faster.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

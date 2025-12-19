import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeliveryZone {
    id: string;
    area: string;
    delivery_time: string;
    fee: string;
    display_order: number;
    is_active: boolean;
}

export const DeliveryZonesManager = () => {
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
    const [formData, setFormData] = useState({
        area: "",
        delivery_time: "",
        fee: "",
        display_order: 0,
    });

    const fetchZones = async () => {
        setLoading(true);
        // Using 'as any' for the table name because the table might not be in the generated types yet
        const { data, error } = await supabase
            .from("delivery_zones" as any)
            .select("*")
            .order("display_order", { ascending: true });

        if (error) {
            toast.error("Error fetching delivery zones");
            console.error(error);
        } else {
            setZones((data as any[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchZones();
    }, []);

    const handleOpenDialog = (zone: DeliveryZone | null = null) => {
        if (zone) {
            setSelectedZone(zone);
            setFormData({
                area: zone.area,
                delivery_time: zone.delivery_time,
                fee: zone.fee,
                display_order: zone.display_order,
            });
        } else {
            setSelectedZone(null);
            setFormData({
                area: "",
                delivery_time: "",
                fee: "",
                display_order: zones.length + 1,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.area || !formData.delivery_time || !formData.fee) {
            toast.error("Please fill in all fields");
            return;
        }

        if (selectedZone) {
            const { error } = await supabase
                .from("delivery_zones" as any)
                .update(formData)
                .eq("id" as any, selectedZone.id);

            if (error) {
                toast.error("Error updating delivery zone");
            } else {
                toast.success("Delivery zone updated");
                fetchZones();
                setIsDialogOpen(false);
            }
        } else {
            const { error } = await supabase
                .from("delivery_zones" as any)
                .insert([formData]);

            if (error) {
                toast.error("Error creating delivery zone");
            } else {
                toast.success("Delivery zone created");
                fetchZones();
                setIsDialogOpen(false);
            }
        }
    };

    const handleDelete = async () => {
        if (!selectedZone) return;

        const { error } = await supabase
            .from("delivery_zones" as any)
            .delete()
            .eq("id" as any, selectedZone.id);

        if (error) {
            toast.error("Error deleting delivery zone");
        } else {
            toast.success("Delivery zone deleted");
            fetchZones();
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Delivery Zones & Fees
                        </CardTitle>
                        <CardDescription>Manage your delivery areas, times, and costs</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchZones}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleOpenDialog()}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Zone
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Order</TableHead>
                                <TableHead>Area</TableHead>
                                <TableHead>Delivery Time</TableHead>
                                <TableHead>Fee</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : zones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No delivery zones configured.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                zones.map((zone) => (
                                    <TableRow key={zone.id}>
                                        <TableCell className="font-medium">
                                            {zone.display_order}
                                        </TableCell>
                                        <TableCell>{zone.area}</TableCell>
                                        <TableCell>{zone.delivery_time}</TableCell>
                                        <TableCell>{zone.fee}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(zone)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedZone(zone);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedZone ? "Edit Delivery Zone" : "Add Delivery Zone"}</DialogTitle>
                            <DialogDescription>
                                Set the delivery details for a specific area in Bahrain.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="area">Area Name</Label>
                                <Input
                                    id="area"
                                    placeholder="e.g. Galali, Muharraq"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Delivery Time</Label>
                                <Input
                                    id="time"
                                    placeholder="e.g. Same Day, Next Day"
                                    value={formData.delivery_time}
                                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fee">Delivery Fee</Label>
                                <Input
                                    id="fee"
                                    placeholder="e.g. BD 1.500 or Free"
                                    value={formData.fee}
                                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the delivery zone for "{selectedZone?.area}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
};

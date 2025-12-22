import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Search, ArrowLeft, Mail, Phone, MapPin, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Customer {
    id: string;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    created_at: string;
}

const AdminCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAccess();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredCustomers(
                customers.filter(
                    (c) =>
                        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.phone?.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredCustomers(customers);
        }
    }, [searchQuery, customers]);

    const checkAdminAccess = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Please login to access this page");
                navigate("/auth");
                return;
            }

            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'admin')
                .single();

            if (roleError || !roleData) {
                toast.error("Access denied. Admin privileges required.");
                navigate("/");
                return;
            }

            setIsAdmin(true);
            fetchCustomers();
        } catch (error) {
            console.error("Error checking admin access:", error);
            navigate("/");
        }
    };

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
            setFilteredCustomers(data || []);
        } catch (error: any) {
            console.error("Error fetching customers:", error);
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin && !loading) return null;

    return (
        <div className="container py-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/admin")}
                    className="w-fit gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-4xl font-bold text-foreground flex items-center gap-3">
                            <Users className="h-8 w-8 text-primary" />
                            Customer Management
                        </h1>
                        <p className="text-muted-foreground text-lg mt-1">
                            View and manage your registered customers
                        </p>
                    </div>
                </div>
            </div>

            <Card className="border shadow-md">
                <CardHeader className="border-b bg-muted/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Customers</CardTitle>
                            <CardDescription>
                                {filteredCustomers.length} total customers found
                            </CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading customer directory...</p>
                        </div>
                    ) : (
                        <div className="rounded-md overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[250px]">Customer Name</TableHead>
                                        <TableHead>Contact Information</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Joined Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCustomers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                No customers found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCustomers.map((customer) => (
                                            <TableRow key={customer.id} className="hover:bg-muted/5 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {customer.full_name?.charAt(0) || <Users className="h-5 w-5" />}
                                                        </div>
                                                        <span>{customer.full_name || "Guest User"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-muted-foreground">{customer.email || "N/A"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-muted-foreground">{customer.phone || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        <span>{customer.city || "Bahrain"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCustomers;

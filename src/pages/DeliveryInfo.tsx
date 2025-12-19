import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Clock, MapPin, Package, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DeliveryInfo = () => {
    const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchZones = async () => {
            const { data, error } = await supabase
                .from("delivery_zones" as any)
                .select("*")
                .order("display_order", { ascending: true });

            if (error) {
                console.error("Error fetching delivery zones:", error);
                // Fallback to static data if table doesn't exist yet
                setDeliveryZones([
                    { area: "Galali, Muharraq", delivery_time: "Same Day", fee: "Free (orders BD 20+)" },
                    { area: "Hidd, Arad, Busaiteen", delivery_time: "Same Day", fee: "BD 1.500" },
                    { area: "Manama, Juffair, Seef", delivery_time: "Next Day", fee: "BD 1.500" },
                    { area: "Riffa, Isa Town", delivery_time: "Next Day", fee: "BD 2.000" },
                    { area: "All Other Areas", delivery_time: "1-2 Days", fee: "BD 2.500" },
                ]);
            } else {
                setDeliveryZones(data || []);
            }
            setLoading(false);
        };
        fetchZones();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 py-16 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 text-6xl animate-bounce-subtle">🚚</div>
                    <div className="absolute top-20 right-20 text-4xl animate-float-slow">📦</div>
                    <div className="absolute bottom-10 left-1/4 text-5xl animate-wiggle">🐾</div>
                    <div className="absolute bottom-20 right-1/3 text-3xl animate-swing-slow">🎁</div>
                </div>

                <div className="container relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-primary mb-6 shadow-md">
                            <Truck className="h-4 w-4" />
                            Fast & Reliable Delivery
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                            Delivery Information
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Get your pet supplies delivered fresh and fast across Bahrain!
                            We take extra care to ensure your furry friend's essentials arrive safely.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container py-12 space-y-12">

                {/* Key Highlights */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-500" />
                        <CardContent className="pt-8 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                                <Package className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Free Shipping</h3>
                            <p className="text-muted-foreground">On orders above BD 20 within delivery zones</p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-secondary/20 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-teal-400" />
                        <CardContent className="pt-8 text-center">
                            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                                <Clock className="h-8 w-8 text-secondary" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Same Day Delivery</h3>
                            <p className="text-muted-foreground">Order before 6 PM for same-day delivery nearby</p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-accent/20 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-purple-400" />
                        <CardContent className="pt-8 text-center">
                            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                                <MapPin className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Island-Wide Coverage</h3>
                            <p className="text-muted-foreground">We deliver across all areas of Bahrain</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Delivery Zones Table */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-orange-500 p-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <MapPin className="h-6 w-6" />
                            Delivery Zones & Fees
                        </h2>
                    </div>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">Area</th>
                                        <th className="text-left p-4 font-semibold">Delivery Time</th>
                                        <th className="text-left p-4 font-semibold">Delivery Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center">
                                                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                            </td>
                                        </tr>
                                    ) : (
                                        deliveryZones.map((zone, index) => (
                                            <tr key={index} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="p-4 font-medium">{zone.area}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${zone.delivery_time === "Same Day"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-blue-100 text-blue-700"
                                                        }`}>
                                                        <Clock className="h-3 w-3" />
                                                        {zone.delivery_time}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={zone.fee.includes("Free") ? "text-green-600 font-semibold" : ""}>
                                                        {zone.fee}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Minimum Order & Policies */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            What to Expect
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Order confirmation via email",
                                "Real-time delivery updates",
                                "Careful handling of all pet products",
                                "Cash on Delivery available",
                                "Temperature-controlled delivery for perishables",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                    <span className="text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-primary/5 to-orange-50 border-primary/20">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            Important Notes
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Minimum order: BD 7.000",
                                "Free shipping on orders BD 20+",
                                "Same-day delivery: Order before 6 PM",
                                "Delivery hours: 4 PM - 11 PM",
                                "Contact us for bulk/heavy orders",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                                    </div>
                                    <span className="text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* CTA Section */}
                <Card className="bg-gradient-to-r from-primary via-orange-500 to-primary p-8 text-center text-white">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Ready to Shop for Your Pet? 🐾
                        </h2>
                        <p className="text-white/90 mb-6">
                            Explore our wide range of premium pet products and get them delivered to your doorstep!
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" variant="secondary" className="font-semibold" asChild>
                                <Link to="/shop">Browse Products</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary font-semibold" asChild>
                                <a href="https://wa.me/97335957800" target="_blank" rel="noopener noreferrer">
                                    Contact Us on WhatsApp
                                </a>
                            </Button>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default DeliveryInfo;

const RefreshCw = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
    </svg>
);

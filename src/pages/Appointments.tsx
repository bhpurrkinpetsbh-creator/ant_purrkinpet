import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scissors, Sparkles, Clock, Bath, Brush, Wind, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const services = [{
  id: "basic-grooming",
  name: "Basic Grooming",
  icon: Scissors,
  description: "Essential grooming services",
  duration: "45 mins"
}, {
  id: "full-grooming-cat",
  name: "Full Grooming - Cat",
  icon: Sparkles,
  price: "4.900 BD",
  description: "Complete grooming package for cats",
  duration: "1.5 hours"
}, {
  id: "full-grooming-dog-puppy",
  name: "Full Grooming - Puppy",
  icon: Sparkles,
  price: "6.500 BD",
  description: "Complete grooming package for puppies",
  duration: "1.5 hours"
}, {
  id: "full-grooming-dog-medium",
  name: "Full Grooming - Dog (M)",
  icon: Sparkles,
  price: "8.500 BD",
  description: "Complete grooming package for medium dogs",
  duration: "2 hours"
}, {
  id: "full-grooming-dog-large",
  name: "Full Grooming - Dog (L)",
  icon: Sparkles,
  price: "11.500 BD",
  description: "Complete grooming package for large dogs",
  duration: "2.5 hours"
}, {
  id: "nail-trimming",
  name: "Nail Trimming",
  icon: Scissors,
  description: "Professional nail care",
  duration: "20 mins"
}, {
  id: "ear-cleaning",
  name: "Ear Cleaning",
  icon: Brush,
  description: "Gentle ear cleaning service",
  duration: "15 mins"
}, {
  id: "fur-styling",
  name: "Fur Styling",
  icon: Wind,
  description: "Professional styling and trimming",
  duration: "1 hour"
}, {
  id: "shower-shampoo",
  name: "Shower & Shampoo",
  icon: Bath,
  description: "Complete bath with premium shampoo",
  duration: "45 mins"
}];
const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"];
const specialOffers = [{
  icon: Gift,
  text: "Get 1 Grooming Free After 5 Visits!"
}, {
  icon: Gift,
  text: "Bring a friend & you both get 10% OFF in grooming"
}, {
  icon: Gift,
  text: "Groom 2 pets together & get 20% OFF on Accessories"
}, {
  icon: Gift,
  text: "Special Discounts for Rescued Pets"
}];
const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    petName: "",
    petType: "",
    petSize: "",
    notes: ""
  });

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots();
    }

  // Real-time subscription for appointments (DB changes limited by RLS) + broadcast fallback
  const dbChannel = supabase
    .channel('appointments-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments'
      },
      () => {
        if (selectedDate) {
          fetchBookedSlots();
        }
      }
    )
    .subscribe();

  const broadcastChannel = supabase
    .channel('appointments-broadcast')
    .on('broadcast', { event: 'appointment_booked' }, () => {
      if (selectedDate) {
        fetchBookedSlots();
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(dbChannel);
    supabase.removeChannel(broadcastChannel);
  };
  }, [selectedDate]);

  const fetchBookedSlots = async () => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Use RPC to fetch all booked slots (bypasses RLS for availability check)
    const { data, error } = await supabase.rpc('get_booked_slots', {
      p_date: dateStr
    });

    if (error) {
      console.error('Error fetching booked slots:', error);
      return;
    }

    const bookedTimes = (data || []).map((apt: { appointment_time: string }) => {
      const time = new Date(`2000-01-01T${apt.appointment_time}`);
      return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    });
    setBookedSlots(bookedTimes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error("Please select service, date, and time");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to book an appointment");
      return;
    }

    setLoading(true);

    try {
      // Ensure customer profile exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingCustomer) {
        // Create customer profile if it doesn't exist
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            id: user.id,
            full_name: formData.name,
            phone: formData.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (customerError) {
          console.error('Error creating customer profile:', customerError);
          throw new Error('Failed to create customer profile');
        }
      }

      const selectedServiceData = services.find(s => s.id === selectedService);
      
      // Parse time to 24-hour format
      const timeParts = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeParts) {
        throw new Error("Invalid time format");
      }
      let hours = parseInt(timeParts[1]);
      const minutes = timeParts[2];
      const period = timeParts[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes}:00`;

      // Determine pet size from service name
      let petSize = formData.petSize || 'medium';
      if (selectedService.includes('puppy') || selectedService.includes('small')) petSize = 'small';
      if (selectedService.includes('medium')) petSize = 'medium';
      if (selectedService.includes('large')) petSize = 'large';

      // Save to database
      const { error: dbError } = await supabase
        .from('appointments')
        .insert({
          customer_id: user.id,
          appointment_date: selectedDate.toISOString().split('T')[0],
          appointment_time: timeStr,
          pet_size: petSize,
          duration_minutes: parseInt(selectedServiceData?.duration || '60'),
          total_price: parseFloat(selectedServiceData?.price?.replace(/[^\d.]/g, '') || '0'),
          special_requests: formData.notes,
          status: 'pending'
        });

      if (dbError) throw dbError;

      // Broadcast to all clients so slots update immediately (bypass RLS limits)
      try {
        const bc = supabase.channel('appointments-broadcast');
        await bc.subscribe();
        await bc.send({
          type: 'broadcast',
          event: 'appointment_booked',
          payload: {
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime
          }
        });
        await supabase.removeChannel(bc);
      } catch (e) {
        console.warn('Broadcast failed (non-blocking):', e);
      }

      // Send to n8n webhook
      const webhookData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: user.email,
        petName: formData.petName,
        petType: formData.petType,
        petSize,
        serviceName: selectedServiceData?.name,
        servicePrice: selectedServiceData?.price,
        appointmentDate: selectedDate.toLocaleDateString(),
        appointmentTime: selectedTime,
        duration: selectedServiceData?.duration,
        specialRequests: formData.notes,
        bookingTimestamp: new Date().toISOString()
      };

      await fetch('https://n8n.srv1034374.hstgr.cloud/webhook/2bb6a776-3d96-48a0-b28b-87e4acb48c1a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      toast.success("Appointment booked successfully!", {
        description: "We'll send you a confirmation email shortly."
      });

      // Reset form
      setSelectedService("");
      setSelectedTime("");
      setFormData({
        name: "",
        phone: "",
        petName: "",
        petType: "",
        petSize: "",
        notes: ""
      });
      fetchBookedSlots();
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast.error("Failed to book appointment", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-muted-foreground text-lg">Schedule professional grooming services for your pet</p>
          <p className="text-sm text-muted-foreground mt-2">
            📅 Available: Mon-Sat, 10am–1pm & 4–11pm | 📲 WhatsApp: +973 3595 7800
          </p>
        </div>

        {/* Special Offers Banner */}
        <Card className="p-6 mb-8 bg-gradient-hero text-primary-foreground">
          <h2 className="font-display text-2xl font-bold mb-4 text-center">Exclusive Ongoing Offers!</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {specialOffers.map((offer, index) => <div key={index} className="flex items-start gap-2 text-sm">
                <offer.icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{offer.text}</span>
              </div>)}
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-4">Select Service</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {services.map(service => <button key={service.id} onClick={() => setSelectedService(service.id)} className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${selectedService === service.id ? "border-primary bg-primary/5" : "border-border"}`}>
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-hero p-2 rounded-lg flex-shrink-0">
                        <service.icon className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 text-sm">{service.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration}</span>
                          </div>
                          {service.price && <p className="text-primary font-semibold text-sm">{service.price}</p>}
                        </div>
                      </div>
                    </div>
                  </button>)}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                * Contact us for pricing on individual services
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-4">Select Date & Time</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={date => date < new Date()} className="rounded-lg border" />
                </div>

                <div>
                  <Label className="mb-3 block">Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                    {timeSlots.map(time => {
                      const isBooked = bookedSlots.includes(time);
                      return (
                        <Button 
                          key={time} 
                          variant={selectedTime === time ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => !isBooked && setSelectedTime(time)}
                          disabled={isBooked}
                          className={isBooked ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {time}
                          {isBooked && <Badge variant="secondary" className="ml-1 text-xs">Booked</Badge>}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-4">Pet & Contact Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input 
                      id="name" 
                      required 
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      required 
                      placeholder="+973..."
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pet-name">Pet Name *</Label>
                    <Input 
                      id="pet-name" 
                      required 
                      placeholder="Enter pet's name"
                      value={formData.petName}
                      onChange={(e) => setFormData({...formData, petName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pet-type">Pet Type *</Label>
                    <Select 
                      required
                      value={formData.petType}
                      onValueChange={(value) => setFormData({...formData, petType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any special requirements or information..." 
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-hero hover:opacity-90" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Booking..." : "Confirm Appointment"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Appointment Summary</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Service</Label>
                  <p className="font-medium">
                    {selectedService ? services.find(s => s.id === selectedService)?.name : "Not selected"}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Date</Label>
                  <p className="font-medium">
                    {selectedDate ? selectedDate.toLocaleDateString() : "Not selected"}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Time</Label>
                  <p className="font-medium">{selectedTime || "Not selected"}</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Price</span>
                    <span className="text-2xl font-bold text-primary">
                      {selectedService ? services.find(s => s.id === selectedService)?.price : "--"}
                    </span>
                  </div>
                </div>

                <Badge variant="secondary" className="w-full justify-center py-2">
                  Payment due at appointment
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default Appointments;
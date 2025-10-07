import { useState } from "react";
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Appointment booked successfully!", {
      description: "We'll send you a confirmation email shortly."
    });
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
                    {timeSlots.map(time => <Button key={time} variant={selectedTime === time ? "default" : "outline"} size="sm" onClick={() => setSelectedTime(time)}>
                        {time}
                      </Button>)}
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
                    <Input id="name" required placeholder="Enter your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" required placeholder="+973..." />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pet-name">Pet Name *</Label>
                    <Input id="pet-name" required placeholder="Enter pet's name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pet-type">Pet Type *</Label>
                    <Select required>
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
                  <Textarea id="notes" placeholder="Any special requirements or information..." rows={3} />
                </div>

                <Button type="submit" className="w-full bg-gradient-hero hover:opacity-90" size="lg">
                  Confirm Appointment
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
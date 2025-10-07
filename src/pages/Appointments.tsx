import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scissors, Stethoscope, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";

const services = [
  { id: "grooming-basic", name: "Basic Grooming", icon: Scissors, price: "15 BHD", duration: "1 hour" },
  { id: "grooming-full", name: "Full Grooming Package", icon: Sparkles, price: "30 BHD", duration: "2 hours" },
  { id: "vet-checkup", name: "Veterinary Checkup", icon: Stethoscope, price: "25 BHD", duration: "30 mins" },
  { id: "vet-vaccination", name: "Vaccination", icon: Stethoscope, price: "20 BHD", duration: "20 mins" },
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Appointment booked successfully!", {
      description: "We'll send you a confirmation email shortly.",
    });
  };

  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-muted-foreground text-lg">Schedule grooming or veterinary services for your pet</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-4">Select Service</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                      selectedService === service.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-hero p-2 rounded-lg">
                        <service.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{service.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{service.duration}</span>
                        </div>
                        <p className="text-primary font-semibold mt-2">{service.price}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-4">Select Date & Time</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-lg border"
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
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
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements or information..."
                    rows={3}
                  />
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
                    {selectedService
                      ? services.find((s) => s.id === selectedService)?.name
                      : "Not selected"}
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
                      {selectedService
                        ? services.find((s) => s.id === selectedService)?.price
                        : "--"}
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
    </div>
  );
};

export default Appointments;

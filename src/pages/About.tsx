import { MapPin, Phone, Clock, Instagram, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import logo from "@/assets/purrkin-logo.png";

const About = () => {
  return (
    <div className="min-h-screen">
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <img src={logo} alt="Purrkin Pets Logo" className="h-36 w-36 mx-auto mb-4" />
            <h1 className="font-display text-4xl lg:text-5xl font-bold">About Purrkin Pets</h1>
            <p className="text-xl text-muted-foreground">Your One Stop Pet Paradise</p>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-display text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to Purrkin Pets, Bahrain's favorite destination for all your pet needs. We are passionate about
                providing premium quality products and exceptional services for your beloved companions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From nutritious food to engaging toys, comfortable accessories to expert grooming services, we offer
                everything your pets need to live happy, healthy lives.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Operating Hours
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">🛍 Shop Hours</p>
                  <p className="text-muted-foreground">Daily: 10am–1pm & 4–11pm</p>
                </div>
                <div>
                  <p className="font-medium mb-1">✂️ Grooming Services</p>
                  <p className="text-muted-foreground">Monday–Saturday: 10am–1pm & 4–11pm</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">Shop A2136, Near Al Salam Bank</p>
                    <p className="text-sm text-muted-foreground">Road 5541, Block 255</p>
                    <p className="text-sm text-muted-foreground">Galali, Al Muharraq, Bahrain</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <a href="https://wa.me/97335957800" className="text-sm text-primary hover:underline">
                      +973 3595 7800
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:purrkinpets@gmail.com" className="text-sm text-primary hover:underline">
                      purrkinpets@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Instagram className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Instagram</p>
                    <a
                      href="https://www.instagram.com/purrkinpets.bh/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      @purrkinpets.bh
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Find Us
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3577.8815477368497!2d50.59616!3d26.232324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDEzJzU2LjQiTiA1MMKwMzUnNDYuMiJF!5e0!3m2!1sen!2sbh!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Purrkin Pets Location"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">7JJW+VQ Galali, Bahrain</p>
            </Card>

            <Card className="p-6 bg-gradient-hero text-primary-foreground">
              <h3 className="font-display text-2xl font-bold mb-4">Why Choose Us?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>Premium quality products from trusted brands</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>Expert grooming services by professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>Same-day delivery across Bahrain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>Convenient shop and grooming hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>Passionate about pet care and happiness</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

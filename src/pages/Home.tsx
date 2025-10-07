import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Heart, Truck, Shield, Sparkles, ShoppingBag, Calendar, Package } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import heroStorefront from "@/assets/hero-storefront.jpg";
import hamsterFood from "@/assets/hamster-food.jpg";
import catFood from "@/assets/cat-food.jpg";
import petVideo from "@/assets/pet-video.mp4";
import dogFood from "@/assets/dog-food.jpg";
import catFood2 from "@/assets/cat-food-2.jpg";
import petVideo2 from "@/assets/pet-video-2.mp4";
import waterDispensers from "@/assets/water-dispensers.jpg";
import petCarrier from "@/assets/pet-carrier.jpg";
import birdSeeds from "@/assets/bird-seeds.jpg";
import fishBowl1 from "@/assets/fish-bowl-1.jpg";
import fishBowl2 from "@/assets/fish-bowl-2.jpg";
import petVideo3 from "@/assets/pet-video-3.mp4";
import petVideo4 from "@/assets/pet-video-4.mp4";
import petVideo5 from "@/assets/pet-video-5.mp4";
import petVideo6 from "@/assets/pet-video-6.mp4";
import petVideo7 from "@/assets/pet-video-7.mp4";
import catsImage from "@/assets/category-cats.jpg";
import dogsImage from "@/assets/category-dogs.jpg";
import fishImage from "@/assets/category-fish.jpg";
import rabbitsImage from "@/assets/category-rabbits.jpg";
const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { cartCount } = useCart();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserProfile(user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('customers')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const categories = [{
    name: "Cats",
    image: catsImage,
    link: "/shop?category=cats"
  }, {
    name: "Dogs",
    image: dogsImage,
    link: "/shop?category=dogs"
  }, {
    name: "Fish",
    image: fishImage,
    link: "/shop?category=fish"
  }, {
    name: "Birds & Small Pets",
    image: rabbitsImage,
    link: "/shop?category=rabbits"
  }];
  const features = [{
    icon: Heart,
    title: "Quality Products",
    desc: "Premium pet supplies from trusted brands"
  }, {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Same-day delivery across Bahrain"
  }, {
    icon: Shield,
    title: "Safe & Secure",
    desc: "100% authentic products guaranteed"
  }, {
    icon: Sparkles,
    title: "Expert Grooming",
    desc: "Professional grooming services"
  }];
  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block space-y-2">
                <span className="bg-accent/10 py-2 rounded-full font-display text-5xl block font-extrabold text-center mx-0 px-[26px] my-0 lg:text-5xl">
                  🐾 Welcome to <span className="bg-gradient-hero bg-clip-text text-transparent text-center mx-0 px-0 my-0 py-0">PURRKIN PETS</span>
                </span>
                <p className="font-display text-5xl text-center font-bold mx-0 my-[16px] lg:text-base">Your One Stop Pet Paradise</p>
              </div>
              <h1 className="font-display text-5xl font-bold leading-tight text-center mx-0 my-0 lg:text-2xl">
                Everything Your Pet{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Needs & Loves
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg text-center">
                Discover premium pet products, book grooming appointments, and get expert care - all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-gradient-hero hover:opacity-90 shadow-md" asChild>
                  <Link to="/shop" className="mx-[54px]">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/appointments">
                    Book Appointment
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-3xl blur-3xl" />
              <Carousel className="relative w-full" plugins={[Autoplay({
              delay: 4000
            })]} opts={{
              loop: true
            }}>
                <CarouselContent>
                  <CarouselItem>
                    <img src={heroStorefront} alt="Purrkin Pets storefront" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <img src={hamsterFood} alt="Premium hamster and rabbit food products" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <img src={catFood} alt="Quality cat food selection" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <video src={petVideo} className="rounded-3xl shadow-lg w-full object-cover aspect-video" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                  </CarouselItem>
                  <CarouselItem>
                    <img src={dogFood} alt="Premium dog food products" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <img src={catFood2} alt="Quality cat food brands" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <video src={petVideo2} className="rounded-3xl shadow-lg w-full object-cover aspect-video" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                  </CarouselItem>
                  <CarouselItem>
                    <img src={waterDispensers} alt="Pet water dispensers and feeders" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <img src={petCarrier} alt="Pet carrier for travel" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <img src={birdSeeds} alt="Bird seeds and pet food varieties" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <img src={fishBowl1} alt="Beautiful betta fish in bowl" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <img src={fishBowl2} alt="Betta fish aquarium" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                  </CarouselItem>
                  <CarouselItem>
                    <video src={petVideo3} className="rounded-3xl shadow-lg w-full object-cover aspect-video" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                  </CarouselItem>
                  <CarouselItem>
                    <video src={petVideo4} className="rounded-3xl shadow-lg w-full object-cover aspect-video" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                  </CarouselItem>
                  <CarouselItem>
                    <video src={petVideo5} className="rounded-3xl shadow-lg w-full object-cover aspect-video" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                  </CarouselItem>
                  <CarouselItem>
                    <video src={petVideo6} className="rounded-3xl shadow-lg w-full object-cover aspect-video" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                  </CarouselItem>
                  <CarouselItem>
                    <video src={petVideo7} className="rounded-3xl shadow-lg w-full object-cover aspect-video" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-4">Shop by Pet</h2>
          <p className="text-muted-foreground text-lg">Find everything for your furry, feathered, or finned friends</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => <Link key={category.name} to={category.link} className="group animate-fade-in" style={{
          animationDelay: `${index * 100}ms`
        }}>
              <Card className="overflow-hidden border-2 hover:border-primary transition-all hover:shadow-lg">
                <div className="aspect-square overflow-hidden">
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Card>
            </Link>)}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <div key={feature.title} className="text-center space-y-3 animate-slide-up" style={{
            animationDelay: `${index * 100}ms`
          }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-hero shadow-md">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="relative overflow-hidden bg-gradient-hero p-12 text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            {user ? (
              <>
                <h2 className="font-display text-4xl font-bold text-primary-foreground">
                  Welcome Back, {userProfile?.full_name || 'Pet Lover'}! 🎉
                </h2>
                <p className="text-lg text-primary-foreground/90">
                  Ready to pamper your furry friends? Explore new arrivals, book grooming, or check your orders!
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" variant="secondary" className="shadow-lg" asChild>
                    <Link to="/shop">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Shop New Arrivals
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary" className="shadow-lg" asChild>
                    <Link to="/appointments">
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Grooming
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary" className="shadow-lg" asChild>
                    <Link to="/orders">
                      <Package className="mr-2 h-5 w-5" />
                      My Orders
                    </Link>
                  </Button>
                </div>
                {cartCount > 0 && (
                  <p className="text-sm text-primary-foreground/80">
                    💝 You have {cartCount} item{cartCount > 1 ? 's' : ''} in your cart!
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="font-display text-4xl font-bold text-primary-foreground">
                  Join Our Pet-Loving Community
                </h2>
                <p className="text-lg text-primary-foreground/90">
                  Sign up today and get exclusive access to special offers, expert tips, and more!
                </p>
                <Button size="lg" variant="secondary" className="shadow-lg" asChild>
                  <Link to="/auth">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </Card>
      </section>
    </div>;
};
export default Home;
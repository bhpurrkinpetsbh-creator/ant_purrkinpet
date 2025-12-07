import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Award, Truck, ShieldCheck } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroStorefront from "@/assets/hero-storefront.jpg";
import petVideo from "@/assets/pet-video.mp4";
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
import catFoodIllustration from "@/assets/cat-food-realistic.png";
import dogFoodIllustration from "@/assets/dog-food-realistic.png";
import brandRoyalCanin from "@/assets/brand-royal-canin-real.png";
import brandPurina from "@/assets/brand-purina-real.png";
import brandWhiskas from "@/assets/brand-whiskas-real.png";
import brandPedigree from "@/assets/brand-pedigree-real.png";
import brandHills from "@/assets/brand-hills-real.png";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard, { Product } from "@/components/ProductCard";
const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      // Fetch Featured Products
      const { data: featured } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(4);

      if (featured) setFeaturedProducts(featured as Product[]);

      // Fetch Discounted Products
      const { data: discounted } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .not("compare_at_price", "is", null)
        .limit(10);

      if (discounted) {
        // Client-side filter to ensure it's actually a deal
        const validDeals = discounted
          .filter(p => p.compare_at_price && p.compare_at_price > p.price)
          .slice(0, 4);
        setDiscountedProducts(validDeals as Product[]);
      }
    };

    fetchProducts();
  }, []);

  const categories = [{
    name: "Cats",
    image: catsImage,
    link: "/shop?category=cats"
  }, {
    name: "Dogs",
    image: dogsImage,
    link: "/shop?category=dogs"
  }, {
    name: "Fishes and Aquarium",
    image: fishImage,
    link: "/shop?category=fish"
  }, {
    name: "Small Pets",
    image: rabbitsImage,
    link: "/shop?category=small pets"
  }];
  const features = [{
    icon: Award,
    title: "Quality Products",
    desc: "Premium pet supplies from trusted brands"
  }, {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Same-day delivery across Bahrain"
  }, {
    icon: ShieldCheck,
    title: "Safe & Secure",
    desc: "100% authentic products guaranteed"
  }];
  return <div className="min-h-screen">
    {/* Hero Section */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
          <div className="space-y-6 animate-fade-in text-center">
            <div className="space-y-2">
              {/* Animated Border Welcome Badge */}
              <div className="relative inline-block p-[3px] rounded-full overflow-hidden">
                {/* Rotating gradient border */}
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,hsl(var(--primary)),transparent,hsl(var(--primary)),transparent)] animate-spin" style={{ animationDuration: '4s' }} />
                {/* Inner content */}
                <span className="relative z-10 py-2 rounded-full font-display text-3xl lg:text-5xl inline-block font-extrabold px-6 bg-[#fdf0e7]">
                  🐾 Welcome to <span className="bg-gradient-hero bg-clip-text text-transparent">PURRKIN PETS</span>
                </span>
              </div>
              <p className="font-display text-xl font-bold my-4">Your One Stop Pet Paradise</p>
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold leading-tight">
              Everything Your Pet{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Needs & Loves
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Discover premium pet products and get expert care - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
              <Button size="lg" className="relative overflow-hidden group bg-gradient-hero hover:opacity-100 shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105 active:scale-95" asChild>
                <Link to="/shop">
                  <span className="relative z-10 flex items-center">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group hover:bg-accent/10 transition-all duration-300 hover:scale-105 active:scale-95 border-2 hover:border-primary/50" asChild>
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative animate-slide-up">
            <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-3xl blur-3xl" />
            <Carousel className="relative w-full" plugins={[Autoplay({ delay: 4000 })]} opts={{ loop: true }}>
              <CarouselContent>
                <CarouselItem>
                  <img src={heroStorefront} alt="Purrkin Pets storefront" className="rounded-3xl shadow-lg w-full object-cover aspect-video" />
                </CarouselItem>
                <CarouselItem>
                  <video src={petVideo} className="rounded-3xl shadow-lg w-full object-cover aspect-video" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
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
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>



    {/* Categories Section - Bento Grid */}
    <section className="container py-20">
      <div className="text-center mb-12">
        <span className="text-primary font-medium text-sm uppercase tracking-wider">Explore</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Shop by Pet</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">Find everything for your furry, feathered, or finned friends</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
        {/* Dogs - Featured Large Card */}
        <Link
          to="/shop?category=dogs"
          className="col-span-2 row-span-2 group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
        >
          <img
            src={dogsImage}
            alt="Dogs"
            className="w-full h-full object-cover aspect-square lg:aspect-auto group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform group-hover:translate-y-[-8px] transition-transform duration-500">
            <h3 className="text-white text-3xl md:text-4xl font-bold mb-2 group-hover:text-primary-foreground transition-colors">Dogs</h3>
            <p className="text-white/80 text-sm mb-4 hidden md:block group-hover:text-white transition-colors">Premium food, toys, and accessories</p>
            <span className="inline-flex items-center text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium group-hover:bg-primary group-hover:text-white transition-all duration-300">
              Shop Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Cats */}
        <Link
          to="/shop?category=cats"
          className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
        >
          <img
            src={catsImage}
            alt="Cats"
            className="w-full h-full object-cover aspect-square group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform group-hover:translate-y-[-4px] transition-transform duration-500">
            <h3 className="text-white text-xl md:text-2xl font-bold group-hover:text-primary-foreground transition-colors">Cats</h3>
            <span className="text-white/80 text-xs md:text-sm hidden md:inline-flex items-center mt-2 group-hover:text-white transition-colors">
              Explore <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Fishes */}
        <Link
          to="/shop?category=fish"
          className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
        >
          <img
            src={fishImage}
            alt="Fishes and Aquarium"
            className="w-full h-full object-cover aspect-square group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform group-hover:translate-y-[-4px] transition-transform duration-500">
            <h3 className="text-white text-xl md:text-2xl font-bold group-hover:text-primary-foreground transition-colors">Fish & Aquarium</h3>
            <span className="text-white/80 text-xs md:text-sm hidden md:inline-flex items-center mt-2 group-hover:text-white transition-colors">
              Explore <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Small Pets - Spans 2 columns on mobile */}
        <Link
          to="/shop?category=small pets"
          className="col-span-2 group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
        >
          <img
            src={rabbitsImage}
            alt="Small Pets"
            className="w-full h-full object-cover aspect-[2/1] group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform group-hover:translate-y-[-4px] transition-transform duration-500">
            <h3 className="text-white text-xl md:text-2xl font-bold group-hover:text-primary-foreground transition-colors">Small Pets</h3>
            <p className="text-white/80 text-xs md:text-sm hidden md:block mt-1 group-hover:text-white transition-colors">Rabbits, hamsters, guinea pigs & more</p>
          </div>
        </Link>
      </div>
    </section>

    {/* Featured Products Section - Only show if we have data */}
    {featuredProducts.length > 0 && (
      <section className="py-16 bg-white/50 border-t">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Top Picks</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Featured Favourites</h2>
          </div>
          <div className="relative px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>
    )}

    {/* Discounted Products Section - Only show if we have data */}
    {discountedProducts.length > 0 && (
      <section className="py-16 bg-purple-50">
        <div className="container">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-red-500 font-medium text-sm uppercase tracking-wider">Limited Time</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Paw-some Deals</h2>
            </div>
            <Button variant="outline" className="hidden sm:flex" asChild>
              <Link to="/shop?sort=price_asc">View All Deals</Link>
            </Button>
          </div>
          <div className="relative px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {discountedProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/shop?sort=price_asc">View All Deals</Link>
            </Button>
          </div>
        </div>
      </section>
    )}

    {/* Pet Care Tips Section */}
    <section className="py-20 bg-gradient-to-b from-white to-accent/5">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Pet Care Tips</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Nutrition Guide</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Learn what's best for your furry friends</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Cat Food Card */}
          <Card className="overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl group">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={catFoodIllustration}
                alt="Cat Food Guide"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-2xl mb-3 flex items-center gap-2">
                🐱 Best Cat Food
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>High Protein:</strong> Look for real meat (chicken, fish, turkey) as the first ingredient</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Taurine:</strong> Essential amino acid for heart and eye health</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Low Carbs:</strong> Cats are obligate carnivores, limit grains</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Wet Food:</strong> Helps with hydration and kidney health</span>
                </li>
              </ul>
              <Button className="mt-4 bg-gradient-hero" asChild>
                <Link to="/shop?category=cats">Shop Cat Food <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </Card>

          {/* Dog Food Card */}
          <Card className="overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl group">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={dogFoodIllustration}
                alt="Dog Food Guide"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-2xl mb-3 flex items-center gap-2">
                🐕 Best Dog Food
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Quality Protein:</strong> Chicken, beef, lamb, or fish as main ingredient</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Balanced Nutrients:</strong> Vitamins, minerals, and omega fatty acids</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Age-Appropriate:</strong> Puppy, adult, or senior formulas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>No Fillers:</strong> Avoid artificial colors and preservatives</span>
                </li>
              </ul>
              <Button className="mt-4 bg-gradient-hero" asChild>
                <Link to="/shop?category=dogs">Shop Dog Food <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
    {/* Brands Section */}
    <section className="py-12 bg-white border-y">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold">Trusted Brands</h2>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto" plugins={[Autoplay({ delay: 2000 })]} opts={{ loop: true, align: "start" }}>
          <CarouselContent className="-ml-4 md:-ml-8">
            {[
              { name: "Royal Canin", img: brandRoyalCanin },
              { name: "Purina", img: brandPurina },
              { name: "Whiskas", img: brandWhiskas },
              { name: "Pedigree", img: brandPedigree },
              { name: "Hill's", img: brandHills },
              { name: "Royal Canin", img: brandRoyalCanin }, // Repeat for loop smoothness
              { name: "Purina", img: brandPurina },
            ].map((brand, index) => (
              <CarouselItem key={index} className="pl-4 md:pl-8 basis-1/3 md:basis-1/4 lg:basis-1/5">
                <div className="h-24 flex items-center justify-center p-4 hover:scale-110 transition-transform duration-300">
                  <img src={brand.img} alt={brand.name} className="max-h-full max-w-full object-contain" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 relative overflow-hidden bg-muted/30">
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">The Purrkin Promise</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-white border border-border rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-hero shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section >

    {!isLoggedIn && (
      <section className="container py-20">
        <Card className="relative overflow-hidden bg-gradient-hero p-12 md:p-16 text-center shadow-2xl">
          {/* Paw Print Pattern Background */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute top-5 left-10 text-white text-6xl rotate-12">🐾</div>
            <div className="absolute top-1/4 right-20 text-white text-4xl -rotate-12">🐾</div>
            <div className="absolute bottom-10 left-1/4 text-white text-5xl rotate-45">🐾</div>
            <div className="absolute bottom-5 right-10 text-white text-7xl -rotate-6">🐾</div>
            <div className="absolute top-1/2 left-5 text-white text-3xl rotate-90">🐾</div>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">
              Join Our Pet-Loving Community
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-lg mx-auto">
              Sign up today and get exclusive access to special offers, expert tips, and more!
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-lg px-8 py-6 h-auto font-semibold"
              asChild
            >
              <Link to="/auth">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    )}
  </div >;
};
export default Home;
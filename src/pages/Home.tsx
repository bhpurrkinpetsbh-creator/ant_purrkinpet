import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Award, Truck, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
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
import { motion } from "framer-motion";
import { SmartSearch } from "@/components/home/SmartSearch";
import { ShopByPetIcons } from "@/components/home/ShopByPetIcons";
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
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [dogProducts, setDogProducts] = useState<any[]>([]);
  const [catProducts, setCatProducts] = useState<any[]>([]);
  const [fishProducts, setFishProducts] = useState<any[]>([]);
  const [smallPetProducts, setSmallPetProducts] = useState<any[]>([]);
  const [dogCarouselIndex, setDogCarouselIndex] = useState(0);
  const [catCarouselIndex, setCatCarouselIndex] = useState(0);
  const [fishCarouselIndex, setFishCarouselIndex] = useState(0);
  const [smallPetCarouselIndex, setSmallPetCarouselIndex] = useState(0);

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

      // Fetch Discounted Products (On Offer)
      const { data: discounted } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_on_offer", true)
        .limit(10);

      if (discounted) {
        // Take first 4 items marked as offer
        setDiscountedProducts((discounted as Product[]).slice(0, 4));
      }

      // Fetch all categories for subcategory dropdown
      const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (categories) setAllCategories(categories);

      // Fetch all products with categories for filtering
      const { data: allProducts } = await supabase
        .from("products")
        .select("id, name, slug, image_url, price, category:categories(name)")
        .eq("is_active", true)
        .limit(100);

      if (allProducts) {
        // Filter products by pet category
        const dogs = allProducts.filter(p =>
          p.category?.name?.toLowerCase().includes('dog')
        ).slice(0, 20);

        const cats = allProducts.filter(p =>
          p.category?.name?.toLowerCase().includes('cat')
        ).slice(0, 20);

        const fish = allProducts.filter(p => {
          const categoryName = p.category?.name?.toLowerCase() || '';
          return categoryName.includes('fish') || categoryName.includes('aquarium');
        }).slice(0, 20);

        const smallPets = allProducts.filter(p => {
          const categoryName = p.category?.name?.toLowerCase() || '';
          return categoryName.includes('rabbit') ||
            categoryName.includes('hamster') ||
            categoryName.includes('guinea') ||
            categoryName.includes('bird') ||
            categoryName.includes('small');
        }).slice(0, 20);

        setDogProducts(dogs);
        setCatProducts(cats);
        setFishProducts(fish);
        setSmallPetProducts(smallPets);
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
    link: "/shop?category=small-pets"
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

    {/* Shop by Pet - Animal Icons */}
    <ShopByPetIcons />



    {/* OLD BENTO GRID SECTION - TEMPORARILY HIDDEN */}
    {false && (
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container py-20"
      >
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Explore</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Shop by Pet</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Find everything for your furry, feathered, or finned friends</p>
        </div>

        {/* 2x2 Grid Layout - Equal Cards */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {/* Dogs Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            className="group relative overflow-hidden hover:overflow-visible rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:z-30 aspect-[4/3]"
          >
            <Link to="/shop?category=dogs" className="block w-full h-full">
              <img
                src={dogsImage}
                alt="Dogs"
                className="w-full h-full object-cover aspect-square lg:aspect-auto group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform group-hover:translate-y-[-8px] transition-transform duration-500">
                <h3 className="text-white text-3xl md:text-4xl font-bold mb-2 group-hover:text-primary-foreground transition-colors">Dogs</h3>
                <p className="text-white/80 text-sm hidden md:block group-hover:text-white transition-colors">Premium food, toys, and accessories</p>
              </div>
            </Link>

            {/* Hover Dropdown - Dogs */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-20">
              <div className="bg-white/98 backdrop-blur-lg rounded-xl shadow-2xl p-3 w-[280px] transform scale-95 group-hover:scale-100 transition-transform duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-800">🐕 Dog Products</h4>
                  <Link
                    to="/shop?category=dogs"
                    className="text-xs text-primary hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View All →
                  </Link>
                </div>

                {/* Compact Product Carousel */}
                {dogProducts.length > 0 && (
                  <div className="relative mb-2">
                    {/* Arrows positioned inside */}
                    {dogProducts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDogCarouselIndex((prev) => (prev > 0 ? prev - 1 : dogProducts.length - 1));
                        }}
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white rounded-full p-1.5 shadow-md transition-all z-20 border border-gray-200"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                    )}

                    {/* Product Card with Hover Preview */}
                    <div className="mx-6">
                      {dogProducts[dogCarouselIndex] && (
                        <div className="relative group/preview">
                          <Link
                            to={`/product/${dogProducts[dogCarouselIndex].slug}`}
                            className="block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all">
                              <div className="h-16 overflow-hidden">
                                <img
                                  src={dogProducts[dogCarouselIndex].image_url}
                                  alt={dogProducts[dogCarouselIndex].name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-2 text-center bg-white">
                                <p className="text-xs font-semibold text-gray-800 truncate">{dogProducts[dogCarouselIndex].name}</p>
                                <p className="text-sm font-bold text-primary">{dogProducts[dogCarouselIndex].price.toFixed(3)} BD</p>
                              </div>
                            </div>
                          </Link>

                          {/* Floating Preview Popup - appears above */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover/preview:opacity-100 group-hover/preview:visible transition-all duration-200 z-[100]">
                            <Link
                              to={`/product/${dogProducts[dogCarouselIndex].slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block"
                            >
                              <div className="p-3">
                                <div className="h-32 rounded-lg overflow-hidden mb-2">
                                  <img
                                    src={dogProducts[dogCarouselIndex].image_url}
                                    alt={dogProducts[dogCarouselIndex].name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-sm font-semibold text-gray-800 text-center">{dogProducts[dogCarouselIndex].name}</p>
                                <p className="text-lg font-bold text-primary text-center mt-1">{dogProducts[dogCarouselIndex].price.toFixed(3)} BD</p>
                                <div className="mt-2 bg-primary text-white text-xs font-medium py-2 px-4 rounded-full text-center hover:bg-primary/90">
                                  View Product →
                                </div>
                              </div>
                            </Link>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45 -mt-1.5"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {dogProducts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDogCarouselIndex((prev) => (prev < dogProducts.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white rounded-full p-1.5 shadow-md transition-all z-20 border border-gray-200"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}

                    {/* Dots Indicator */}
                    {dogProducts.length > 1 && (
                      <div className="flex justify-center gap-1 mt-1.5">
                        {dogProducts.slice(0, 6).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDogCarouselIndex(idx);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === dogCarouselIndex ? 'bg-primary w-3' : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Category Quick Links */}
                <div className="border-t pt-2">
                  <div className="flex flex-wrap gap-1">
                    {allCategories
                      .filter(cat => {
                        const name = cat.name.toLowerCase();
                        const slug = cat.slug.toLowerCase();
                        return name.includes('dog') || slug.includes('dog');
                      })
                      .slice(0, 4)
                      .map(cat => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${cat.slug}`}
                          className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-700 hover:bg-primary hover:text-white rounded-full transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cat.name}
                        </Link>
                      ))}
                  </div>
                  {/* Shop All Button */}
                  <Link
                    to="/shop?category=dogs"
                    className="mt-2 w-full inline-flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Browse All Dog Essentials <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cats Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            className="group relative overflow-hidden hover:overflow-visible rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:z-30 aspect-[4/3]"
          >
            <Link to="/shop?category=cats" className="block w-full h-full">
              <img
                src={catsImage}
                alt="Cats"
                className="w-full h-full object-cover group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform group-hover:translate-y-[-8px] transition-transform duration-500">
                <h3 className="text-white text-3xl md:text-4xl font-bold mb-2 group-hover:text-primary-foreground transition-colors">Cats</h3>
                <p className="text-white/80 text-sm hidden md:block group-hover:text-white transition-colors">Everything for your feline friends</p>
              </div>
            </Link>

            {/* Hover Dropdown - Cats */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-20">
              <div className="bg-white/98 backdrop-blur-lg rounded-xl shadow-2xl p-3 w-[240px] transform scale-95 group-hover:scale-100 transition-transform duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-800">🐱 Cats</h4>
                  <Link
                    to="/shop?category=cats"
                    className="text-xs text-primary hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View All →
                  </Link>
                </div>

                {/* Compact Product Carousel */}
                {catProducts.length > 0 && (
                  <div className="relative mb-2">
                    {catProducts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCatCarouselIndex((prev) => (prev > 0 ? prev - 1 : catProducts.length - 1));
                        }}
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white rounded-full p-1 shadow-md transition-all z-20 border border-gray-200"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                    )}

                    {/* Product Card with Hover Preview */}
                    <div className="mx-5">
                      {catProducts[catCarouselIndex] && (
                        <div className="relative group/preview">
                          <Link
                            to={`/product/${catProducts[catCarouselIndex].slug}`}
                            className="block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all">
                              <div className="h-16 overflow-hidden">
                                <img
                                  src={catProducts[catCarouselIndex].image_url}
                                  alt={catProducts[catCarouselIndex].name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-1.5 text-center bg-white">
                                <p className="text-[10px] font-semibold text-gray-800 truncate">{catProducts[catCarouselIndex].name}</p>
                                <p className="text-xs font-bold text-primary">{catProducts[catCarouselIndex].price.toFixed(3)} BD</p>
                              </div>
                            </div>
                          </Link>

                          {/* Floating Preview Popup */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover/preview:opacity-100 group-hover/preview:visible transition-all duration-200 z-[100]">
                            <Link
                              to={`/product/${catProducts[catCarouselIndex].slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block"
                            >
                              <div className="p-2">
                                <div className="h-28 rounded-lg overflow-hidden mb-2">
                                  <img
                                    src={catProducts[catCarouselIndex].image_url}
                                    alt={catProducts[catCarouselIndex].name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs font-semibold text-gray-800 text-center">{catProducts[catCarouselIndex].name}</p>
                                <p className="text-base font-bold text-primary text-center mt-1">{catProducts[catCarouselIndex].price.toFixed(3)} BD</p>
                                <div className="mt-2 bg-primary text-white text-[10px] font-medium py-1.5 px-3 rounded-full text-center">
                                  View Product →
                                </div>
                              </div>
                            </Link>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-gray-200 rotate-45 -mt-1.5"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {catProducts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCatCarouselIndex((prev) => (prev < catProducts.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white rounded-full p-1 shadow-md transition-all z-20 border border-gray-200"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}

                    {catProducts.length > 1 && (
                      <div className="flex justify-center gap-1 mt-1">
                        {catProducts.slice(0, 6).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCatCarouselIndex(idx);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === catCarouselIndex ? 'bg-primary w-2.5' : 'bg-gray-300 hover:bg-gray-400'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-1.5">
                  <div className="flex flex-wrap gap-1">
                    {allCategories
                      .filter(cat => {
                        const name = cat.name.toLowerCase();
                        const slug = cat.slug.toLowerCase();
                        return name.includes('cat') || slug.includes('cat');
                      })
                      .slice(0, 3)
                      .map(cat => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${cat.slug}`}
                          className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-700 hover:bg-primary hover:text-white rounded-full transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cat.name}
                        </Link>
                      ))}
                  </div>
                  <Link
                    to="/shop?category=cats"
                    className="mt-2 w-full inline-flex items-center justify-center bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Browse All Cat Essentials <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fish Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            className="group relative overflow-hidden hover:overflow-visible rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:z-30 aspect-[4/3]"
          >
            <Link to="/shop?category=fish" className="block w-full h-full">
              <img
                src={fishImage}
                alt="Fishes and Aquarium"
                className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform group-hover:translate-y-[-8px] transition-transform duration-500">
                <h3 className="text-white text-3xl md:text-4xl font-bold mb-2 group-hover:text-primary-foreground transition-colors">Fish & Aquarium</h3>
                <p className="text-white/80 text-sm hidden md:block group-hover:text-white transition-colors">Aquatic supplies and accessories</p>
              </div>
            </Link>

            {/* Hover Dropdown - Fish */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-20">
              <div className="bg-white/98 backdrop-blur-lg rounded-xl shadow-2xl p-3 w-[240px] transform scale-95 group-hover:scale-100 transition-transform duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-800">🐠 Fish</h4>
                  <Link
                    to="/shop?category=fish"
                    className="text-xs text-primary hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View All →
                  </Link>
                </div>

                {/* Compact Product Carousel */}
                {fishProducts.length > 0 && (
                  <div className="relative mb-2">
                    {fishProducts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFishCarouselIndex((prev) => (prev > 0 ? prev - 1 : fishProducts.length - 1));
                        }}
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white rounded-full p-1 shadow-md transition-all z-20 border border-gray-200"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                    )}

                    {/* Product Card with Hover Preview */}
                    <div className="mx-5">
                      {fishProducts[fishCarouselIndex] && (
                        <div className="relative group/preview">
                          <Link
                            to={`/product/${fishProducts[fishCarouselIndex].slug}`}
                            className="block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all">
                              <div className="h-16 overflow-hidden">
                                <img
                                  src={fishProducts[fishCarouselIndex].image_url}
                                  alt={fishProducts[fishCarouselIndex].name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-1.5 text-center bg-white">
                                <p className="text-[10px] font-semibold text-gray-800 truncate">{fishProducts[fishCarouselIndex].name}</p>
                                <p className="text-xs font-bold text-primary">{fishProducts[fishCarouselIndex].price.toFixed(3)} BD</p>
                              </div>
                            </div>
                          </Link>

                          {/* Floating Preview Popup */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover/preview:opacity-100 group-hover/preview:visible transition-all duration-200 z-[100]">
                            <Link
                              to={`/product/${fishProducts[fishCarouselIndex].slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block"
                            >
                              <div className="p-2">
                                <div className="h-28 rounded-lg overflow-hidden mb-2">
                                  <img
                                    src={fishProducts[fishCarouselIndex].image_url}
                                    alt={fishProducts[fishCarouselIndex].name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs font-semibold text-gray-800 text-center">{fishProducts[fishCarouselIndex].name}</p>
                                <p className="text-base font-bold text-primary text-center mt-1">{fishProducts[fishCarouselIndex].price.toFixed(3)} BD</p>
                                <div className="mt-2 bg-primary text-white text-[10px] font-medium py-1.5 px-3 rounded-full text-center">
                                  View Product →
                                </div>
                              </div>
                            </Link>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-gray-200 rotate-45 -mt-1.5"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {fishProducts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFishCarouselIndex((prev) => (prev < fishProducts.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white rounded-full p-1 shadow-md transition-all z-20 border border-gray-200"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}

                    {fishProducts.length > 1 && (
                      <div className="flex justify-center gap-1 mt-1">
                        {fishProducts.slice(0, 6).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFishCarouselIndex(idx);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === fishCarouselIndex ? 'bg-primary w-2.5' : 'bg-gray-300 hover:bg-gray-400'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-1.5">
                  <div className="flex flex-wrap gap-1">
                    {allCategories
                      .filter(cat => {
                        const name = cat.name.toLowerCase();
                        const slug = cat.slug.toLowerCase();
                        return name.includes('fish') || slug.includes('fish') ||
                          name.includes('aquarium') || slug.includes('aquarium');
                      })
                      .slice(0, 3)
                      .map(cat => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${cat.slug}`}
                          className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-700 hover:bg-primary hover:text-white rounded-full transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cat.name}
                        </Link>
                      ))}
                  </div>
                  <Link
                    to="/shop?category=fish"
                    className="mt-2 w-full inline-flex items-center justify-center bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Browse All Fish Essentials <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Small Pets Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            className="group relative overflow-hidden hover:overflow-visible rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:z-30 aspect-[4/3]"
          >
            <Link to="/shop?category=small-pets" className="block w-full h-full">
              <img
                src={rabbitsImage}
                alt="Small Pets"
                className="w-full h-full object-cover group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform group-hover:translate-y-[-8px] transition-transform duration-500">
                <h3 className="text-white text-3xl md:text-4xl font-bold mb-2 group-hover:text-primary-foreground transition-colors">Small Pets</h3>
                <p className="text-white/80 text-sm hidden md:block group-hover:text-white transition-colors">Rabbits, hamsters, guinea pigs & more</p>
              </div>
            </Link>

            {/* Hover Dropdown - Small Pets */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-20">
              <div className="bg-white/98 backdrop-blur-lg rounded-xl shadow-2xl p-3 w-[280px] transform scale-95 group-hover:scale-100 transition-transform duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-800">🐰 Small Pets</h4>
                  <Link
                    to="/shop?category=small pets"
                    className="text-xs text-primary hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View All →
                  </Link>
                </div>

                {/* Compact Product Carousel */}
                {smallPetProducts.length > 0 && (
                  <div className="relative mb-2">
                    {smallPetProducts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSmallPetCarouselIndex((prev) => (prev > 0 ? prev - 1 : smallPetProducts.length - 1));
                        }}
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white rounded-full p-1.5 shadow-md transition-all z-20 border border-gray-200"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                    )}

                    {/* Product Card with Hover Preview */}
                    <div className="mx-6">
                      {smallPetProducts[smallPetCarouselIndex] && (
                        <div className="relative group/preview">
                          <Link
                            to={`/product/${smallPetProducts[smallPetCarouselIndex].slug}`}
                            className="block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all">
                              <div className="h-16 overflow-hidden">
                                <img
                                  src={smallPetProducts[smallPetCarouselIndex].image_url}
                                  alt={smallPetProducts[smallPetCarouselIndex].name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-2 text-center bg-white">
                                <p className="text-xs font-semibold text-gray-800 truncate">{smallPetProducts[smallPetCarouselIndex].name}</p>
                                <p className="text-sm font-bold text-primary">{smallPetProducts[smallPetCarouselIndex].price.toFixed(3)} BD</p>
                              </div>
                            </div>
                          </Link>

                          {/* Floating Preview Popup */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover/preview:opacity-100 group-hover/preview:visible transition-all duration-200 z-[100]">
                            <Link
                              to={`/product/${smallPetProducts[smallPetCarouselIndex].slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block"
                            >
                              <div className="p-3">
                                <div className="h-32 rounded-lg overflow-hidden mb-2">
                                  <img
                                    src={smallPetProducts[smallPetCarouselIndex].image_url}
                                    alt={smallPetProducts[smallPetCarouselIndex].name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-sm font-semibold text-gray-800 text-center">{smallPetProducts[smallPetCarouselIndex].name}</p>
                                <p className="text-lg font-bold text-primary text-center mt-1">{smallPetProducts[smallPetCarouselIndex].price.toFixed(3)} BD</p>
                                <div className="mt-2 bg-primary text-white text-xs font-medium py-2 px-4 rounded-full text-center hover:bg-primary/90">
                                  View Product →
                                </div>
                              </div>
                            </Link>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45 -mt-1.5"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {smallPetProducts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSmallPetCarouselIndex((prev) => (prev < smallPetProducts.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white rounded-full p-1.5 shadow-md transition-all z-20 border border-gray-200"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}

                    {smallPetProducts.length > 1 && (
                      <div className="flex justify-center gap-1 mt-1.5">
                        {smallPetProducts.slice(0, 6).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSmallPetCarouselIndex(idx);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === smallPetCarouselIndex ? 'bg-primary w-3' : 'bg-gray-300 hover:bg-gray-400'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-1.5">
                  <div className="flex flex-wrap gap-1">
                    {allCategories
                      .filter(cat => {
                        const name = cat.name.toLowerCase();
                        const slug = cat.slug.toLowerCase();
                        return name.includes('rabbit') || slug.includes('rabbit') ||
                          name.includes('hamster') || slug.includes('hamster') ||
                          name.includes('guinea') || slug.includes('guinea') ||
                          name.includes('bird') || slug.includes('bird') ||
                          name.includes('small') || slug.includes('small');
                      })
                      .slice(0, 4)
                      .map(cat => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${cat.slug}`}
                          className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-700 hover:bg-primary hover:text-white rounded-full transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cat.name}
                        </Link>
                      ))}
                  </div>
                  <Link
                    to="/shop?category=small-pets"
                    className="mt-2 w-full inline-flex items-center justify-center bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Browse All Small Pet Essentials <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    )}

    <SmartSearch />

    {/* Featured Products Section - Only show if we have data */}
    {
      featuredProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-16 bg-white/50 border-t"
        >
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
        </motion.section>
      )
    }

    {/* Discounted Products Section - Only show if we have data */}
    {
      discountedProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-16 bg-purple-50"
        >
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
        </motion.section>
      )
    }

    {/* Pet Care Tips Section */}
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="py-20 bg-gradient-to-b from-white to-accent/5"
    >
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
    </motion.section>
    {/* Brands Section */}
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-12 bg-white border-y"
    >
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
    </motion.section>

    {/* Features Section */}
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
          }
        }
      }}
      className="py-20 relative overflow-hidden bg-muted/30"
    >
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">The Purrkin Promise</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="group bg-white border border-border rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-hero shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section >

    {
      !isLoggedIn && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container py-20"
        >
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
        </motion.section>
      )
    }
  </div >;
};
export default Home;
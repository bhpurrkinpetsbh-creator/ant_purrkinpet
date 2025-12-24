import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Pet category icons - using emoji/SVG illustrations
const petCategories = [
    {
        name: "Dogs",
        slug: "dogs",
        emoji: "🐕",
        color: "from-amber-100 to-amber-200",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop&crop=face"
    },
    {
        name: "Cats",
        slug: "cats",
        emoji: "🐱",
        color: "from-orange-100 to-orange-200",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face"
    },
    {
        name: "Birds",
        slug: "birds",
        emoji: "🦜",
        color: "from-green-100 to-green-200",
        image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&crop=face"
    },
    {
        name: "Fish",
        slug: "fish",
        emoji: "🐠",
        color: "from-blue-100 to-blue-200",
        image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&h=200&fit=crop&crop=face"
    },
    {
        name: "Small Pets",
        slug: "small-pets",
        emoji: "🐹",
        color: "from-pink-100 to-pink-200",
        image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop&crop=face"
    },
    {
        name: "Rabbits",
        slug: "rabbits",
        emoji: "🐰",
        color: "from-purple-100 to-purple-200",
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop&crop=face"
    },
    {
        name: "Turtles",
        slug: "turtles",
        emoji: "🐢",
        color: "from-teal-100 to-teal-200",
        image: "/turtle-category.jpg"
    },
];

export const ShopByPetIcons = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="container py-16"
        >
            <div className="text-center mb-10">
                <span className="text-primary font-medium text-sm uppercase tracking-wider">Explore</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-3">Shop by Pet</h2>
                <p className="text-muted-foreground text-base max-w-xl mx-auto">
                    Find everything for your furry, feathered, or finned friends
                </p>
            </div>

            {/* Pet Icons Grid */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-wrap justify-center gap-6 md:gap-10"
            >
                {petCategories.map((pet) => (
                    <motion.div
                        key={pet.slug}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                    >
                        <Link
                            to={`/shop?category=${pet.slug}`}
                            className="group flex flex-col items-center gap-3"
                        >
                            {/* Pet Image Circle */}
                            <div className={`relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-gradient-to-br ${pet.color} p-1 shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                    <img
                                        src={pet.image}
                                        alt={pet.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                            </div>

                            {/* Pet Name */}
                            <span className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-primary transition-colors duration-200 uppercase tracking-wide">
                                {pet.name}
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </motion.section>
    );
};

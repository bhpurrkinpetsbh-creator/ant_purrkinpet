import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLES = [
    "show me all cat treats",
    "cat treats less than 10 bd",
    "dog products rich in bone strength",
    "product for hair growth",
    "wet food of meo"
];

interface SmartSearchProps {
    onOpenOverlay?: () => void;
}

export function SmartSearch({ onOpenOverlay }: SmartSearchProps) {
    const [query, setQuery] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [exampleIndex, setExampleIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Typing animation effect
    useEffect(() => {
        const currentExample = EXAMPLES[exampleIndex];
        const typeSpeed = isDeleting ? 30 : 80;
        const nextCharDelay = isDeleting && charIndex === 0 ? 1000 :
            !isDeleting && charIndex === currentExample.length ? 2000 : typeSpeed;

        const timer = setTimeout(() => {
            if (!isDeleting && charIndex < currentExample.length) {
                setPlaceholder(prev => prev + currentExample[charIndex]);
                setCharIndex(prev => prev + 1);
            } else if (!isDeleting && charIndex === currentExample.length) {
                setIsDeleting(true);
            } else if (isDeleting && charIndex > 0) {
                setPlaceholder(prev => prev.slice(0, -1));
                setCharIndex(prev => prev - 1);
            } else {
                setIsDeleting(false);
                setExampleIndex((prev) => (prev + 1) % EXAMPLES.length);
            }
        }, nextCharDelay);

        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, exampleIndex]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        // Redirect to shop with the query
        navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    };

    const handleClear = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    const handleInputClick = () => {
        // If there's an overlay handler, trigger it
        if (onOpenOverlay) {
            onOpenOverlay();
        }
    };

    return (
        <section className="relative py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-display font-bold mb-4"
                    >
                        What are you looking for today?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg"
                    >
                        Search by pet, price, or specific health benefits
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

                    <form
                        onSubmit={handleSearch}
                        className="relative flex items-center bg-background border-2 border-primary/20 rounded-[1.5rem] p-2 shadow-2xl focus-within:border-primary transition-all overflow-hidden"
                    >
                        <div className="pl-4 text-muted-foreground">
                            <Search className="h-6 w-6" />
                        </div>

                        <div className="relative flex-1">
                            <Input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onClick={handleInputClick}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                className="w-full border-0 focus-visible:ring-0 text-xl py-8 bg-transparent placeholder:text-muted-foreground/50"
                                placeholder={query ? "" : placeholder}
                            />
                        </div>

                        {/* Clear button - shows when there's text */}
                        <AnimatePresence>
                            {query && (
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={handleClear}
                                    className="flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4 text-gray-600" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            size="lg"
                            className="rounded-[1rem] px-8 h-12 gap-2 text-lg shadow-lg hover:shadow-primary/20 transition-all font-semibold"
                        >
                            Search
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </form>

                    {/* Quick suggestions */}
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {EXAMPLES.slice(0, 3).map((ex, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (i * 0.1) }}
                                onClick={() => setQuery(ex)}
                                className="text-sm px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors border border-border"
                            >
                                {ex}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

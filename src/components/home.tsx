import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import ProductCard from "./ProductCard";
import { supabase } from "@/lib/supabaseClient";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const HomePage = () => {
  const { totalItems } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured products from Supabase
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        
        // If Supabase is not available, use mock data
        if (!supabase) {
          console.log("Supabase not available, using mock data");
          const mockProducts: Product[] = [
            {
              id: "1",
              name: "Chocolate Chip Cookie",
              description: "Classic chocolate chip cookies made with premium chocolate.",
              price: 3.99,
              image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
            },
            {
              id: "2",
              name: "Double Chocolate Cookie",
              description: "Rich chocolate cookies with chocolate chunks.",
              price: 4.49,
              image: "https://images.unsplash.com/photo-1618923850107-d1a234d7a73a?w=800&q=80",
            },
            {
              id: "3",
              name: "Oatmeal Raisin Cookie",
              description: "Hearty oatmeal cookies with plump raisins.",
              price: 3.79,
              image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&q=80",
            },
            {
              id: "4",
              name: "Sugar Cookie",
              description: "Simple and sweet classic sugar cookies.",
              price: 3.49,
              image: "https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=800&q=80",
            },
          ];
          setFeaturedProducts(mockProducts);
          setIsLoading(false);
          return;
        }

        // Fetch from Supabase - get first 4 products as featured
        const { data, error } = await supabase
          .from("Cookies")
          .select("*")
          .limit(4)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching featured products:", error);
          setFeaturedProducts([]);
        } else {
          // Convert Supabase data to our Product format
          const products = (data || []).map((p: any) => {
            let image = p.image ?? p.image_url ?? p.imageUrl ?? "";
            
            // If image is a storage path (not a full URL), convert to public URL
            if (image && !image.startsWith("http") && supabase) {
              const { data: publicData } = supabase.storage
                .from("Cookies")
                .getPublicUrl(image);
              image = publicData.publicUrl;
            }
            
            return {
              id: p.id,
              name: p.name,
              description: p.description ?? "",
              price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
              image,
            };
          });
          setFeaturedProducts(products);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Sweets by Bella
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-foreground hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
              <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {totalItems}
              </span>
            </Link>
            <Link
              to="/admin"
              className="text-foreground hover:text-primary transition-colors"
            >
              <User className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-pink-100 to-purple-100 py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Homemade Cookies <br />
                Baked with Love
              </h1>
              <p className="text-lg text-muted-foreground">
                Delicious, freshly baked cookies delivered straight to your
                door. Made with premium ingredients and lots of love.
              </p>
              <Button asChild size="lg">
                <Link to="/shop">Shop Now</Link>
              </Button>
            </motion.div>
          </div>
          <div className="md:w-1/2">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80"
              alt="Assorted cookies"
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Featured Cookies
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Try our most popular cookies, loved by customers all over the
              city.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.image}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No products available yet.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <img
                src="https://images.unsplash.com/photo-1556911073-38141963c9e0?w=800&q=80"
                alt="Bella baking cookies"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                About Sweets by Bella
              </h2>
              <p className="text-muted-foreground mb-6">
                Hi, I'm Bella! I started baking cookies when I was just 10 years
                old, using my grandmother's recipes. What began as a hobby
                turned into a passion, and now I'm sharing my delicious
                creations with you.
              </p>
              <p className="text-muted-foreground mb-6">
                Every cookie is made from scratch using only the finest
                ingredients. No preservatives, no artificial flavors - just
                pure, homemade goodness in every bite.
              </p>
              <Button asChild variant="secondary">
                <Link to="/about">Read More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sweets by Bella</h3>
              <p className="text-muted-foreground">
                Homemade cookies baked with love and delivered to your door.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <address className="not-italic text-muted-foreground">
                <p>123 Bakery Street</p>
                <p>Cookieville, CA 90210</p>
                <p className="mt-2">Email: hello@sweetsbybella.com</p>
                <p>Phone: (555) 123-4567</p>
              </address>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
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
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
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
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
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
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Sweets by Bella. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

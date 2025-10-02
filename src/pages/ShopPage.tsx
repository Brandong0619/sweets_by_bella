import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, SlidersHorizontal, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
// Import ProductCard as a default import
import ProductCard from "../components/ProductCard";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { totalItems } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [showFilters, setShowFilters] = useState(false);

  // Categories derived from products
  const categories = [
    "all",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Cookies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        setError(`Database error: ${error.message}`);
        setProducts([]);
      } else {
        console.log("Raw data from Supabase:", data);
        console.log("Number of items:", data?.length || 0);
        
        // Cast price to number in case it's returned as string from numeric type
        const normalized = (data || []).map((p: any) => {
          let image = p.image ?? p.image_url ?? p.imageUrl ?? "";
          
          // Debug: log the original image value
          console.log("Original image value:", image);
          
          // If image is a storage path (not a full URL), convert to public URL
          if (image && !image.startsWith("http")) {
            const { data: publicData } = supabase.storage
              .from("Cookies")
              .getPublicUrl(image);
            image = publicData.publicUrl;
            console.log("Converted to public URL:", image);
          }
          
          console.log("Final image URL:", image);
          
          return {
            id: p.id,
            name: p.name,
            description: p.description ?? "",
            price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
            image,
            category: p.category ?? "classic",
          };
        });
        setProducts(normalized);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search term and category
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Sort products
    switch (sortOption) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Keep default order
        break;
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, sortOption, products]);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">
              Sweets by Bella
            </Link>
            <nav className="flex gap-6">
              <Link to="/" className="hover:underline">
                Home
              </Link>
              <Link to="/shop" className="font-bold underline">
                Shop
              </Link>
              <Link to="/cart" className="relative flex items-center gap-1 hover:underline">
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white/20 px-2 text-xs">
                  {totalItems}
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Cookie Collection</h1>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search cookies..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expandable Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-md bg-card">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filter by Category
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">Loading products...</h3>
            <p className="text-muted-foreground">Please wait a moment</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">Failed to load products</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.image}
                onAddToCart={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No cookies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSortOption("default");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold">Sweets by Bella</h3>
              <p className="text-muted-foreground">
                Homemade cookies baked with love
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-sm text-muted-foreground">
                Contact: bella@sweetsbybella.com
              </p>
              <p className="text-sm text-muted-foreground">
                © 2023 Sweets by Bella. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopPage;

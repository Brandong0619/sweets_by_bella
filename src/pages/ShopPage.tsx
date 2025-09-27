import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Chocolate Chip Cookie",
      description: "Classic chocolate chip cookies made with premium chocolate",
      price: 2.99,
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
      category: "classic",
    },
    {
      id: "2",
      name: "Double Chocolate Cookie",
      description: "Rich chocolate cookies with chocolate chunks",
      price: 3.49,
      image:
        "https://images.unsplash.com/photo-1618923850107-d1a234d7a73a?w=800&q=80",
      category: "chocolate",
    },
    {
      id: "3",
      name: "Oatmeal Raisin Cookie",
      description: "Hearty oatmeal cookies with plump raisins",
      price: 2.79,
      image:
        "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&q=80",
      category: "classic",
    },
    {
      id: "4",
      name: "Peanut Butter Cookie",
      description: "Soft peanut butter cookies with a sweet and salty flavor",
      price: 3.29,
      image:
        "https://images.unsplash.com/photo-1584365685547-9a5fb6f3a70c?w=800&q=80",
      category: "nutty",
    },
    {
      id: "5",
      name: "Sugar Cookie",
      description: "Simple and sweet sugar cookies with a hint of vanilla",
      price: 2.49,
      image:
        "https://images.unsplash.com/photo-1621236378699-8597faf6a11a?w=800&q=80",
      category: "classic",
    },
    {
      id: "6",
      name: "Macadamia Nut Cookie",
      description: "White chocolate chip cookies with macadamia nuts",
      price: 3.99,
      image:
        "https://images.unsplash.com/photo-1590080874088-eec64895b423?w=800&q=80",
      category: "nutty",
    },
  ]);

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
              <Link to="/cart" className="hover:underline">
                Cart
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
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                image={product.image}
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

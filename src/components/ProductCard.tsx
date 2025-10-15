import React, { useMemo, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Minus, Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock?: number;
  onAddToCart?: () => void;
}

const ProductCard = ({
  id = "1",
  name = "Chocolate Chip Cookie",
  price = 3.99,
  description = "Delicious homemade chocolate chip cookie with chunks of premium chocolate.",
  imageUrl = "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80",
  stock,
  onAddToCart,
}: ProductCardProps) => {
  const { addItem, items, updateQuantity } = useCart();
  const existing = useMemo(() => items.find((i) => i.id === id), [items, id]);
  const [localQty, setLocalQty] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);
  
  const isSoldOut = stock !== undefined && stock === 0;
  const isLowStock = stock !== undefined && stock > 0 && stock <= 5;
  const maxQuantity = stock !== undefined ? stock : 99;

  const increment = () => {
    setLocalQty((q) => {
      const newQty = q + 1;
      if (stock !== undefined && newQty > stock) {
        // Show alert if trying to exceed stock
        alert(`Only ${stock} available in stock!`);
        return q; // Don't increment
      }
      return Math.min(maxQuantity, newQty);
    });
  };
  
  const decrement = () => setLocalQty((q) => Math.max(1, q - 1));

  const handleAdd = () => {
    // Validate quantity doesn't exceed stock
    if (stock !== undefined && localQty > stock) {
      alert(`Only ${stock} available in stock! Please reduce your quantity.`);
      setLocalQty(stock); // Reset to max available
      return;
    }
    
    addItem({ id, name, price, imageUrl, quantity: localQty });
    setAdded(true);
    onAddToCart?.();
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Card className={`w-full max-w-[300px] overflow-hidden bg-white ${isSoldOut ? 'opacity-75' : ''}`}>
      <div className="relative h-[200px] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-300 hover:scale-105 ${isSoldOut ? 'grayscale' : ''}`}
          onError={(e) => {
            console.log("Image failed to load:", imageUrl);
            console.log("Error event:", e);
          }}
          onLoad={() => {
            console.log("Image loaded successfully:", imageUrl);
          }}
        />
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
              SOLD OUT
            </span>
          </div>
        )}
        {isLowStock && !isSoldOut && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Only {stock} left!
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{name}</h3>
          <span className="font-medium text-primary">${price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        {!isSoldOut && (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrement}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{localQty}</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={increment}
                disabled={stock !== undefined && localQty >= stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {stock !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Max: {stock} available
              </p>
            )}
          </div>
        )}
        {isSoldOut && (
          <div className="mt-4 text-sm text-red-600 font-semibold">
            Out of stock
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/product/${id}`}>View Details</Link>
        </Button>
        <Button 
          size="sm" 
          onClick={handleAdd} 
          variant={added ? "secondary" : "default"}
          disabled={isSoldOut}
        >
          {isSoldOut ? (
            "Sold Out"
          ) : added ? (
            <span className="flex items-center gap-1"><Check className="h-4 w-4" /> Added</span>
          ) : (
            "Add to Cart"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

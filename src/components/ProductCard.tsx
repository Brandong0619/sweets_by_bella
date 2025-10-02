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
  onAddToCart?: () => void;
}

const ProductCard = ({
  id = "1",
  name = "Chocolate Chip Cookie",
  price = 3.99,
  description = "Delicious homemade chocolate chip cookie with chunks of premium chocolate.",
  imageUrl = "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80",
  onAddToCart,
}: ProductCardProps) => {
  const { addItem, items, updateQuantity } = useCart();
  const existing = useMemo(() => items.find((i) => i.id === id), [items, id]);
  const [localQty, setLocalQty] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  const increment = () => setLocalQty((q) => Math.min(99, q + 1));
  const decrement = () => setLocalQty((q) => Math.max(1, q - 1));

  const handleAdd = () => {
    addItem({ id, name, price, imageUrl, quantity: localQty });
    setAdded(true);
    onAddToCart?.();
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Card className="w-full max-w-[300px] overflow-hidden bg-white">
      <div className="relative h-[200px] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            console.log("Image failed to load:", imageUrl);
            console.log("Error event:", e);
          }}
          onLoad={() => {
            console.log("Image loaded successfully:", imageUrl);
          }}
        />
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{name}</h3>
          <span className="font-medium text-primary">${price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrement}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{localQty}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={increment}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/product/${id}`}>View Details</Link>
        </Button>
        <Button size="sm" onClick={handleAdd} variant={added ? "secondary" : "default"}>
          {added ? (
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

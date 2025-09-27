import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  onAddToCart: () => void;
}

const ProductCard = ({
  id = "1",
  name = "Chocolate Chip Cookie",
  price = 3.99,
  description = "Delicious homemade chocolate chip cookie with chunks of premium chocolate.",
  imageUrl = "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80",
  onAddToCart = () => console.log("Add to cart clicked"),
}: ProductCardProps) => {
  return (
    <Card className="w-full max-w-[300px] overflow-hidden bg-white">
      <div className="relative h-[200px] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
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
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/product/${id}`}>View Details</Link>
        </Button>
        <Button size="sm" onClick={onAddToCart}>
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

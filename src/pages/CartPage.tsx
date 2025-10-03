import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/context/CartContext";
import { stripePromise } from "@/lib/stripe";

const CartPage = () => {
  const { items: cartItems, updateQuantity, removeItem, subtotal } = useCart();
  
  // Delivery address state
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    specialInstructions: ""
  });

  // Calculate cart totals
  const computedSubtotal = subtotal;
  const total = computedSubtotal; // No tax or shipping

  // Handle checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (needsDelivery) {
      // Validate delivery address
      const requiredFields = ['name', 'street', 'city', 'state', 'zipCode', 'phone'];
      const missingFields = requiredFields.filter(field => !deliveryAddress[field as keyof typeof deliveryAddress]);
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required delivery fields: ${missingFields.join(', ')}`);
        return;
      }
    }

    try {
      // Call backend to create Stripe checkout session
        const response = await fetch('https://sweets-by-bella-em82.vercel.app/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          deliveryInfo: needsDelivery ? deliveryAddress : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, checkoutUrl } = await response.json();
      
      // Store order details in localStorage as backup
      const orderDetails = {
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        deliveryInfo: needsDelivery ? deliveryAddress : null,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
      
      // Redirect to Stripe checkout URL
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  // Handle quantity changes
  // updateQuantity and removeItem come from context

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any cookies to your cart yet.
            </p>
            <Link to="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-32 h-32 bg-muted">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="font-medium">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Delivery Address & Order Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Delivery Address Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="needsDelivery" 
                      checked={needsDelivery}
                      onCheckedChange={(checked) => setNeedsDelivery(checked as boolean)}
                    />
                    <Label htmlFor="needsDelivery">
                      I need these cookies delivered
                    </Label>
                  </div>
                  
                  {needsDelivery && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deliveryName">Full Name *</Label>
                          <Input
                            id="deliveryName"
                            value={deliveryAddress.name}
                            onChange={(e) => setDeliveryAddress(prev => ({...prev, name: e.target.value}))}
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryPhone">Phone Number *</Label>
                          <Input
                            id="deliveryPhone"
                            value={deliveryAddress.phone}
                            onChange={(e) => setDeliveryAddress(prev => ({...prev, phone: e.target.value}))}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="deliveryStreet">Street Address *</Label>
                        <Input
                          id="deliveryStreet"
                          value={deliveryAddress.street}
                          onChange={(e) => setDeliveryAddress(prev => ({...prev, street: e.target.value}))}
                          placeholder="123 Main Street"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="deliveryCity">City *</Label>
                          <Input
                            id="deliveryCity"
                            value={deliveryAddress.city}
                            onChange={(e) => setDeliveryAddress(prev => ({...prev, city: e.target.value}))}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryState">State *</Label>
                          <Input
                            id="deliveryState"
                            value={deliveryAddress.state}
                            onChange={(e) => setDeliveryAddress(prev => ({...prev, state: e.target.value}))}
                            placeholder="CA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryZip">ZIP Code *</Label>
                          <Input
                            id="deliveryZip"
                            value={deliveryAddress.zipCode}
                            onChange={(e) => setDeliveryAddress(prev => ({...prev, zipCode: e.target.value}))}
                            placeholder="90210"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="specialInstructions">Special Instructions</Label>
                        <Textarea
                          id="specialInstructions"
                          value={deliveryAddress.specialInstructions}
                          onChange={(e) => setDeliveryAddress(prev => ({...prev, specialInstructions: e.target.value}))}
                          placeholder="Any special delivery instructions..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No tax or shipping charges
                    </p>
                    <Button className="w-full mt-4" onClick={handleCheckout}>
                      Proceed to Checkout
                    </Button>
                    <div className="text-center mt-4">
                      <Link
                        to="/shop"
                        className="text-sm text-primary hover:underline"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Phone, Mail, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/context/CartContext";

interface DeliveryAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, clear } = useCart();
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"zelle" | "cashapp">("zelle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  // Delivery details
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Load cart data from localStorage if available
  useEffect(() => {
    const cartData = localStorage.getItem('cartData');
    if (cartData) {
      const data = JSON.parse(cartData);
      setOrderType(data.orderType || "pickup");
      if (data.deliveryAddress) {
        setDeliveryAddress(data.deliveryAddress);
      }
      if (data.deliveryInstructions) {
        setDeliveryInstructions(data.deliveryInstructions);
      }
    }
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // No tax or shipping for Zelle/Cash App

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerEmail || !customerPhone) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (orderType === "delivery") {
      const { name, street, city, state, zipCode } = deliveryAddress;
      if (!name || !street || !city || !state || !zipCode) {
        alert("Please fill in all delivery address fields");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create order data
      const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        payment_status: "pending",
        order_type: orderType,
        total_amount: total,
        delivery_address: orderType === "delivery" ? deliveryAddress : null,
        delivery_instructions: deliveryInstructions,
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.imageUrl
        })),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      };

      // Call backend to create order
      const response = await fetch('https://sweets-by-bella-em82.vercel.app/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      
      if (result.success) {
        // Store order data in localStorage for payment instructions page
        localStorage.setItem("pendingOrder", JSON.stringify({
          ...orderData,
          order_reference: result.order_reference,
          id: result.order_id
        }));
        
        // Clear cart
        clear();
        
        // Navigate to payment instructions
        navigate(`/payment-instructions/${result.order_reference}`);
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
      
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some delicious cookies to your cart before checking out!
            </p>
            <Button onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
            <h1 className="text-xl font-semibold">Checkout</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Contact Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Type */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Order Type</h3>
                    <RadioGroup value={orderType} onValueChange={(value: "pickup" | "delivery") => setOrderType(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Pickup
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Delivery
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Delivery Address */}
                  {orderType === "delivery" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="font-medium">Delivery Address</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="delivery-name">Full Name *</Label>
                          <Input
                            id="delivery-name"
                            value={deliveryAddress.name}
                            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Doe"
                            required={orderType === "delivery"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="street">Street Address *</Label>
                          <Input
                            id="street"
                            value={deliveryAddress.street}
                            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                            placeholder="123 Main St"
                            required={orderType === "delivery"}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={deliveryAddress.city}
                              onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="City"
                              required={orderType === "delivery"}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              value={deliveryAddress.state}
                              onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                              placeholder="State"
                              required={orderType === "delivery"}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code *</Label>
                          <Input
                            id="zipCode"
                            value={deliveryAddress.zipCode}
                            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                            placeholder="12345"
                            required={orderType === "delivery"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                          <Textarea
                            id="instructions"
                            value={deliveryInstructions}
                            onChange={(e) => setDeliveryInstructions(e.target.value)}
                            placeholder="Ring doorbell, leave at front door, etc."
                            rows={3}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Payment Method</h3>
                    <RadioGroup value={paymentMethod} onValueChange={(value: "zelle" | "cashapp") => setPaymentMethod(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="zelle" id="zelle" />
                        <Label htmlFor="zelle">Zelle</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cashapp" id="cashapp" />
                        <Label htmlFor="cashapp">Cash App</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Order..." : "Place Order"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Payment Instructions</h4>
                  <p className="text-sm text-blue-800">
                    After placing your order, you'll receive payment instructions via {paymentMethod === "zelle" ? "Zelle" : "Cash App"}. 
                    Payment must be completed within 5 minutes or your order will be cancelled.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

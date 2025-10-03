import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowLeft, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface DeliveryInfo {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  specialInstructions: string;
}

interface OrderSummary {
  items: OrderItem[];
  total: number;
  deliveryInfo: DeliveryInfo | null;
  timestamp: string;
}

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { clear } = useCart();
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = searchParams.get('session_id');
    const demo = searchParams.get('demo');
    
    if (demo === 'true') {
      setIsDemo(true);
      // Get order from localStorage
      const storedOrder = localStorage.getItem('lastOrder');
      if (storedOrder) {
        setOrderSummary(JSON.parse(storedOrder));
      }
      setIsLoading(false);
    } else if (session) {
      // Real Stripe session - fetch session details
      fetchSessionDetails(session);
    } else {
      // No session or demo - show fallback
      setOrderSummary({
        items: [],
        total: 0,
        deliveryInfo: null,
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
    }
    
    // Clear the cart after successful payment
    clear();
  }, [searchParams, clear]);

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      console.log('Fetching session details for:', sessionId);
      const response = await fetch(`https://sweets-by-bella-em82.vercel.app/session/${sessionId}`);
      
      if (response.ok) {
        const sessionData = await response.json();
        console.log('Session data received:', sessionData);
        
        // Handle the case where line_items might be in a different format
        let items = [];
        if (sessionData.line_items && sessionData.line_items.data) {
          // If line_items has a data property (expanded format)
          items = sessionData.line_items.data.map((item: any) => ({
            id: item.id,
            name: item.description || 'Product',
            price: item.price.unit_amount / 100,
            quantity: item.quantity,
            imageUrl: item.price.product.images?.[0] || ''
          }));
        } else if (Array.isArray(sessionData.line_items)) {
          // If line_items is directly an array
          items = sessionData.line_items.map((item: any) => ({
            id: item.id || Math.random().toString(),
            name: item.description || 'Product',
            price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
            quantity: item.quantity || 1,
            imageUrl: item.price?.product?.images?.[0] || ''
          }));
        }
        
        setOrderSummary({
          items,
          total: sessionData.amount_total ? sessionData.amount_total / 100 : 0,
          deliveryInfo: sessionData.metadata?.order_type === 'delivery' ? {
            name: sessionData.metadata.delivery_name || '',
            phone: sessionData.metadata.delivery_phone || '',
            street: sessionData.metadata.delivery_address?.split(',')[0] || '',
            city: sessionData.metadata.delivery_address?.split(',')[1]?.trim() || '',
            state: sessionData.metadata.delivery_address?.split(',')[2]?.trim().split(' ')[0] || '',
            zipCode: sessionData.metadata.delivery_address?.split(',')[2]?.trim().split(' ')[1] || '',
            specialInstructions: sessionData.metadata.delivery_instructions || ''
          } : null,
          timestamp: new Date().toISOString()
        });
        setIsLoading(false);
      } else {
        console.error('Failed to fetch session details:', response.status, response.statusText);
        // Set a fallback order summary
        setOrderSummary({
          items: [],
          total: 0,
          deliveryInfo: null,
          timestamp: new Date().toISOString()
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      // Set a fallback order summary
      setOrderSummary({
        items: [],
        total: 0,
        deliveryInfo: null,
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order! Your cookies will be prepared with love.
          </p>
          {isDemo && (
            <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              🧪 Demo Mode - This is a test order
            </p>
          )}
        </div>

        {orderSummary && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                <div className="space-y-3">
                  {orderSummary.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </h2>
                {orderSummary.deliveryInfo ? (
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {orderSummary.deliveryInfo.name}</p>
                    <p><strong>Phone:</strong> {orderSummary.deliveryInfo.phone}</p>
                    <p><strong>Address:</strong></p>
                    <p className="ml-4">
                      {orderSummary.deliveryInfo.street}<br />
                      {orderSummary.deliveryInfo.city}, {orderSummary.deliveryInfo.state} {orderSummary.deliveryInfo.zipCode}
                    </p>
                    {orderSummary.deliveryInfo.specialInstructions && (
                      <p><strong>Special Instructions:</strong> {orderSummary.deliveryInfo.specialInstructions}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Pickup order - no delivery needed</p>
                )}
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Order placed: {new Date(orderSummary.timestamp).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mt-8 space-y-3">
          <Button asChild size="lg">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Copy, CheckCircle, AlertCircle, ArrowLeft, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: "zelle" | "cashapp";
  payment_status: string;
  order_reference: string;
  order_type: "pickup" | "delivery";
  total_amount: number;
  delivery_address?: any;
  delivery_instructions?: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  expires_at: string;
}

const PaymentInstructionsPage = () => {
  const { orderReference } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const timerStarted = useRef(false);

  // Debug when isExpired changes
  useEffect(() => {
    console.log("isExpired state changed to:", isExpired);
  }, [isExpired]);

  // Payment details - these would typically come from environment variables
  const paymentDetails = {
    zelle: {
      email: "flawlesscreations@gmail.com", // Replace with actual Zelle email
      instructions: "Send payment via Zelle app or your bank's Zelle feature"
    },
    cashapp: {
      cashtag: "$Actuallybellaa", // Replace with actual Cash App tag
      instructions: "Send payment via Cash App using the $cashtag"
    }
  };

  useEffect(() => {
    // Get order data from localStorage
    const storedOrder = localStorage.getItem("pendingOrder");
    if (storedOrder) {
      const order = JSON.parse(storedOrder);
      setOrderData(order);
      
      // Calculate time left
      const expiresAt = new Date(order.expires_at);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      
      console.log("Order expiration debug:", {
        expires_at: order.expires_at,
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
        diff: diff,
        diffMinutes: diff / (1000 * 60)
      });
      
      if (diff <= 0) {
        console.log("Order already expired");
        setIsExpired(true);
        setTimeLeft(0);
      } else {
        console.log("Order still valid, time left:", Math.floor(diff / 1000), "seconds");
        setTimeLeft(Math.floor(diff / 1000));
      }

      // Also fetch from database to compare
      if (supabase && orderReference) {
        fetchOrderFromDatabase();
      }
    } else {
      // No order data found, redirect to cart
      navigate("/cart");
    }
  }, [navigate, orderReference]);

  const fetchOrderFromDatabase = async () => {
    if (!supabase || !orderReference) return;
    
    try {
      console.log("Fetching order from database:", orderReference);
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_reference', orderReference)
        .single();

      if (error) {
        console.error("Error fetching order from database:", error);
      } else {
        console.log("Database order status:", {
          payment_status: order.payment_status,
          status: order.status,
          expires_at: order.expires_at,
          created_at: order.created_at
        });
        
        // If database shows expired/cancelled, update local state
        if (order.payment_status === 'expired' || order.status === 'cancelled') {
          console.log("Database shows order as expired/cancelled, updating local state");
          setIsExpired(true);
          setTimeLeft(0);
        } else {
          console.log("Database shows order as still pending, keeping current state");
          // Don't override timer state if database shows pending and timer is still running
        }
      }
    } catch (error) {
      console.error("Error in fetchOrderFromDatabase:", error);
    }
  };

  // Timer effect - only start once when orderData is loaded
  useEffect(() => {
    if (!orderData || timerStarted.current || timeLeft <= 0) {
      return;
    }

    console.log("Starting timer with timeLeft:", timeLeft);
    timerStarted.current = true;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        console.log("Timer tick, prev timeLeft:", prev);
        if (prev <= 1) {
          console.log("Timer reached 0, setting expired to true");
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      console.log("Clearing timer");
      clearInterval(timer);
    };
  }, [orderData]); // Only run when orderData is loaded

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleOrderStatus = () => {
    if (orderData) {
      navigate(`/order-status/${orderData.order_reference}`);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find your order. Please try again.
            </p>
            <Button onClick={() => navigate("/cart")}>
              Back to Cart
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paymentDetail = paymentDetails[orderData.payment_method];

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
            <h1 className="text-xl font-semibold">Payment Instructions</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={isExpired ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {isExpired ? (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">
                      {isExpired ? "Order Expired" : "Order Placed Successfully!"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Order #{orderData.order_reference}
                    </p>
                  </div>
                </div>
                
                {!isExpired && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-lg font-medium">
                      Time remaining: {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
                
                {isExpired && (
                  <div className="text-red-600 font-medium mb-4">
                    This order has expired. Please place a new order.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Instructions */}
          {!isExpired && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${orderData.payment_method === "zelle" ? "bg-blue-500" : "bg-green-500"}`} />
                    Payment Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Send ${orderData.total_amount.toFixed(2)} via {orderData.payment_method === "zelle" ? "Zelle" : "Cash App"}
                    </h3>
                    <p className="text-muted-foreground">
                      {paymentDetail.instructions}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          {orderData.payment_method === "zelle" ? "Zelle Email" : "Cash App Tag"}
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={orderData.payment_method === "zelle" ? paymentDetail.email : paymentDetail.cashtag}
                            readOnly
                            className="font-mono"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(
                              orderData.payment_method === "zelle" ? paymentDetail.email : paymentDetail.cashtag,
                              "payment"
                            )}
                          >
                            {copied === "payment" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Payment Note (IMPORTANT)
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={`${orderData.order_reference}`}
                            readOnly
                            className="font-mono"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(orderData.order_reference, "note")}
                          >
                            {copied === "note" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Include this exact text in your payment note so we can match your payment to your order.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Important Reminders:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Payment must be sent within {formatTime(timeLeft)} or your order will be cancelled</li>
                      <li>• Include "{orderData.order_reference}" in your payment note</li>
                      <li>• Send exactly ${orderData.total_amount.toFixed(2)}</li>
                      <li>• You'll receive an email confirmation once payment is received</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Customer</Label>
                    <p className="font-medium">{orderData.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="font-medium">{orderData.customer_email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Phone</Label>
                    <p className="font-medium">{orderData.customer_phone}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Order Type</Label>
                    <Badge variant={orderData.order_type === "delivery" ? "default" : "secondary"}>
                      {orderData.order_type === "delivery" ? "Delivery" : "Pickup"}
                    </Badge>
                  </div>
                </div>

                {orderData.order_type === "delivery" && orderData.delivery_address && (
                  <div>
                    <Label className="text-gray-600">Delivery Address</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{orderData.delivery_address.name}</p>
                      <p>{orderData.delivery_address.street}</p>
                      <p>{orderData.delivery_address.city}, {orderData.delivery_address.state} {orderData.delivery_address.zipCode}</p>
                      {orderData.delivery_instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Instructions:</strong> {orderData.delivery_instructions}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-gray-600">Items</Label>
                  <div className="mt-2 space-y-2">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>${orderData.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Button variant="outline" onClick={handleOrderStatus}>
              Check Order Status
            </Button>
            <Button onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructionsPage;

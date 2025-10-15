import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw,
  Package,
  Truck,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

interface OrderData {
  id: string;
  order_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: string;
  payment_status: string;
  order_type: string;
  total_amount: number;
  delivery_address: any;
  delivery_instructions: string;
  status: string;
  created_at: string;
  expires_at: string;
  order_items: Array<{
    product_name: string;
    product_price: number;
    quantity: number;
    product_image: string;
  }>;
}

const OrderStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      label: "Pending Payment",
      description: "Waiting for payment confirmation"
    },
    paid: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      label: "Payment Received",
      description: "Your payment has been confirmed"
    },
    confirmed: {
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      label: "Order Confirmed",
      description: "We're preparing your cookies"
    },
    preparing: {
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      label: "Preparing",
      description: "Your cookies are being baked"
    },
    ready: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      label: "Ready for Pickup",
      description: "Your order is ready!"
    },
    delivered: {
      icon: Truck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      label: "Delivered",
      description: "Your order has been delivered"
    },
    cancelled: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      label: "Cancelled",
      description: "This order has been cancelled"
    },
    expired: {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      label: "Expired",
      description: "Payment was not received in time"
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        // Fallback to localStorage for development
        const storedOrder = localStorage.getItem("pendingOrder");
        if (storedOrder) {
          const orderData = JSON.parse(storedOrder);
          setOrder({
            id: "local-" + orderData.order_reference,
            order_reference: orderData.order_reference,
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email,
            customer_phone: orderData.customer_phone,
            payment_method: orderData.payment_method,
            payment_status: orderData.payment_status,
            order_type: orderData.order_type,
            total_amount: orderData.total_amount,
            delivery_address: orderData.delivery_address,
            delivery_instructions: orderData.delivery_instructions || "",
            status: orderData.payment_status,
            created_at: new Date().toISOString(),
            expires_at: orderData.expires_at,
            order_items: orderData.items.map((item: any) => ({
              product_name: item.name,
              product_price: item.price,
              quantity: item.quantity,
              product_image: item.image
            }))
          });
        } else {
          setError("Order not found");
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('order_reference', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        setError("Order not found");
      } else {
        setOrder(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || "We couldn't find an order with that reference number."}
            </p>
            <Button onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/shop")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Button>
            <h1 className="text-xl font-semibold">Order Status</h1>
            <Button
              variant="ghost"
              onClick={fetchOrder}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <StatusIcon className={`h-12 w-12 ${statusInfo.color}`} />
                  <div>
                    <h2 className="text-2xl font-semibold">Order #{order.order_reference}</h2>
                    <p className="text-muted-foreground">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge variant="secondary" className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Payment Status:</span>
                    <Badge variant={
                      order.payment_status === 'paid' ? 'default' : 
                      order.payment_status === 'pending' ? 'secondary' : 
                      'destructive'
                    }>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Payment Method:</span>
                    <span className="capitalize">{order.payment_method}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>{statusInfo.label}:</strong> {statusInfo.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Name</Label>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Email</Label>
                    <p className="font-medium">{order.customer_email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Phone</Label>
                    <p className="font-medium">{order.customer_phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Order Type</Label>
                    <Badge variant={order.order_type === "delivery" ? "default" : "secondary"}>
                      {order.order_type === "delivery" ? "Delivery" : "Pickup"}
                    </Badge>
                  </div>
                </div>

                {order.order_type === "delivery" && order.delivery_address && (
                  <div>
                    <Label className="text-sm text-gray-600">Delivery Address</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{order.delivery_address.name}</p>
                      <p>{order.delivery_address.street}</p>
                      <p>{order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.zipCode}</p>
                      {order.delivery_instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Instructions:</strong> {order.delivery_instructions}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.product_price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">${item.product_price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>${order.total_amount.toFixed(2)}</span>
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
            <Button variant="outline" onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
            {order.payment_status === 'pending' && (
              <Button onClick={() => navigate(`/payment-instructions/${order.order_reference}`)}>
                View Payment Instructions
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;

const express = require("express");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');
require("dotenv").config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log('✅ Supabase client initialized successfully');
} else {
  console.log('⚠️ Supabase not configured - database functionality disabled');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Add basic error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware - Temporary permissive CORS for debugging
app.use(
  cors({
    origin: true, // Allow all origins temporarily
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  })
);

// Add CORS debugging middleware
app.use((req, res, next) => {
  console.log('CORS Debug:', {
    origin: req.headers.origin,
    method: req.method,
    url: req.url
  });
  
  // Manually set CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  console.log('Preflight request received:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Sweets by Bella Backend API - Minimal Test Version" });
});

// Test endpoint to verify CORS is working
app.get("/test-cors", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.json({ 
    message: "CORS test successful", 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint
app.post("/test-cors", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.json({ 
    message: "POST CORS test successful", 
    origin: req.headers.origin,
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Create order endpoint for Zelle/Cash App payments
app.post("/create-order", async (req, res) => {
  // Set CORS headers for this specific endpoint
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      payment_method,
      order_type,
      total_amount,
      delivery_address,
      delivery_instructions,
      items,
      expires_at
    } = req.body;

    // Generate order reference
    const order_reference = `ORDER-${Date.now()}`;

    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        stripe_session_id: order_reference, // Using order_reference as session_id for compatibility
        customer_name,
        customer_email,
        customer_phone,
        total_amount,
        order_type,
        status: 'pending',
        delivery_address,
        delivery_instructions,
        payment_method,
        payment_status: 'pending',
        order_reference,
        expires_at
      }])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return res.status(500).json({ error: "Failed to create order" });
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      product_image: item.image
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Order was created but items failed - we'll still return success
    }

    res.json({
      success: true,
      order_id: order.id,
      order_reference,
      message: "Order created successfully"
    });

  } catch (error) {
    console.error("Error in create-order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update payment status endpoint
app.post("/update-payment-status", async (req, res) => {
  try {
    const { order_reference, payment_status, status } = req.body;

    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const updateData = {};
    if (payment_status) updateData.payment_status = payment_status;
    if (status) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('order_reference', order_reference)
      .select()
      .single();

    if (error) {
      console.error("Error updating payment status:", error);
      return res.status(500).json({ error: "Failed to update payment status" });
    }

    res.json({
      success: true,
      order: data,
      message: "Payment status updated successfully"
    });

  } catch (error) {
    console.error("Error in update-payment-status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get order by reference
app.get("/order/:orderReference", async (req, res) => {
  try {
    const { orderReference } = req.params;

    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_reference', orderReference)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Error in get-order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🍪 Zelle/Cash App payment system - Supabase enabled`);
  });
}

// Export for Vercel
module.exports = app;

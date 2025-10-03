const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
require("dotenv").config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      /^https:\/\/sweets-by-bella.*\.vercel\.app$/
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.raw({ type: "application/json" }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Sweets by Bella Backend API" });
});

// Create checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, deliveryInfo } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description || item.name,
          images: item.imageUrl ? [item.imageUrl] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Prepare metadata
    const metadata = {
      order_type: deliveryInfo ? "delivery" : "pickup",
    };

    if (deliveryInfo) {
      metadata.delivery_name = deliveryInfo.name;
      metadata.delivery_phone = deliveryInfo.phone;
      metadata.delivery_address = `${deliveryInfo.street}, ${deliveryInfo.city}, ${deliveryInfo.state} ${deliveryInfo.zipCode}`;
      if (deliveryInfo.specialInstructions) {
        metadata.delivery_instructions = deliveryInfo.specialInstructions;
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata,
      customer_email: deliveryInfo?.email || undefined,
    });

      res.json({ 
        sessionId: session.id,
        checkoutUrl: session.url 
      });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Webhook endpoint for Stripe events (disabled for local testing)
app.post("/webhook", (req, res) => {
  console.log(
    "Webhook received (webhook secret not configured for local testing)"
  );
  res.json({
    received: true,
    message: "Webhook received but not processed in local mode",
  });
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
  try {
    console.log("Processing successful payment for session:", session.id);

    // Extract order details from metadata
    const { metadata } = session;
    const orderData = {
      sessionId: session.id,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
      orderType: metadata.order_type,
      deliveryInfo:
        metadata.order_type === "delivery"
          ? {
              name: metadata.delivery_name,
              phone: metadata.delivery_phone,
              address: metadata.delivery_address,
              instructions: metadata.delivery_instructions,
            }
          : null,
      timestamp: new Date().toISOString(),
    };

    console.log("Order data:", orderData);

    // Save to Supabase if configured
    if (supabase) {
      try {
        // Get line items from Stripe
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ['data.price.product']
        });

        // Prepare order data for Supabase
        const supabaseOrderData = {
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email,
          customer_name: session.customer_details?.name || metadata.delivery_name,
          total_amount: session.amount_total / 100, // Convert from cents
          order_type: metadata.order_type || 'pickup',
          status: 'pending',
          delivery_address: metadata.order_type === 'delivery' ? {
            name: metadata.delivery_name,
            phone: metadata.delivery_phone,
            street: metadata.delivery_address?.split(',')[0],
            city: metadata.delivery_address?.split(',')[1]?.trim(),
            state: metadata.delivery_address?.split(',')[2]?.trim().split(' ')[0],
            zipCode: metadata.delivery_address?.split(',')[2]?.trim().split(' ')[1]
          } : null,
          delivery_phone: metadata.delivery_phone,
          delivery_instructions: metadata.delivery_instructions
        };

        console.log("💾 Saving order to Supabase:", supabaseOrderData);
        console.log("🔗 Supabase client configured:", !!supabase);

        // Save order to Supabase
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([supabaseOrderData])
          .select()
          .single();

        console.log("📝 Supabase insert result:", { order, orderError });

        if (orderError) {
          console.error("Error saving order:", orderError);
        } else {
          console.log("Order saved successfully:", order.id);

          // Save order items
          const orderItems = lineItems.data.map(item => ({
            order_id: order.id,
            product_name: item.description,
            product_price: item.price.unit_amount / 100,
            quantity: item.quantity,
            product_image: item.price.product.images?.[0] || ''
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            console.error("Error saving order items:", itemsError);
          } else {
            console.log("Order items saved successfully");
          }
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    } else {
      console.log("Supabase not configured, skipping order save");
    }

    // TODO: Send confirmation email
    // TODO: Notify admin
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

// Get session details
app.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    res.json(session);
  } catch (error) {
    console.error("Error retrieving session:", error);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
  });
}

// Export for Vercel
module.exports = app;

const express = require("express");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
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

// Email configuration - only create if credentials are available
let emailTransporter = null;
console.log('🔍 Email configuration check:', {
  hasEmailUser: !!process.env.EMAIL_USER,
  hasEmailPassword: !!process.env.EMAIL_PASSWORD,
  emailUser: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '...' : 'not set'
});

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  try {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    console.log('✅ Email transporter initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error);
    emailTransporter = null;
  }
} else {
  console.log('⚠️ Email credentials not provided - email functionality disabled');
  console.log('📧 To enable emails, set EMAIL_USER and EMAIL_PASSWORD in Vercel environment variables');
}

// Email helper functions
const sendEmail = async (to, subject, html) => {
  try {
    console.log('📧 Attempting to send email:', { to, subject });
    
    if (!emailTransporter) {
      console.log('❌ Email transporter not available, skipping email send');
      return { success: false, error: 'Email transporter not available' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html
    };

    console.log('📤 Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html
    });

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    return { success: false, error: error.message };
  }
};

const generateOrderConfirmationEmail = (orderData) => {
  const paymentMethod = orderData.payment_method === 'zelle' ? 'Zelle' : 'Cash App';
  const paymentDetails = orderData.payment_method === 'zelle' 
    ? '(956) 373-1079' 
    : '$Actuallybellaa';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; }
        .payment-box { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍪 Sweets by Bella</h1>
          <h2>Order Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Hi ${orderData.customer_name},</p>
          
          <p>Thank you for your order! Your order has been placed successfully.</p>
          
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Order Reference:</strong> ${orderData.order_reference}</li>
            <li><strong>Total Amount:</strong> $${orderData.total_amount.toFixed(2)}</li>
            <li><strong>Order Type:</strong> ${orderData.order_type === 'delivery' ? 'Delivery' : 'Pickup'}</li>
            <li><strong>Payment Method:</strong> ${paymentMethod}</li>
          </ul>
          
          ${orderData.order_type === 'delivery' && orderData.delivery_address ? `
          <h3>Delivery Address:</h3>
          <p>
            ${orderData.delivery_address.name}<br>
            ${orderData.delivery_address.street}<br>
            ${orderData.delivery_address.city}, ${orderData.delivery_address.state} ${orderData.delivery_address.zipCode}
          </p>
          ` : ''}
          
          <div class="payment-box">
            <h3>💳 Payment Instructions</h3>
            <p><strong>Send $${orderData.total_amount.toFixed(2)} via ${paymentMethod} to:</strong></p>
            <p style="font-size: 18px; font-weight: bold;">${paymentDetails}</p>
            <p><strong>IMPORTANT:</strong> Include "${orderData.order_reference}" in your payment note!</p>
          </div>
          
          <div class="urgent">
            <h3>⏰ Payment Deadline</h3>
            <p><strong>You have 5 minutes to complete your payment.</strong> If payment is not received within this time, your order will be automatically cancelled.</p>
          </div>
          
          <p>Once we receive your payment, you'll get another email confirmation and we'll start preparing your delicious cookies!</p>
          
          <p>Questions? Reply to this email or contact us directly.</p>
          
          <p>Thank you for choosing Sweets by Bella! 🍪</p>
        </div>
        
        <div class="footer">
          <p>Sweets by Bella<br>
          <a href="mailto:flawlesscreations@gmail.com">flawlesscreations@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePaymentReceivedEmail = (orderData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d4edda; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; }
        .success-box { background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍪 Sweets by Bella</h1>
          <h2>Payment Received! 🎉</h2>
        </div>
        
        <div class="content">
          <p>Hi ${orderData.customer_name},</p>
          
          <div class="success-box">
            <h3>✅ Payment Confirmed</h3>
            <p>Great news! We've received your payment for order <strong>${orderData.order_reference}</strong>.</p>
          </div>
          
          <h3>What's Next?</h3>
          <p>We're now preparing your delicious cookies! ${orderData.order_type === 'delivery' ? 'We\'ll deliver them to your address as soon as they\'re ready.' : 'You can pick them up when they\'re ready.'}</p>
          
          <p>We'll send you another update when your order is ready for ${orderData.order_type === 'delivery' ? 'delivery' : 'pickup'}.</p>
          
          <p>Thank you for your order! 🍪</p>
        </div>
        
        <div class="footer">
          <p>Sweets by Bella<br>
          <a href="mailto:flawlesscreations@gmail.com">flawlesscreations@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateAdminNewOrderEmail = (orderData, orderItems) => {
  const paymentMethod = orderData.payment_method === 'zelle' ? 'Zelle' : 'Cash App';
  const paymentDetails = orderData.payment_method === 'zelle' 
    ? '(956) 373-1079' 
    : '$Actuallybellaa';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; border-left: 5px solid #007bff; }
        .content { padding: 20px; }
        .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .order-box { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍪 Sweets by Bella - Admin</h1>
          <h2>New Order Received! 📦</h2>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <h3>🚨 Action Required</h3>
            <p><strong>A new order has been placed and is waiting for payment verification!</strong></p>
          </div>
          
          <h3>📋 Order Details</h3>
          <div class="order-box">
            <p><strong>Order Reference:</strong> ${orderData.order_reference}</p>
            <p><strong>Customer:</strong> ${orderData.customer_name}</p>
            <p><strong>Email:</strong> ${orderData.customer_email}</p>
            <p><strong>Phone:</strong> ${orderData.customer_phone}</p>
            <p><strong>Order Type:</strong> ${orderData.order_type === 'delivery' ? 'Delivery' : 'Pickup'}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Total Amount:</strong> $${orderData.total_amount.toFixed(2)}</p>
            <p><strong>Order Time:</strong> ${new Date(orderData.created_at || new Date()).toLocaleString()}</p>
          </div>
          
          ${orderData.order_type === 'delivery' && orderData.delivery_address ? `
          <h3>📍 Delivery Address</h3>
          <div class="order-box">
            <p><strong>Name:</strong> ${orderData.delivery_address.name}</p>
            <p><strong>Address:</strong> ${orderData.delivery_address.street}</p>
            <p><strong>City:</strong> ${orderData.delivery_address.city}, ${orderData.delivery_address.state} ${orderData.delivery_address.zipCode}</p>
            ${orderData.delivery_instructions ? `<p><strong>Instructions:</strong> ${orderData.delivery_instructions}</p>` : ''}
          </div>
          ` : ''}
          
          <h3>🛒 Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>$${item.product_price.toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td>$${(item.product_price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>$${orderData.total_amount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <h3>💳 Payment Instructions for Customer</h3>
          <div class="order-box">
            <p><strong>Customer should send $${orderData.total_amount.toFixed(2)} via ${paymentMethod} to:</strong></p>
            <p style="font-size: 18px; font-weight: bold; color: #007bff;">${paymentDetails}</p>
            <p><strong>With order reference:</strong> ${orderData.order_reference}</p>
            <p><strong>Payment deadline:</strong> 5 minutes from order placement</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sweets-by-bella-pln9.vercel.app/admin" class="cta-button">
              📊 View Order in Admin Dashboard
            </a>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Check your ${paymentMethod} account for payment</li>
            <li>Look for payment with order reference: <strong>${orderData.order_reference}</strong></li>
            <li>Mark order as "Paid" in the admin dashboard</li>
            <li>Start preparing the order!</li>
          </ol>
        </div>
        
        <div class="footer">
          <p>Sweets by Bella Admin Dashboard<br>
          <a href="mailto:gonzalezbella1010@gmail.com">gonzalezbella1010@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

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

    // Send order confirmation email to customer
    try {
      const emailData = {
        customer_name,
        customer_email,
        order_reference,
        total_amount,
        order_type,
        payment_method,
        delivery_address
      };
      
      const emailHtml = generateOrderConfirmationEmail(emailData);
      const emailResult = await sendEmail(
        customer_email,
        `Order Confirmation - ${order_reference}`,
        emailHtml
      );
      
      if (emailResult.success) {
        console.log('✅ Order confirmation email sent successfully');
      } else {
        console.log('⚠️ Failed to send order confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    // Send admin notification email
    try {
      const adminEmailData = {
        customer_name,
        customer_email,
        customer_phone,
        order_reference,
        total_amount,
        order_type,
        payment_method,
        delivery_address,
        delivery_instructions,
        created_at: new Date().toISOString()
      };
      
      const adminEmailHtml = generateAdminNewOrderEmail(adminEmailData, orderItems);
      const adminEmailResult = await sendEmail(
        'gonzalezbella1010@gmail.com', // Sister's email
        `🚨 New Order Alert - ${order_reference}`,
        adminEmailHtml
      );
      
      if (adminEmailResult.success) {
        console.log('✅ Admin notification email sent successfully');
      } else {
        console.log('⚠️ Failed to send admin notification email:', adminEmailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending admin notification email:', emailError);
      // Don't fail the order creation if email fails
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

    // Send payment received email if status changed to paid
    if (payment_status === 'paid' && data.customer_email) {
      try {
        const emailHtml = generatePaymentReceivedEmail(data);
        const emailResult = await sendEmail(
          data.customer_email,
          `Payment Received - ${data.order_reference}`,
          emailHtml
        );
        
        if (emailResult.success) {
          console.log('✅ Payment received email sent successfully');
        } else {
          console.log('⚠️ Failed to send payment received email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Error sending payment received email:', emailError);
        // Don't fail the status update if email fails
      }
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
    console.log(`🍪 Zelle/Cash App payment system - Full features enabled`);
  });
}

// Export for Vercel
module.exports = app;

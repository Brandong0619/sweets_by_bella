// Vercel Cron Job to cancel expired orders
// Runs every minute to check for expired orders

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured, skipping email send');
      return { success: false, error: 'Email not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

const generateOrderExpiredEmail = (orderData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8d7da; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; }
        .expired-box { background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍪 Sweets by Bella</h1>
          <h2>Order Expired</h2>
        </div>
        
        <div class="content">
          <p>Hi ${orderData.customer_name},</p>
          
          <div class="expired-box">
            <h3>⏰ Payment Time Expired</h3>
            <p>Unfortunately, we didn't receive payment for order <strong>${orderData.order_reference}</strong> within the 5-minute window, so it has been automatically cancelled.</p>
          </div>
          
          <p>Don't worry! You can place a new order anytime at our website.</p>
          
          <p>If you sent a payment but it didn't go through, please contact us and we'll help you resolve it.</p>
          
          <p>Thank you for your interest in Sweets by Bella! 🍪</p>
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

export default async function handler(req, res) {
  // Only allow GET requests (Vercel cron jobs send GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🕐 Running expired orders check...');

    if (!supabase) {
      console.log('❌ Supabase not configured');
      return res.status(500).json({ error: 'Database not configured' });
    }

    const now = new Date().toISOString();
    
    // Find expired orders
    const { data: expiredOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_reference, customer_email, customer_name')
      .eq('payment_status', 'pending')
      .lt('expires_at', now);

    if (fetchError) {
      console.error('❌ Error fetching expired orders:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch expired orders' });
    }

    if (expiredOrders.length === 0) {
      console.log('✅ No expired orders found');
      return res.json({
        success: true,
        message: 'No expired orders found',
        cancelled_count: 0
      });
    }

    console.log(`🔄 Found ${expiredOrders.length} expired orders, cancelling...`);

    // Update expired orders
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'expired',
        status: 'cancelled',
        updated_at: now
      })
      .in('id', expiredOrders.map(order => order.id));

    if (updateError) {
      console.error('❌ Error updating expired orders:', updateError);
      return res.status(500).json({ error: 'Failed to update expired orders' });
    }

    console.log(`✅ Cancelled ${expiredOrders.length} expired orders`);

    // Send expiration emails to customers
    let emailsSent = 0;
    for (const order of expiredOrders) {
      if (order.customer_email) {
        try {
          const emailHtml = generateOrderExpiredEmail(order);
          const emailResult = await sendEmail(
            order.customer_email,
            `Order Expired - ${order.order_reference}`,
            emailHtml
          );
          
          if (emailResult.success) {
            console.log(`📧 Expiration email sent to ${order.customer_email}`);
            emailsSent++;
          } else {
            console.log(`❌ Failed to send expiration email to ${order.customer_email}:`, emailResult.error);
          }
        } catch (emailError) {
          console.error(`❌ Error sending expiration email to ${order.customer_email}:`, emailError);
        }
      }
    }

    console.log(`📧 Sent ${emailsSent} expiration emails`);

    return res.json({
      success: true,
      message: `${expiredOrders.length} expired orders cancelled`,
      cancelled_count: expiredOrders.length,
      emails_sent: emailsSent,
      cancelled_orders: expiredOrders
    });

  } catch (error) {
    console.error('💥 Error in cancel-expired-orders cron:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

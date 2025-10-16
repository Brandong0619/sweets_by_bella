# Email Setup for Sweets by Bella

This guide explains how to set up email notifications for the Zelle/Cash App payment system.

## Required Environment Variables

Add these environment variables to your Vercel backend deployment:

### For Gmail (Recommended)
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### For Other Email Services
You can modify the email configuration in `backend/server.js` to use other services like:
- Outlook/Hotmail
- Yahoo
- Custom SMTP servers

## Gmail Setup Instructions

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to Google Account → Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (custom name)"
4. Enter "Sweets by Bella Backend" as the name
5. Copy the generated 16-character password

### Step 3: Add to Vercel
1. Go to your Vercel backend project
2. Go to Settings → Environment Variables
3. Add:
   - `EMAIL_USER`: your Gmail address
   - `EMAIL_PASSWORD`: the 16-character app password

## Email Templates

The system sends three types of emails:

### 1. Order Confirmation
- Sent when customer places an order
- Includes payment instructions and 5-minute deadline
- Subject: "Order Confirmation - ORDER-1234567890"

### 2. Payment Received
- Sent when admin marks order as paid
- Confirms payment and next steps
- Subject: "Payment Received - ORDER-1234567890"

### 3. Order Expired
- Sent when order expires after 5 minutes
- Notifies customer of cancellation
- Subject: "Order Expired - ORDER-1234567890"

## Testing

To test email functionality:

1. Place a test order
2. Check your email for the confirmation
3. Mark the order as paid in admin dashboard
4. Check for the payment received email

## Troubleshooting

### Emails not sending
- Check Vercel logs for email errors
- Verify environment variables are set correctly
- Ensure Gmail app password is correct
- Check if 2FA is enabled on Gmail account

### Emails going to spam
- Add your email domain to SPF records
- Consider using a dedicated email service like SendGrid or Mailgun for production

## Production Recommendations

For production use, consider:
- Using a dedicated email service (SendGrid, Mailgun, AWS SES)
- Setting up proper SPF/DKIM records
- Using a custom domain for emails
- Adding email templates management

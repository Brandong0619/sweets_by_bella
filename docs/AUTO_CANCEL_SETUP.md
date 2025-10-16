# Auto-Cancel System Setup

This guide explains how the auto-cancel system works for expired orders in the Zelle/Cash App payment system.

## How It Works

The auto-cancel system runs every minute to:
1. **Check for expired orders** - Orders where `expires_at` is in the past and `payment_status` is 'pending'
2. **Cancel expired orders** - Update status to 'expired' and 'cancelled'
3. **Send expiration emails** - Notify customers their order has expired

## Vercel Cron Job Configuration

The system uses Vercel's built-in cron job functionality:

### Files Created:
- `backend/vercel.json` - Cron job configuration
- `backend/api/cron/cancel-expired-orders.js` - Cron job handler

### Schedule:
- **Frequency**: Every minute (`*/1 * * * *`)
- **Timeout**: 30 seconds maximum
- **Method**: GET request to `/api/cron/cancel-expired-orders`

## Manual Testing

You can test the auto-cancel system manually by calling the endpoint:

```bash
curl https://your-backend-url.vercel.app/api/cron/cancel-expired-orders
```

## Monitoring

### Vercel Logs
Check Vercel function logs to see:
- When cron jobs run
- How many orders were cancelled
- Email sending results

### Expected Log Output:
```
🕐 Running expired orders check...
🔄 Found 2 expired orders, cancelling...
✅ Cancelled 2 expired orders
📧 Expiration email sent to customer@example.com
📧 Sent 2 expiration emails
```

## Troubleshooting

### Cron Job Not Running
1. Check Vercel deployment logs
2. Verify `vercel.json` is in the backend root
3. Ensure the cron job file is in `backend/api/cron/`

### Orders Not Being Cancelled
1. Check database `expires_at` timestamps
2. Verify `payment_status` is 'pending'
3. Check Supabase connection and permissions

### Emails Not Sending
1. Verify email environment variables are set
2. Check email service configuration
3. Review email sending logs

## Alternative Solutions

If Vercel cron jobs don't work, you can use:

### External Cron Service
- **cron-job.org** - Free external cron service
- **EasyCron** - Reliable cron service
- **SetCronJob** - Simple cron service

### Manual Endpoint
The existing `/cancel-expired-orders` endpoint can be called manually or by external services.

## Production Considerations

1. **Monitoring**: Set up alerts for failed cron jobs
2. **Logging**: Monitor cancellation rates and email delivery
3. **Backup**: Keep the manual endpoint as backup
4. **Testing**: Regularly test the system with expired orders

## Environment Variables Required

Make sure these are set in Vercel:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

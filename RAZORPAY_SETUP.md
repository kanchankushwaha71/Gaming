# Razorpay Integration Setup Guide

## Prerequisites

1. **Razorpay Account**: Sign up at [https://razorpay.com](https://razorpay.com)
2. **Get API Keys**: After account verification, get your test/live API keys

## Environment Variables Setup

Create or update your `.env.local` file with the following variables:

```bash
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/epicesports?retryWrites=true&w=majority

# JWT Secret for Authentication
JWT_SECRET=your-secret-jwt-key-here

# NextAuth Secret
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Server Environment
NODE_ENV=development

# API Keys for third-party services
# DISCORD_CLIENT_ID=
# DISCORD_CLIENT_SECRET=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

## How to Get Razorpay Keys

1. **Login to Razorpay Dashboard**: Go to [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)

2. **Navigate to API Keys**: 
   - Click on "Settings" in the left sidebar
   - Select "API Keys"

3. **Generate Keys**:
   - For testing: Use "Test Mode" keys (starts with `rzp_test_`)
   - For production: Use "Live Mode" keys (starts with `rzp_live_`)

4. **Key Types**:
   - **Key ID**: Public key (safe to expose in frontend)
   - **Key Secret**: Private key (keep secret, server-side only)

## Features Implemented

### Tournament Registration Payments
- ✅ Secure payment order creation
- ✅ Payment verification with signature validation
- ✅ Automatic registration confirmation after payment
- ✅ Support for free tournaments (no payment required)
- ✅ Payment status tracking in database

### Event Registration Payments
- ✅ Ticket-based payment system
- ✅ Standard and VIP ticket support
- ✅ Event ticket generation after payment
- ✅ Payment verification and confirmation

### Payment Methods Supported
- ✅ UPI (PhonePe, Google Pay, Paytm, etc.)
- ✅ Credit/Debit Cards
- ✅ Net Banking
- ✅ Digital Wallets
- ✅ EMI (for eligible amounts)

## Payment Flow

### Tournament Registration
1. User fills registration form
2. System creates registration record
3. If fee > 0, Razorpay payment gateway opens
4. User completes payment
5. Payment verification happens automatically
6. Registration status updated to "paid"
7. Confirmation email sent (if configured)

### Event Registration  
1. User fills event registration form
2. If ticket price > 0, Razorpay payment gateway opens
3. User completes payment
4. Payment verification happens automatically
5. Event ticket generated with unique ticket number
6. Registration confirmed

## API Endpoints

### Tournament Payments
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment and update registration

### Event Payments
- `POST /api/payment/events/create-order` - Create event payment order
- `POST /api/payment/events/verify` - Verify event payment and create ticket

## Security Features

- ✅ Payment signature verification
- ✅ Server-side payment validation
- ✅ Secure API key handling
- ✅ User authentication required
- ✅ Input validation and sanitization
- ✅ Error handling and logging

## Testing

### Test Mode
- Use test API keys (starting with `rzp_test_`)
- No real money transactions
- All payment methods work in test mode
- Use test card numbers provided by Razorpay

### Test Card Numbers (Razorpay Test Mode)
```
Success: 4111 1111 1111 1111
Failure: 4111 1111 1111 1112
CVV: Any 3 digits
Expiry: Any future date
```

## Production Deployment

1. **Get Live Keys**: Activate your account and get live API keys
2. **Update Environment**: Replace test keys with live keys
3. **Test Thoroughly**: Test all payment scenarios in staging
4. **Go Live**: Deploy with live keys

## Webhook Setup (Optional but Recommended)

For production, set up webhooks to handle payment status updates:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Implement webhook handler for additional security

## Support

- **Razorpay Docs**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Integration Guide**: [https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- **Test Cards**: [https://razorpay.com/docs/payments/payments/test-card-upi-details/](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

## Troubleshooting

### Common Issues
1. **Payment not working**: Check API keys and ensure they're correct
2. **Signature verification failed**: Ensure key secret is correct
3. **Order creation failed**: Check amount format (should be in paise)
4. **Script not loading**: Check internet connection and firewall settings

### Logs to Check
- Browser console for frontend errors
- Server logs for API errors
- Razorpay dashboard for payment status 
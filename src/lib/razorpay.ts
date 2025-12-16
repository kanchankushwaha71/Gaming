import Razorpay from 'razorpay';

// Check if Razorpay credentials are available
const hasRazorpayCredentials = !!(
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_SECRET
);

// Razorpay instance configuration
export const razorpay = hasRazorpayCredentials ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
}) : null;

// Payment order creation
export interface CreateOrderParams {
  amount: number; // Amount in paise (INR)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  try {
    // If Razorpay is not configured, return a mock order for development
    if (!hasRazorpayCredentials || !razorpay) {
      console.warn('Razorpay credentials not found. Using mock payment for development.');
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: params.amount, // Amount already in paise
        currency: params.currency || 'INR',
        receipt: params.receipt || `receipt_${Date.now()}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
        notes: params.notes || {},
      };
      
      return {
        success: true,
        order: mockOrder,
        isMock: true,
      };
    }

    console.log('Creating Razorpay order with params:', {
      amount: params.amount,
      currency: params.currency || 'INR',
      receipt: params.receipt || `receipt_${Date.now()}`,
      notes: params.notes || {},
    });

    const order = await razorpay.orders.create({
      amount: params.amount, // Amount already in paise
      currency: params.currency || 'INR',
      receipt: params.receipt || `receipt_${Date.now()}`,
      notes: params.notes || {},
    });

    console.log('Razorpay order created:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
    
    return {
      success: true,
      order,
      isMock: false,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for common Razorpay errors
      if (errorMessage.includes('Invalid key')) {
        errorMessage = 'Invalid Razorpay API credentials. Please check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.';
      } else if (errorMessage.includes('Network')) {
        errorMessage = 'Network error connecting to Razorpay. Please check your internet connection.';
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Verify payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    if (!hasRazorpayCredentials) {
      console.warn('Razorpay credentials not found. Cannot verify payment signature.');
      return false;
    }

    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
}

// Payment verification with Razorpay API
export async function verifyPayment(paymentId: string) {
  try {
    if (!hasRazorpayCredentials || !razorpay) {
      console.warn('Razorpay credentials not found. Cannot verify payment.');
      return {
        success: false,
        error: 'Razorpay not configured',
      };
    }

    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Refund payment
export async function refundPayment(
  paymentId: string,
  amount?: number, // Amount in paise, full refund if not specified
  notes?: Record<string, string>
) {
  try {
    if (!hasRazorpayCredentials || !razorpay) {
      console.warn('Razorpay credentials not found. Cannot process refund.');
      return {
        success: false,
        error: 'Razorpay not configured',
      };
    }

    const refund = await razorpay.payments.refund(paymentId, {
      amount,
      notes: notes || {},
    });
    
    return {
      success: true,
      refund,
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper function to format amount for display
export function formatAmount(amountInPaise: number): string {
  return (amountInPaise / 100).toFixed(2);
}

// Helper function to get payment status description
export function getPaymentStatusDescription(status: string): string {
  const statusMap: Record<string, string> = {
    created: 'Payment initiated',
    authorized: 'Payment authorized',
    captured: 'Payment completed',
    refunded: 'Payment refunded',
    failed: 'Payment failed',
  };
  
  return statusMap[status] || status;
} 
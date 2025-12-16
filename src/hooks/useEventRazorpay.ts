import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface UseEventRazorpayParams {
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useEventRazorpay = ({ onSuccess, onError, onDismiss }: UseEventRazorpayParams = {}) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Razorpay script
  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setIsScriptLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setIsScriptLoaded(true);
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Create payment order
  const createOrder = useCallback(async (orderData: {
    amount: number;
    eventId: string;
    ticketType: string;
    attendeeName: string;
    currency?: string;
  }) => {
    try {
      const response = await axios.post('/api/payment/events/create-order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating event order:', error);
      throw error;
    }
  }, []);

  // Verify payment
  const verifyPayment = useCallback(async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    eventId: string;
    registrationData: {
      name: string;
      email: string;
      phone: string;
      ticketType: string;
    };
  }) => {
    try {
      const response = await axios.post('/api/payment/events/verify', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying event payment:', error);
      throw error;
    }
  }, []);

  // Make payment
  const makeEventPayment = useCallback(async (paymentParams: {
    amount: number;
    eventId: string;
    ticketType: string;
    registrationData: {
      name: string;
      email: string;
      phone: string;
      ticketType: string;
    };
    description?: string;
    currency?: string;
  }) => {
    if (!session?.user) {
      onError?.('Please login to make payment');
      return;
    }

    // If a Razorpay Payment Page URL is configured, redirect directly
    const paymentPageUrl = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL;
    if (typeof window !== 'undefined' && paymentPageUrl) {
      window.location.href = paymentPageUrl;
      return;
    }

    setIsLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create order
      const orderResponse = await createOrder({
        amount: paymentParams.amount,
        eventId: paymentParams.eventId,
        ticketType: paymentParams.ticketType,
        attendeeName: paymentParams.registrationData.name,
        currency: paymentParams.currency || 'INR',
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: orderResponse.key_id,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'EpicEsports India',
        description: paymentParams.description || `Event Registration - ${paymentParams.ticketType} Ticket`,
        image: '/images/logo.png', // Add your logo path
        order_id: orderResponse.order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: paymentParams.eventId,
              registrationData: paymentParams.registrationData,
            });

            if (verificationResult.success) {
              onSuccess?.(verificationResult);
            } else {
              onError?.(verificationResult.error || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            onError?.('Payment verification failed');
          }
        },
        prefill: {
          name: paymentParams.registrationData.name,
          email: paymentParams.registrationData.email,
          contact: paymentParams.registrationData.phone,
        },
        notes: {
          eventId: paymentParams.eventId,
          ticketType: paymentParams.ticketType,
          attendeeName: paymentParams.registrationData.name,
          userId: session.user.id || session.user.email || '',
        },
        theme: {
          color: '#F97316', // Orange color matching your theme
        },
        modal: {
          ondismiss: () => {
            onDismiss?.();
            setIsLoading(false);
          },
        },
      };

      // Create and open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  }, [session, loadRazorpayScript, createOrder, verifyPayment, onSuccess, onError, onDismiss]);

  return {
    makeEventPayment,
    isLoading,
    isScriptLoaded,
  };
}; 
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

interface UseRazorpayParams {
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = ({ onSuccess, onError, onDismiss }: UseRazorpayParams = {}) => {
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
    tournamentId: string;
    teamName: string;
    currency?: string;
  }) => {
    try {
      const response = await axios.post('/api/payment/create-order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, []);

  // Verify payment
  const verifyPayment = useCallback(async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    registrationId: string;
  }) => {
    try {
      const response = await axios.post('/api/payment/verify', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }, []);

  // Make payment
  const makePayment = useCallback(async (paymentParams: {
    amount: number;
    tournamentId: string;
    teamName: string;
    registrationId: string;
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
        tournamentId: paymentParams.tournamentId,
        teamName: paymentParams.teamName,
        currency: paymentParams.currency || 'INR',
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      // Handle fallback payment (when Razorpay API is down)
      if (orderResponse.fallback) {
        console.log('Using fallback payment mode:', orderResponse.message);
        
        // Show success message for fallback payment
        const fallbackResult = {
          success: true,
          fallback: true,
          message: orderResponse.message,
          orderId: orderResponse.order.id,
          registrationId: paymentParams.registrationId,
          paymentStatus: 'pending_manual_verification'
        };
        
        onSuccess?.(fallbackResult);
        return;
      }

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: orderResponse.key_id,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'EpicEsports India',
        description: paymentParams.description || `Tournament Registration - ${paymentParams.teamName}`,
        image: '/images/logo.png', // Add your logo path
        order_id: orderResponse.order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registrationId: paymentParams.registrationId,
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
          name: session.user.name || '',
          email: session.user.email || '',
          contact: '', // Add phone if available in session
        },
        notes: {
          tournamentId: paymentParams.tournamentId,
          teamName: paymentParams.teamName,
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
    makePayment,
    isLoading,
    isScriptLoaded,
  };
}; 
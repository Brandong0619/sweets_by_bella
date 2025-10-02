import { loadStripe } from '@stripe/stripe-js';

// Get the publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

// Initialize Stripe only if we have a real key
export const stripePromise = stripePublishableKey !== 'pk_test_placeholder' 
  ? loadStripe(stripePublishableKey)
  : null;

// Helper function to create checkout session
export const createCheckoutSession = async (cartItems: any[], deliveryInfo?: any) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cartItems,
        deliveryInfo,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

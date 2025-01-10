'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Chrome } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
); // Use your Stripe publishable key

export function SubscriptionButton() {
	const { user } = useUser();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubscription = async () => {
		setIsLoading(true);

		try {
			// Call your API route to create a checkout session
			const response = await fetch('/api/create-checkout-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			const { sessionId } = await response.json();

			// Initialize Stripe.js
			const stripe = await stripePromise;

			// Redirect to Stripe Checkout
			await stripe?.redirectToCheckout({ sessionId });
		} catch (error) {
			console.error('Error:', error);
			setIsLoading(false);
		}
	};

	if (user?.publicMetadata.hasActiveSubscription) {
		return (
			<a
				href='https://chromewebstore.google.com/detail/neuronlens/mokpofnkijnfobifbngdibakcmldhjmp'
				className='bg-gray-800/50 hover:bg-gray-800/60 font-bold text-white py-4 px-10 rounded-full backdrop-blur-2xl mt-6 flex items-center gap-2'
			>
				<Chrome size={20} />
				Use the extension
			</a>
		);
	}

	return (
		<button
			onClick={handleSubscription}
			disabled={isLoading}
			className='bg-gray-800/50 hover:bg-gray-800/60 font-bold text-white py-4 px-10 rounded-full backdrop-blur-2xl mt-6 flex items-center gap-2'
		>
			<Chrome size={20} />
			{isLoading ? 'Processing...' : 'Get the free trial'}
		</button>
	);
}

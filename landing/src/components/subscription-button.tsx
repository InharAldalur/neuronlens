'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Chrome, ArrowUpCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
); // Use your Stripe publishable key

interface UsageData {
	withinLimit: boolean;
	used: number;
	limit: number;
	remaining: number;
}

export function SubscriptionButton() {
	const { user, isSignedIn } = useUser();
	const [isLoading, setIsLoading] = useState(false);
	const [usageData, setUsageData] = useState<UsageData | null>(null);

	useEffect(() => {
		const fetchUsageData = async () => {
			if (!isSignedIn || !user) return;

			try {
				const response = await fetch('/api/validate-user', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: user.id }),
				});

				const data = await response.json();
				if (data.freeUsage) {
					setUsageData(data.freeUsage);
				}
			} catch (error) {
				console.error('Error fetching usage data:', error);
			}
		};

		fetchUsageData();
	}, [user, isSignedIn]);

	const handleSubscription = async () => {
		setIsLoading(true);

		try {
			const response = await fetch('/api/create-checkout-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			const { sessionId } = await response.json();
			const stripe = await stripePromise;

			if (stripe) {
				await stripe.redirectToCheckout({ sessionId });
			} else {
				console.error('Stripe not initialized');
				setIsLoading(false);
			}
		} catch (error) {
			console.error('Error:', error);
			setIsLoading(false);
		}
	};

	if (user?.publicMetadata.hasActiveSubscription) {
		return (
			<div className='flex flex-col sm:flex-row gap-3'>
				<a
					href='https://chromewebstore.google.com/detail/neuronlens/mokpofnkijnfobifbngdibakcmldhjmp'
					className='bg-gray-800/50 hover:bg-gray-800/60 font-bold text-white py-4 px-10 rounded-full backdrop-blur-2xl flex items-center gap-2'
				>
					<Chrome size={20} />
					Use the extension
				</a>
				<button
					onClick={handleSubscription}
					disabled={isLoading}
					className='bg-gray-800/50 hover:bg-gray-800/60 font-bold text-white py-4 px-10 rounded-full backdrop-blur-2xl flex items-center gap-2'
				>
					<ArrowUpCircle size={20} />
					{isLoading ? 'Processing...' : 'Upgrade'}
				</button>
			</div>
		);
	}

	return (
		<div className='flex flex-col items-center mt-6 gap-2'>
			{usageData && (
				<p className='text-sm text-white/80'>
					{usageData.remaining > 0
						? `${usageData.remaining} of ${usageData.limit} free videos remaining this month`
						: "You've used all your free videos this month"}
				</p>
			)}
			<div className='flex flex-col sm:flex-row gap-3'>
				<a
					href='https://chromewebstore.google.com/detail/neuronlens/mokpofnkijnfobifbngdibakcmldhjmp'
					className='bg-gray-800/50 hover:bg-gray-800/60 font-bold text-white py-4 px-10 rounded-full backdrop-blur-2xl flex items-center gap-2'
				>
					<Chrome size={20} />
					Get the extension
				</a>
				<button
					onClick={handleSubscription}
					disabled={isLoading}
					className='bg-gray-800/50 hover:bg-gray-800/60 font-bold text-white py-4 px-10 rounded-full backdrop-blur-2xl flex items-center gap-2'
				>
					<ArrowUpCircle size={20} />
					{isLoading ? 'Processing...' : 'Subscribe now'}
				</button>
			</div>
		</div>
	);
}

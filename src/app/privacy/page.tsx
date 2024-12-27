import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description: 'Privacy policy and data handling practices for our service',
};

export default function PrivacyPolicy() {
	return (
		<div className='container mx-auto px-4 py-8 max-w-3xl'>
			<h1 className='text-4xl font-bold mb-8'>Privacy Policy</h1>

			<div className='prose prose-gray dark:prose-invert max-w-none'>
				<section className='mb-8'>
					<h2 className='text-2xl font-semibold mb-4'>
						1. Information We Collect
					</h2>
					<p className='mb-4'>
						We collect information that you provide directly to us when you:
					</p>
					<ul className='list-disc pl-6 mb-4'>
						<li>Create an account</li>
						<li>Subscribe to our service</li>
						<li>Contact our support team</li>
						<li>Make payments through our platform</li>
					</ul>
				</section>

				<section className='mb-8'>
					<h2 className='text-2xl font-semibold mb-4'>
						2. Payment Information
					</h2>
					<p className='mb-4'>
						All payment processing is handled by Stripe. We do not store your
						payment information on our servers. Your payment data is processed
						securely through Stripe's infrastructure.
					</p>
				</section>

				<section className='mb-8'>
					<h2 className='text-2xl font-semibold mb-4'>
						3. How We Use Your Information
					</h2>
					<p className='mb-4'>We use the collected information to:</p>
					<ul className='list-disc pl-6 mb-4'>
						<li>Provide and maintain our service</li>
						<li>Process your payments and subscriptions</li>
						<li>Send you important updates about our service</li>
						<li>Respond to your requests and support needs</li>
					</ul>
				</section>

				<section className='mb-8'>
					<h2 className='text-2xl font-semibold mb-4'>
						4. Data Storage and Security
					</h2>
					<p className='mb-4'>
						We use industry-standard security measures to protect your personal
						information. Your data is stored securely using modern encryption
						standards.
					</p>
				</section>

				<section className='mb-8'>
					<h2 className='text-2xl font-semibold mb-4'>
						5. Third-Party Services
					</h2>
					<p className='mb-4'>We use the following third-party services:</p>
					<ul className='list-disc pl-6 mb-4'>
						<li>Clerk for authentication</li>
						<li>Stripe for payment processing</li>
					</ul>
				</section>

				<section className='mb-8'>
					<h2 className='text-2xl font-semibold mb-4'>6. Contact Us</h2>
					<p className='mb-4'>
						If you have any questions about this Privacy Policy, please contact
						us at: [Your Contact Information]
					</p>
				</section>

				<footer className='text-sm text-gray-500 mt-8'>
					Last updated: {new Date().toLocaleDateString()}
				</footer>
			</div>
		</div>
	);
}

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import ExtensionAuthBridge from '../components/ExtensionAuthBridge';

const poppins = Poppins({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-poppins',
});

export const metadata: Metadata = {
	title: 'neuronlens',
	description: 'Watch youtube smarter',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang='en' className={`${poppins.variable}`}>
				<body className='font-poppins'>
					{children}
					<ExtensionAuthBridge />
				</body>
			</html>
		</ClerkProvider>
	);
}

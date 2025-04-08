'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

// Add Chrome type declaration
declare global {
	interface Window {
		chrome?: {
			runtime?: {
				sendMessage?: (
					extensionId: string,
					message: Record<string, unknown>,
					callback?: (response: Record<string, unknown> | undefined) => void
				) => void;
				lastError?: {
					message: string;
				};
			};
		};
	}
}

// --- Configuration ---
// Replace with your actual Extension ID from chrome://extensions
const EXTENSION_ID = 'pdfaolfkfkpmeekagkgaflhlkmohipmi'; // YOUR_EXTENSION_ID_HERE
// ---------------------

export function ExtensionAuthBridge() {
	console.log('ExtensionAuthBridge: Component rendering...');
	const { userId, isLoaded } = useAuth();

	useEffect(() => {
		// Skip if Clerk is not loaded yet
		if (!isLoaded) {
			return;
		}

		console.log(`ExtensionAuthBridge: userId changed to: ${userId}`);

		// Safe check for browser environment
		if (typeof window === 'undefined') {
			return;
		}

		// Safe check for Chrome extension API
		if (!window.chrome?.runtime?.sendMessage) {
			console.log('ExtensionAuthBridge: Chrome runtime not available');
			return;
		}

		const message = {
			type: 'USER_AUTH',
			data: userId ? { userId } : null, // Send userId if logged in, null otherwise
		};

		try {
			window.chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
				if (window.chrome?.runtime?.lastError) {
					console.error(
						'ExtensionAuthBridge: Error sending message to extension:',
						window.chrome.runtime.lastError.message
					);
				} else {
					console.log(
						'ExtensionAuthBridge: Message sent to extension successfully.',
						response
					);
				}
			});
		} catch (error) {
			console.error('ExtensionAuthBridge: Exception sending message:', error);
		}
	}, [userId, isLoaded]);

	// This component doesn't render anything visible
	return null;
}

// Add a default export
export default ExtensionAuthBridge;

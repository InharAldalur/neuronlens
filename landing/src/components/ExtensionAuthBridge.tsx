'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

// --- Configuration ---
// Replace with your actual Extension ID from chrome://extensions
const EXTENSION_ID = 'pdfaolfkfkpmeekagkgaflhlkmohipmi'; // YOUR_EXTENSION_ID_HERE
// ---------------------

export function ExtensionAuthBridge() {
	// Add a log here to see if the component renders at all
	console.log('ExtensionAuthBridge: Component rendering...');
	const { userId, isLoaded } = useAuth();

	useEffect(() => {
		// Ensure Clerk is loaded and we have a definitive userId (or null)
		if (!isLoaded) {
			return;
		}

		console.log(`ExtensionAuthBridge: userId changed to: ${userId}`);

		// Check if the Chrome runtime and sendMessage are available
		if (
			typeof chrome !== 'undefined' &&
			chrome.runtime &&
			chrome.runtime.sendMessage
		) {
			const message = {
				type: 'USER_AUTH',
				data: userId ? { userId } : null, // Send userId if logged in, null otherwise
			};

			try {
				chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
					if (chrome.runtime.lastError) {
						console.error(
							'ExtensionAuthBridge: Error sending message to extension:',
							chrome.runtime.lastError.message
						);
						// Optional: Handle specific errors, e.g., if extension is not installed
						// or the ID is incorrect.
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
		} else {
			// Optional: Log if running outside an environment with chrome extension APIs
			// console.log('ExtensionAuthBridge: Chrome runtime not available. Not sending message.');
		}
	}, [userId, isLoaded]); // Re-run effect when userId or isLoaded changes

	// This component doesn't render anything visible
	return null;
}

// Add a default export
export default ExtensionAuthBridge;

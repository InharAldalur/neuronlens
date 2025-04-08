// This file adds TypeScript declarations for the Chrome Extension API
// It is simplified for our specific use case

interface Chrome {
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
}

interface Window {
	chrome?: Chrome;
}

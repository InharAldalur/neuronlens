# NeuronLens Credits System

This document explains how the NeuronLens credits system works and how to set it up.

## Overview

The credits system provides each user with 5 free credits per month. These credits are used when accessing premium features like YouTube video analysis. When users create an account, they start with 5 credits for the current month, which reset at the beginning of each new month.

## Components

1. **User Credits Initialization**

   - When a user is created in Clerk, they are automatically assigned 5 credits for the current month
   - This happens via the webhook handler at `/api/webhook/clerk/route.ts`

2. **Credit Usage Tracking**

   - Credits are decremented when a user uses premium features
   - Implemented in `/api/track-video-usage/route.ts`

3. **Credit Validation**

   - Before a user can use a premium feature, we check if they have available credits
   - Implemented in `/api/validate-user/route.ts`

4. **Monthly Credit Reset**
   - At the beginning of each month, all users' credits are reset to 5
   - Implemented via a cron job at `/api/cron/reset-credits/route.ts`

## Setup Instructions

### 1. Clerk Webhook Setup

1. Go to your [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Navigate to Webhooks
3. Create a new webhook endpoint with URL: `https://your-domain.com/api/webhook/clerk`
4. Select the `user.created` event
5. Copy the webhook signing secret and add it to your environment variables:
   ```
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   ```

### 2. Setup Cron Job for Monthly Credit Reset

Setup a cron job to hit the credit reset endpoint at the beginning of each month:

**Using GitHub Actions:**

Create a file at `.github/workflows/reset-credits.yml`:

```yaml
name: Reset Monthly Credits

on:
  schedule:
    # Run at midnight on the 1st of each month
    - cron: '0 0 1 * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  reset-credits:
    runs-on: ubuntu-latest
    steps:
      - name: Reset Credits
        run: |
          curl -X GET https://your-domain.com/api/cron/reset-credits \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Using Vercel Cron Jobs (if deployed on Vercel):**

```json
{
	"crons": [
		{
			"path": "/api/cron/reset-credits",
			"schedule": "0 0 1 * *"
		}
	]
}
```

**Using an external service like Uptime Robot or Cronitor:**

Configure them to hit your reset endpoint on the 1st of each month.

### 3. Manual Credit Reset

You can manually reset all users' credits using the provided script:

```bash
npx ts-node -r dotenv/config src/scripts/reset-all-credits.ts
```

### 4. Testing

To test the credit system:

1. Create a new user account
2. Verify the user has 5 credits in their metadata
3. Use a premium feature and verify the credit count decreases
4. Test the monthly reset by manually triggering the cron job

## Environment Variables

Make sure these environment variables are properly set in your .env file:

```
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
CRON_SECRET=your_secure_cron_secret
```

## Troubleshooting

If users are not seeing their credits:

1. Check the Clerk webhook logs to ensure the `user.created` event is being received
2. Verify the webhook secret is correctly set
3. Run the manual credit reset script to ensure all users have credits

declare module 'svix' {
  export interface WebhookHeaders {
    'svix-id': string | null;
    'svix-timestamp': string | null;
    'svix-signature': string | null;
    [key: string]: string | null;
  }

  export class Webhook {
    constructor(secret: string);
    verify(payload: string, headers: WebhookHeaders): unknown;
  }
}

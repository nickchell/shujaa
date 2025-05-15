import { Clerk as ClerkType } from '@clerk/backend';

declare global {
  interface Window {
    Clerk: {
      session?: {
        getToken: (options: { template: string }) => Promise<string | null>;
      };
    };
  }
}

export {};

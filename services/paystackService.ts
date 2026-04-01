import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseFunctions';

export interface PaystackInitPayload {
  orderId: string;
  amount: number;
  email: string;
  callbackUrl?: string;
}

export interface PaystackInitResponse {
  authorizationUrl: string;
  reference: string;
}

export async function initPaystackTransaction(payload: PaystackInitPayload): Promise<PaystackInitResponse> {
  const init = httpsCallable(functions, 'initPaystackTransaction');
  const result = await init(payload);
  const data = result.data as Partial<PaystackInitResponse>;

  if (!data.authorizationUrl || !data.reference) {
    throw new Error('Failed to initialize Paystack transaction.');
  }

  return {
    authorizationUrl: data.authorizationUrl,
    reference: data.reference,
  };
}

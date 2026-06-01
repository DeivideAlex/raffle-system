import { Purchase } from '@/app/types';

const SUPABASE_URL = "https://ggafunjazgsxxjkbmiwv.supabase.co";
export const FN_URL = import.meta.env.DEV ? 'https://raffle-system-chi.vercel.app/api' : '/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Erro na requisição');
  }
  return res.json();
};

export const api = {
  createPayment: async (data: {
    raffleId: string;
    raffleName: string;
    numbers: number[];
    phone: string;
    email: string;
    totalAmount: number;
    purchaseId?: string;
  }) => {
    const res = await fetch(`${FN_URL}/create-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  savePurchase: async (data: any) => {
    const res = await fetch(`${FN_URL}/save-purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getMyPurchases: async (phone: string): Promise<Purchase[]> => {
    const res = await fetch(`${FN_URL}/my-purchases?phone=${encodeURIComponent(phone)}`);
    return handleResponse(res);
  },

  getRaffles: async () => {
    const res = await fetch(`${FN_URL}/get-raffles`);
    return handleResponse(res);
  },

  getRaffle: async (id: string) => {
    const res = await fetch(`${FN_URL}/get-raffle?id=${id}`);
    return handleResponse(res);
  },

  saveRaffle: async (data: any) => {
    const res = await fetch(`${FN_URL}/save-raffle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getTickets: async (raffleId: string) => {
    const res = await fetch(`${FN_URL}/get-tickets?raffleId=${raffleId}`);
    return handleResponse(res);
  },

  updateTickets: async (raffleId: string, tickets: any[]) => {
    const res = await fetch(`${FN_URL}/update-tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raffleId, tickets })
    });
    return handleResponse(res);
  },

  createCardPayment: async (data: {
    cardToken: string;
    paymentMethodId: string;
    installments: number;
    totalAmount: number;
    email: string;
    docType: string;
    docNumber: string;
    purchaseId: string;
    raffleName: string;
    numbers: number[];
  }) => {
    const res = await fetch(`${FN_URL}/create-card-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getWinners: async () => {
    const res = await fetch(`${FN_URL}/get-winners`);
    return handleResponse(res);
  },

  saveWinners: async (winners: any[]) => {
    const res = await fetch(`${FN_URL}/save-winners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(winners)
    });
    return handleResponse(res);
  }
};

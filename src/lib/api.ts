import { Purchase } from '@/app/types';

// O Vercel lida com /api/ nativamente
const FN_URL = '/api';

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
    totalAmount: number;
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
  }
};

export type NumberStatus = 'free' | 'reserved' | 'paid';

export interface RaffleNumber {
  number: number;
  status: NumberStatus;
  owner?: string; // Phone number
  email?: string;
  reservedAt?: string;
}

export interface RaffleData {
  id?: string;
  prizeName: string;
  prizeValue: string;
  prizeDescription: string;
  ticketPrice: string;
  totalNumbers: string;
  prizeImage: string;
  endDate: string;
  createdAt: string;
  winnerNumber?: number;
}

export interface Winner {
  id: string;
  raffleId: string;
  raffleName: string;
  prizeValue: string;
  winnerNumber: number;
  winnerName: string; // Phone number
  date: string;
  prizeImage: string;
}

export interface Purchase {
  id: string;
  raffleId: string;
  numbers: number[];
  phone: string;
  email: string;
  totalAmount: number;
  status: 'pending' | 'paid';
  purchaseDate: string;
}

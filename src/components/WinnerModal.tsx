import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { RaffleData, RaffleNumber } from '../app/types';
import { toast } from 'sonner';
import { api } from '@/lib/api';


interface WinnerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  raffle: RaffleData;
  onWinnerSelected: () => void;
}

export function WinnerModal({ isOpen, onOpenChange, raffle, onWinnerSelected }: WinnerModalProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const handleConfirm = async () => {
    if (selectedNumber === null) return;
    
    try {
      // Check if number was paid in DB
      const numbers: RaffleNumber[] = await api.getTickets(raffle.id!);
      
      const target = numbers.find(n => n.number === selectedNumber);
      
      if (!target || target.status !== 'paid') {
        toast.error('Apenas números pagos podem ser sorteados!');
        return;
      }

      // Update raffle in DB
      const updatedRaffle = { ...raffle, winnerNumber: selectedNumber };
      await api.saveRaffle(updatedRaffle);

      // Add to winners history in DB
      // Note: This is an additive list. For production, a dedicated table or atomic update is better.
      // For now we'll fetch existing and append.
      let winners = [];
      try {
        const res = await fetch(`${api.FN_URL}/get-winners`); // I will create this API
        winners = await res.json();
      } catch (e) {
        winners = [];
      }

      const newWinner = {
        id: `${raffle.id}-${Date.now()}`,
        raffleId: raffle.id,
        raffleName: raffle.prizeName,
        prizeValue: raffle.prizeValue,
        winnerNumber: selectedNumber,
        winnerName: target.owner || 'Sem nome', // Usually phone number
        date: new Date().toISOString(),
        prizeImage: raffle.prizeImage
      };
      
      winners.push(newWinner);
      
      // I'll create api/save-winners.ts
      await fetch(`${api.FN_URL}/save-winners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(winners)
      });

      toast.success('Ganhador registrado com sucesso!');
      onWinnerSelected();
      onOpenChange(false);
    } catch (e: any) {
      toast.error('Erro ao salvar vencedor: ' + e.message);
    }
  };

  const totalNumbersArr = Array.from({ length: parseInt(raffle.totalNumbers) || 0 }).map((_, i) => i);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-yellow-100 w-12 h-12 flex items-center justify-center rounded-full mb-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center text-xl">Informar Resultado</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o número vencedor:</label>
          <select 
            className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white"
            value={selectedNumber ?? ''}
            onChange={(e) => setSelectedNumber(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">-- Escolha um número --</option>
            {totalNumbersArr.map(n => (
              <option key={n} value={n}>{String(n).padStart(2, '0')}</option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" disabled={selectedNumber === null} onClick={handleConfirm}>
            Salvar Resultado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

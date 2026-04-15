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
      let winners = [];
      try {
        winners = await api.getWinners();
        if (!Array.isArray(winners)) winners = [];
      } catch (e) {
        winners = [];
      }

      const newWinner = {
        raffleId: raffle.id,
        raffleName: raffle.prizeName,
        prizeValue: raffle.prizeValue,
        winnerNumber: selectedNumber,
        winnerName: target.owner || 'Sem nome',
        date: new Date().toISOString(),
        prizeImage: raffle.prizeImage
      };
      
      winners.push(newWinner);
      await api.saveWinners(winners);

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
      <DialogContent className="sm:max-w-md bg-[#111d3a] border border-[#2a3a5c]">
        <DialogHeader>
          <div className="mx-auto bg-[#ffd700]/15 w-12 h-12 flex items-center justify-center rounded-full mb-2 border border-[#ffd700]/30">
            <Trophy className="w-6 h-6 text-[#ffd700]" />
          </div>
          <DialogTitle className="text-center text-xl text-white">Informar Resultado</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <label className="block text-sm font-medium text-[#8899bb] mb-2">Selecione o número vencedor:</label>
          <select 
            className="w-full h-10 px-3 border border-[#2a3a5c] rounded-md bg-[#0a1128] text-white"
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3a5c] text-[#8899bb] hover:text-white hover:bg-[#1a2744]">Cancelar</Button>
          <Button className="bg-gradient-to-r from-[#ffd700] to-[#f5a623] hover:from-[#f5a623] hover:to-[#e8941a] text-[#0a1128] font-bold" disabled={selectedNumber === null} onClick={handleConfirm}>
            Salvar Resultado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

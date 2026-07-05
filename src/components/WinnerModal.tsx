import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, X } from 'lucide-react';
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
  const [inputValue, setInputValue] = useState('');
  const [winnerNumbers, setWinnerNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const totalNumbers = parseInt(raffle.totalNumbers) || 0;

  const addNumber = () => {
    const raw = inputValue.trim();
    if (!raw) return;

    const num = parseInt(raw, 10);

    if (isNaN(num)) {
      toast.error('Digite um número válido.');
      return;
    }
    if (num < 0 || num >= totalNumbers) {
      toast.error(`O número deve estar entre 00 e ${String(totalNumbers - 1).padStart(2, '0')}.`);
      return;
    }
    if (winnerNumbers.includes(num)) {
      toast.warning('Esse número já foi adicionado.');
      setInputValue('');
      return;
    }

    setWinnerNumbers(prev => [...prev, num]);
    setInputValue('');
  };

  const removeNumber = (num: number) => {
    setWinnerNumbers(prev => prev.filter(n => n !== num));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addNumber();
    }
  };

  const handleConfirm = async () => {
    if (winnerNumbers.length === 0) return;
    setLoading(true);

    try {
      const numbers: RaffleNumber[] = await api.getTickets(raffle.id!);

      for (const selectedNumber of winnerNumbers) {
        const target = numbers.find(n => n.number === selectedNumber);

        if (!target || target.status !== 'paid') {
          toast.error(`Número ${String(selectedNumber).padStart(2, '0')} não foi pago e não pode ser sorteado!`);
          setLoading(false);
          return;
        }
      }

      // Usa o primeiro número como vencedor principal (ou múltiplos se o sistema suportar)
      const primaryWinner = winnerNumbers[0];
      const updatedRaffle = { ...raffle, winnerNumber: primaryWinner };
      await api.saveRaffle(updatedRaffle);

      const target = numbers.find(n => n.number === primaryWinner)!;
      const newWinner = {
        raffleId: raffle.id,
        raffleName: raffle.prizeName,
        prizeValue: raffle.prizeValue,
        winnerNumber: primaryWinner,
        winnerNumbers: winnerNumbers,
        winnerName: target.owner || 'Sem nome',
        date: new Date().toISOString(),
        prizeImage: raffle.prizeImage
      };

      await api.saveWinners([newWinner]);

      toast.success('Ganhador(es) registrado(s) com sucesso!');
      onWinnerSelected();
      onOpenChange(false);
      setWinnerNumbers([]);
      setInputValue('');
    } catch (e: any) {
      toast.error('Erro ao salvar vencedor: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) { setWinnerNumbers([]); setInputValue(''); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md bg-[#111d3a] border border-[#2a3a5c]">
        <DialogHeader>
          <div className="mx-auto bg-[#ffd700]/15 w-12 h-12 flex items-center justify-center rounded-full mb-2 border border-[#ffd700]/30">
            <Trophy className="w-6 h-6 text-[#ffd700]" />
          </div>
          <DialogTitle className="text-center text-xl text-white">Informar Resultado</DialogTitle>
          <p className="text-center text-xs text-[#8899bb]">Você pode informar uma ou mais dezenas ganhadoras.</p>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-3">
          {/* Campo de digitação */}
          <div>
            <label className="block text-sm font-medium text-[#8899bb] mb-2">
              Digite o(s) número(s) vencedor(es):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                max={totalNumbers - 1}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ex: 07`}
                className="flex-1 h-10 px-3 border border-[#2a3a5c] rounded-md bg-[#0a1128] text-white placeholder-[#5a6a8a] outline-none focus:border-[#f5a623] transition-colors font-mono text-sm"
              />
              <Button
                type="button"
                onClick={addNumber}
                className="bg-[#f5a623] hover:bg-[#e8941a] text-[#0a1128] font-bold px-4"
              >
                Adicionar
              </Button>
            </div>
            <p className="text-xs text-[#5a6a8a] mt-1">
              Pressione Enter ou clique em Adicionar para incluir cada número.
            </p>
          </div>

          {/* Números adicionados */}
          {winnerNumbers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#8899bb] mb-2">Números selecionados:</p>
              <div className="flex flex-wrap gap-2">
                {winnerNumbers.map(n => (
                  <div
                    key={n}
                    className="flex items-center gap-1.5 bg-[#ffd700]/15 border border-[#ffd700]/40 text-[#ffd700] px-3 py-1.5 rounded-lg text-sm font-bold"
                  >
                    <Trophy className="w-3 h-3" />
                    {String(n).padStart(2, '0')}
                    <button
                      onClick={() => removeNumber(n)}
                      className="ml-1 text-[#ffd700]/60 hover:text-red-400 transition-colors"
                      title="Remover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { setWinnerNumbers([]); setInputValue(''); onOpenChange(false); }}
            className="border-[#2a3a5c] text-[#8899bb] hover:text-white hover:bg-[#1a2744]"
          >
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-[#ffd700] to-[#f5a623] hover:from-[#f5a623] hover:to-[#e8941a] text-[#0a1128] font-bold"
            disabled={winnerNumbers.length === 0 || loading}
            onClick={handleConfirm}
          >
            {loading ? 'Salvando...' : `Salvar Resultado${winnerNumbers.length > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

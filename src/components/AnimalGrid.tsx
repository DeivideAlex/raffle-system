import { RaffleNumber } from '../app/types';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { ANIMALS } from '@/utils/animals';

interface AnimalGridProps {
  numbers: RaffleNumber[];
  selectedNumbers: number[];
  onSelectAnimal: (numbers: number[]) => void;
  winnerNumber?: number;
}

export function AnimalGrid({ numbers, selectedNumbers, onSelectAnimal, winnerNumber }: AnimalGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
      {ANIMALS.map((animal) => {
        // Obter o status do grupo (se algum já foi reservado ou pago)
        const groupTickets = numbers.filter(n => animal.numbers.includes(n.number));
        const isReserved = groupTickets.some(t => t.status === 'reserved');
        const isPaid = groupTickets.some(t => t.status === 'paid');
        const isFree = !isReserved && !isPaid;
        
        const isSelected = selectedNumbers.includes(animal.numbers[0]);
        const hasWinner = winnerNumber !== undefined && animal.numbers.includes(winnerNumber);

        let statusColor = "bg-green-500";
        if (isPaid) statusColor = "bg-blue-500";
        else if (isReserved) statusColor = "bg-yellow-500";

        return (
          <motion.div
            key={animal.id}
            whileHover={isFree ? { scale: 1.02, translateY: -4 } : {}}
            whileTap={isFree ? { scale: 0.98 } : {}}
            onClick={() => isFree && onSelectAnimal(animal.numbers)}
            className={cn(
              "relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer p-4 group shadow-sm",
              isFree ? "bg-white border-slate-100 hover:border-purple-300 hover:shadow-lg" : "bg-slate-50 border-slate-200 cursor-not-allowed",
              isSelected && isFree && "border-purple-600 ring-2 ring-purple-100 shadow-xl scale-[1.02]",
              hasWinner && "border-yellow-400 bg-yellow-50 ring-4 ring-yellow-200 animate-pulse"
            )}
          >
            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start mb-3">
              <span className="text-2xl font-black text-slate-800 tracking-tighter">
                {String(animal.id).padStart(2, '0')}
              </span>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase",
                statusColor
              )}>
                {isPaid ? "Pago" : isReserved ? "Reservado" : "Livre"}
              </div>
            </div>

            {/* Nome do Animal */}
            <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-purple-700 transition-colors">
              {animal.name.toUpperCase()}
            </h3>

            {/* Dezenas */}
            <div className="flex gap-2">
              {animal.numbers.map((n) => {
                const isNWinner = winnerNumber === n;
                return (
                  <span 
                    key={n} 
                    className={cn(
                      "flex-1 text-center py-1 rounded-lg text-sm font-mono font-bold",
                      isNWinner ? "bg-yellow-400 text-yellow-900" : "bg-slate-100 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600"
                    )}
                  >
                    {String(n).padStart(2, '0')}
                  </span>
                )
              })}
            </div>

            {/* Marcador de Seleção */}
            {isSelected && isFree && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="L5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

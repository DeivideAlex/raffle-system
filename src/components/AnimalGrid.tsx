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

        let statusColor = "bg-[#00c853]";
        if (isPaid) statusColor = "bg-[#1e88e5]";
        else if (isReserved) statusColor = "bg-[#f5a623]";

        return (
          <motion.div
            key={animal.id}
            whileHover={isFree ? { scale: 1.02, translateY: -4 } : {}}
            whileTap={isFree ? { scale: 0.98 } : {}}
            onClick={() => isFree && onSelectAnimal(animal.numbers)}
            className={cn(
              "relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer p-4 group shadow-sm",
              isFree ? "bg-[#111d3a] border-[#2a3a5c] hover:border-[#f5a623]/50 hover:shadow-lg hover:shadow-[#f5a623]/10" : "bg-[#0a1128] border-[#2a3a5c] cursor-not-allowed",
              isSelected && isFree && "border-[#f5a623] ring-2 ring-[#f5a623]/20 shadow-xl shadow-[#f5a623]/10 scale-[1.02]",
              hasWinner && "border-[#ffd700] bg-[#ffd700]/10 ring-4 ring-[#ffd700]/30 animate-pulse"
            )}
          >
            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start mb-3">
              <span className="text-2xl font-black text-white tracking-tighter">
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
            <h3 className="text-lg font-bold text-[#8899bb] mb-2 group-hover:text-[#f5a623] transition-colors">
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
                      isNWinner ? "bg-[#ffd700] text-[#0a1128]" : "bg-[#0a1128] text-[#8899bb] group-hover:bg-[#f5a623]/10 group-hover:text-[#f5a623]"
                    )}
                  >
                    {String(n).padStart(2, '0')}
                  </span>
                )
              })}
            </div>

            {/* Marcador de Seleção */}
            {isSelected && isFree && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-[#f5a623] rounded-full flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-[#0a1128]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

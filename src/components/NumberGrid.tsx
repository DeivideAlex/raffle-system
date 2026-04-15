import { RaffleNumber } from '../app/types';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface NumberGridProps {
  numbers: RaffleNumber[];
  selectedNumbers: number[];
  onSelectNumber: (num: number) => void;
  winnerNumber?: number;
}

export function NumberGrid({ numbers, selectedNumbers, onSelectNumber, winnerNumber }: NumberGridProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 mt-6">
      {numbers.map((item) => {
        const isSelected = selectedNumbers.includes(item.number);
        const isWinner = winnerNumber === item.number;
        
        let bgColor = 'bg-[#00c853] hover:bg-[#00e676] text-white cursor-pointer'; // Free
        
        if (item.status === 'reserved') {
          bgColor = 'bg-[#f5a623] text-[#0a1128] cursor-not-allowed opacity-80';
        } else if (item.status === 'paid') {
          bgColor = 'bg-[#1e88e5] text-white cursor-not-allowed opacity-80';
        }

        if (isWinner) {
          bgColor = 'bg-[#ffd700] text-[#0a1128] border-4 border-[#f5a623] animate-pulse font-bold scale-110 z-10';
        }

        if (item.status === 'free' && isSelected) {
          bgColor = 'bg-[#f5a623] border-2 border-[#ffd700] text-[#0a1128] scale-105 shadow-md shadow-[#f5a623]/30 z-10';
        }

        return (
          <motion.button
            whileTap={item.status === 'free' ? { scale: 0.9 } : undefined}
            key={item.number}
            onClick={() => {
              if (item.status === 'free' && !isWinner) {
                onSelectNumber(item.number);
              }
            }}
            disabled={item.status !== 'free' || isWinner}
            className={cn(
              'h-12 w-full rounded-md font-semibold text-sm transition-all duration-200 flex items-center justify-center',
              bgColor
            )}
            title={
              isWinner ? "Ganhador!" :
              item.status === 'free' ? 'Livre' : 
              item.status === 'reserved' ? 'Reservado' : 'Pago'
            }
          >
            {String(item.number).padStart(2, '0')}
          </motion.button>
        )
      })}
    </div>
  )
}

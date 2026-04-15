import { ShoppingCart, X } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingCartProps {
  selectedNumbers: number[];
  ticketPrice: number;
  onCheckout: () => void;
  onClose: () => void;
}

export function FloatingCart({ selectedNumbers, ticketPrice, onCheckout, onClose }: FloatingCartProps) {
  const selectedCount = selectedNumbers.length;
  const totalAmount = selectedCount * ticketPrice;

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 lg:right-12 z-50 w-[95%] max-w-[340px]"
        >
          <div className="bg-[#111d3a] rounded-2xl shadow-[0_10px_40px_-10px_rgba(245,166,35,0.3)] overflow-hidden border border-[#2a3a5c] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#f5a623] to-[#e8941a] p-4 pl-5 pr-4 flex items-center justify-between text-[#0a1128]">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-[22px] h-[22px]" />
                <span className="font-bold text-lg tracking-wide">Números Escolhidos</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-[#0a1128]/80" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#8899bb] font-medium text-[15px]">Quantidade:</span>
                <span className="text-[#f5a623] font-bold text-[15px]">{selectedCount} {selectedCount === 1 ? 'número' : 'números'}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 max-h-[140px] overflow-y-auto pr-1">
                {selectedNumbers.sort((a,b)=>a-b).map(num => (
                  <div key={num} className="bg-[#f5a623]/15 border border-[#f5a623]/30 text-[#f5a623] font-extrabold w-[3.25rem] h-10 rounded-[10px] flex items-center justify-center text-lg shadow-sm">
                    {String(num).padStart(2, '0')}
                  </div>
                ))}
              </div>

              <div className="h-px bg-[#2a3a5c] w-full mb-4"></div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-[#8899bb] font-medium text-[15px]">Valor unitário:</span>
                <span className="font-bold text-white text-[15px]">R$ {ticketPrice.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-[22px] font-black text-white leading-none">Total:</span>
                <span className="text-[24px] font-black text-[#00c853] leading-none tracking-tight">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>

              <Button 
                size="lg" 
                className="w-full rounded-xl bg-gradient-to-r from-[#f5a623] to-[#e8941a] hover:from-[#e8941a] hover:to-[#d4810f] border-none shadow-md hover:shadow-lg hover:shadow-[#f5a623]/20 transition-all font-bold text-lg h-14 text-[#0a1128]"
                onClick={onCheckout}
              >
                Participar da Rifa
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

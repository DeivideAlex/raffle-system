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
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] overflow-hidden border border-purple-100 flex flex-col">
            {/* Header */}
            <div className="bg-[#cc00cc] bg-gradient-to-r from-[rgb(147,51,234)] to-[#cc00cc] p-4 pl-5 pr-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-[22px] h-[22px]" />
                <span className="font-bold text-lg tracking-wide">Números Escolhidos</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/90" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-medium text-[15px]">Quantidade:</span>
                <span className="text-[#a855f7] font-bold text-[15px]">{selectedCount} {selectedCount === 1 ? 'número' : 'números'}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 max-h-[140px] overflow-y-auto pr-1">
                {selectedNumbers.sort((a,b)=>a-b).map(num => (
                  <div key={num} className="bg-[#f5eaff] border border-[#e8ccff] text-[#9333ea] font-extrabold w-[3.25rem] h-10 rounded-[10px] flex items-center justify-center text-lg shadow-sm">
                    {String(num).padStart(2, '0')}
                  </div>
                ))}
              </div>

              <div className="h-px bg-slate-100 w-full mb-4"></div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-500 font-medium text-[15px]">Valor unitário:</span>
                <span className="font-bold text-slate-800 text-[15px]">R$ {ticketPrice.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-[22px] font-black text-slate-900 leading-none">Total:</span>
                <span className="text-[24px] font-black text-[#00b341] leading-none tracking-tight">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>

              <Button 
                size="lg" 
                className="w-full rounded-xl bg-[#cc00cc] hover:bg-[#b300b3] bg-gradient-to-r from-[rgb(147,51,234)] to-[#cc00cc] border-none shadow-md hover:shadow-lg transition-all font-bold text-lg h-14"
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

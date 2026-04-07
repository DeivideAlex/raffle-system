import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingCartProps {
  selectedCount: number;
  totalAmount: number;
  onCheckout: () => void;
}

export function FloatingCart({ selectedCount, totalAmount, onCheckout }: FloatingCartProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 lg:right-12 z-50 w-[90%] md:w-auto"
        >
          <div className="bg-white rounded-full shadow-2xl p-2 pl-6 pr-2 flex items-center justify-between border-2 border-purple-500/20 backdrop-blur-sm shadow-purple-500/10">
            <div className="flex items-center gap-4 mr-6">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-purple-700" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {selectedCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium leading-none">Total</span>
                <span className="text-lg font-bold text-slate-800 leading-none mt-1">
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            <Button 
              size="lg" 
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 border-none hover:shadow-lg hover:shadow-purple-500/30 transition-all px-8 font-bold"
              onClick={onCheckout}
            >
              Comprar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

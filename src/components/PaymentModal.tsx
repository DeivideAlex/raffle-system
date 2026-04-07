import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, MapPin, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  numbers: number[];
  onPaid: () => void;
  initPoint?: string;
}

export function PaymentModal({ isOpen, onOpenChange, totalAmount, numbers, onPaid, initPoint }: PaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(15 * 60);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onOpenChange(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onOpenChange]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const handleCopyCode = () => {
    navigator.clipboard.writeText('00020126360014BR.GOV.BCB.PIX...');
    toast.success('Código PIX copiado!');
  };

  const handleMercadoPago = () => {
    if (initPoint) {
      window.open(initPoint, '_blank');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-max border-0 shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-black text-slate-800 text-center">
            Pague via PIX
          </DialogTitle>
          <DialogDescription className="text-center">
            Garanta seus {numbers.length} números por R$ {totalAmount.toFixed(2).replace('.', ',')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 p-2 md:p-6 items-center">
          <div className="flex-1 flex flex-col items-center">
            <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center border-4 border-dashed border-slate-300">
              <QrCode className="w-24 h-24 text-slate-400 opacity-50" />
            </div>
            
            <p className="mt-4 font-mono text-xl font-bold text-red-500 animate-pulse bg-red-50 px-4 py-1 rounded-full">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Tempo restante</p>
          </div>

          <div className="flex-1 min-w-[300px] flex flex-col gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
               <p className="text-sm font-semibold text-slate-700 mb-2">Código Copia e Cola:</p>
               <div className="flex relative">
                 <input 
                  type="text" 
                  readOnly 
                  value="00020126360014BR.GOV.BCB.PIX..." 
                  className="w-full pr-12 pl-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-500 font-mono outline-none"
                 />
                 <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7 text-purple-600 hover:text-purple-700 hover:bg-purple-100" onClick={handleCopyCode}>
                   <Copy className="h-4 w-4" />
                 </Button>
               </div>
            </div>

            {initPoint && (
              <Button 
                variant="outline" 
                className="w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                onClick={handleMercadoPago}
              >
                Abrir Checkout Seguro (Mercado Pago)
              </Button>
            )}

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800 flex items-start gap-2">
                <MapPin className="h-5 w-5 shrink-0" />
                Após realizar o pagamento, clique no botão abaixo para confirmar.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 sm:mt-0">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 h-12 text-lg font-bold"
            onClick={onPaid}
          >
            Já Paguei
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

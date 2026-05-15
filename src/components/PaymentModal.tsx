import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, MapPin, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pixCode: string;
  paymentId?: string;
  initPoint?: string;
  totalAmount: number;
  ticketCount: number;
  numbers: number[];
  raffleId: string;
  onPaid: () => void;
}

export function PaymentModal({ 
  isOpen, 
  onOpenChange, 
  pixCode = '00020126360014BR.GOV.BCB.PIX...', 
  paymentId,
  initPoint, 
  totalAmount, 
  ticketCount, 
  numbers,
  raffleId,
  onPaid 
}: PaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(10 * 60);
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

  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isApproved && isOpen && raffleId) {
      interval = setInterval(async () => {
        try {
          // 1. Tenta verificar pelo ID do PIX (se existir)
          if (paymentId) {
            const response = await fetch(`https://raffle-system-chi.vercel.app/api/check-payment?id=${paymentId}`);
            const data = await response.json();
            if (data.status === 'approved') {
              setIsApproved(true);
              toast.success('PAGAMENTO APROVADO! Seus números foram confirmados.');
              onPaid();
              clearInterval(interval);
              return;
            }
          }
          
          // 2. Se pagou pelo Checkout Pro, verifica no Banco de Dados se o Webhook já aprovou
          const ticketsResponse = await fetch(`https://raffle-system-chi.vercel.app/api/get-tickets?raffleId=${raffleId}&t=${Date.now()}`);
          if (ticketsResponse.ok) {
            const tickets = await ticketsResponse.json();
            // Verifica se todos os números escolhidos estão com status 'paid'
            const allPaid = numbers.every(num => {
              const ticket = tickets.find((t: any) => t.number === num);
              return ticket && ticket.status === 'paid';
            });
            
            if (allPaid && numbers.length > 0) {
              setIsApproved(true);
              toast.success('PAGAMENTO APROVADO! Seus números foram confirmados.');
              onPaid();
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Erro ao verificar pagamento:', error);
        }
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [paymentId, isApproved, isOpen, raffleId, numbers]);

  const handleCopyCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      toast.success('Código copiado!');
    }
  };

  if (isApproved) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px] overflow-hidden bg-[#111d3a] border border-[#2a3a5c]">
          <div className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-[#00c853]/20 rounded-full flex items-center justify-center text-[#00c853] animate-bounce border border-[#00c853]/30">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">PAGAMENTO APROVADO!</h2>
            <p className="text-[#8899bb] max-w-[280px]">Seus números já foram registrados. Boa sorte no sorteio!</p>
            <Button className="mt-4 bg-[#00c853] hover:bg-[#00b848] font-bold px-8 h-12 rounded-xl text-white" onClick={() => onOpenChange(false)}>
              Ver Meus Números
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] overflow-hidden bg-[#111d3a] border border-[#2a3a5c] shadow-2xl">
        <DialogHeader className="p-2 md:p-6 pb-0">
          <DialogTitle className="text-2xl md:text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Pague via PIX</DialogTitle>
          <p className="text-[#8899bb] font-medium">Garanta seus {numbers.length} números por <span className="text-[#f5a623] font-bold">R$ {totalAmount.toFixed(2).replace('.', ',')}</span></p>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 p-2 md:p-6 items-center">
          <div className="flex-1 flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl shadow-inner min-h-[234px] min-w-[234px] flex items-center justify-center">
              {pixCode ? (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`} 
                  alt="PIX QR Code"
                  className="w-[200px] h-[200px]"
                />
              ) : (
                <div className="w-[200px] h-[200px] bg-slate-100 animate-pulse rounded-lg" />
              )}
            </div>
            
            <p className="mt-4 font-mono text-xl font-bold text-[#f5a623] animate-pulse bg-[#f5a623]/10 px-4 py-1 rounded-full border border-[#f5a623]/30">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </p>
            <p className="text-xs text-[#8899bb] mt-1">Tempo restante</p>
          </div>

          <div className="flex-1 min-w-[300px] flex flex-col gap-4">
            <div className="bg-[#0a1128] border border-[#2a3a5c] rounded-xl p-4">
               <p className="text-sm font-semibold text-[#8899bb] mb-2">Código Copia e Cola:</p>
               <div className="flex relative">
                 <input 
                  type="text" 
                  readOnly 
                  value={pixCode || 'Gerando código...'} 
                  className="w-full pr-12 pl-3 py-2 bg-[#111d3a] border border-[#2a3a5c] rounded-lg text-sm text-[#8899bb] font-mono outline-none"
                 />
                 <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7 text-[#f5a623] hover:text-[#ffd700] hover:bg-[#f5a623]/10" onClick={handleCopyCode} disabled={!pixCode}>
                   <Copy className="h-4 w-4" />
                 </Button>
               </div>
            </div>

            <Button className="w-full bg-[#1e88e5] hover:bg-[#1976d2] text-white font-bold h-12 rounded-xl group transition-all" onClick={() => window.open(initPoint || '#', '_blank')}>
              Abrir Checkout Seguro (Mercado Pago)
              <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex items-start gap-3 bg-[#00c853]/10 border border-[#00c853]/20 rounded-xl p-4">
              <div className="bg-[#00c853]/20 p-2 rounded-lg text-[#00c853] mt-1">
                <MapPin className="h-4 w-4" />
              </div>
              <p className="text-[13px] text-[#00c853] leading-relaxed font-medium">
                Sua reserva será confirmada <span className="font-bold underline">automaticamente</span> assim que você realizar o pagamento. Não é necessário enviar comprovante.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

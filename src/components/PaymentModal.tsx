import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BASE_URL = 'https://raffle-system-chi.vercel.app';

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pixCode?: string;
  paymentId?: string;
  initPoint?: string;
  totalAmount: number;
  ticketCount: number;
  numbers: number[];
  raffleId: string;
  purchaseId?: string;
  raffleName?: string;
  email?: string;
  onPaid: () => void;
}

export function PaymentModal({
  isOpen, onOpenChange, pixCode = '', paymentId,
  totalAmount, numbers, purchaseId, onPaid
}: PaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isApproved, setIsApproved] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (!isOpen) { setTimeLeft(10 * 60); return; }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); onOpenChange(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onOpenChange]);

  const handleApproval = () => {
    if (isApproved) return;
    setIsApproved(true);
    toast.success('🎉 PAGAMENTO APROVADO! Seus números foram confirmados.');
    onPaid();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Polling automático (PIX / webhook)
  useEffect(() => {
    if (!isOpen || isApproved) return;
    const check = async () => {
      try {
        if (purchaseId) {
          const res = await fetch(`${BASE_URL}/api/confirm-payment?purchaseId=${encodeURIComponent(purchaseId)}&t=${Date.now()}`);
          if (res.ok) { const d = await res.json(); if (d.status === 'approved') { handleApproval(); return; } }
        }
        if (paymentId) {
          const res = await fetch(`${BASE_URL}/api/check-payment?id=${paymentId}&t=${Date.now()}`);
          if (res.ok) { const d = await res.json(); if (d.status === 'approved') { handleApproval(); return; } }
        }
      } catch { /* ignore */ }
    };
    check();
    intervalRef.current = setInterval(check, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOpen, isApproved, purchaseId, paymentId]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (isApproved) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px] bg-[#111d3a] border border-[#2a3a5c]">
          <div className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-[#00c853]/20 rounded-full flex items-center justify-center text-[#00c853] animate-bounce border border-[#00c853]/30">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">PAGAMENTO APROVADO!</h2>
            <p className="text-[#8899bb]">Seus números já foram registrados. Boa sorte!</p>
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
      <DialogContent className="sm:max-w-[600px] bg-[#111d3a] border border-[#2a3a5c] shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-2xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Smartphone className="w-6 h-6 text-[#00c853]" /> Pagamento via PIX
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-[#8899bb]">
              {numbers.length} número(s) · <span className="text-[#f5a623] font-bold">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
            </p>
            <span className="font-mono text-sm text-[#f5a623] bg-[#f5a623]/10 px-2 py-0.5 rounded-full border border-[#f5a623]/30 animate-pulse">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
        </DialogHeader>

        {/* Números selecionados */}
        {numbers.length > 0 && (
          <div className="px-4 pt-2">
            <p className="text-xs font-semibold text-[#8899bb] mb-2">Números selecionados:</p>
            <div className="flex flex-wrap gap-1.5">
              {numbers.map(n => (
                <span
                  key={n}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#00c853]/15 border border-[#00c853]/40 text-[#00c853] text-xs font-bold"
                >
                  {String(n).padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PIX Content */}
        <div className="flex flex-col md:flex-row gap-6 p-4 items-start">
          {/* QR Code */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-2xl shadow-inner">
              {pixCode ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`}
                  alt="PIX QR Code"
                  className="w-[200px] h-[200px]"
                />
              ) : (
                <div className="w-[200px] h-[200px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-sm text-center p-4">
                  Gerando QR Code...
                </div>
              )}
            </div>
            <p className="text-xs text-[#8899bb] text-center">Escaneie com o app do seu banco</p>
          </div>

          {/* Info lateral */}
          <div className="flex-1 flex flex-col gap-3 min-w-[220px]">
            {/* Copia e Cola */}
            {pixCode && (
              <div className="bg-[#0a1128] border border-[#2a3a5c] rounded-xl p-3">
                <p className="text-xs font-semibold text-[#8899bb] mb-1">Código Copia e Cola:</p>
                <div className="flex relative">
                  <input
                    readOnly
                    value={pixCode}
                    className="w-full pr-10 pl-2 py-1.5 bg-[#111d3a] border border-[#2a3a5c] rounded-lg text-xs text-[#8899bb] font-mono outline-none"
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(pixCode); toast.success('Código copiado!'); }}
                    className="absolute right-1 top-1 h-6 w-6 text-[#f5a623] hover:text-[#ffd700] transition-colors"
                    title="Copiar código PIX"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Botão Copiar destacado */}
            {pixCode && (
              <button
                onClick={() => { navigator.clipboard.writeText(pixCode); toast.success('Código PIX copiado!'); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-[#00c853] hover:bg-[#00b848] text-white transition-all shadow-lg shadow-[#00c853]/20 active:scale-95"
              >
                <Copy className="w-4 h-4" /> Copiar Código PIX
              </button>
            )}

            {/* Mensagem de confirmação automática */}
            <div className="bg-[#00c853]/10 border border-[#00c853]/25 rounded-xl p-3">
              <p className="text-xs text-[#00c853] leading-relaxed">
                ✅ Sua reserva será confirmada <strong>automaticamente</strong> após o pagamento. Aguarde — estamos monitorando em tempo real.
              </p>
            </div>

            {/* Instruções rápidas */}
            <div className="bg-[#0a1128] border border-[#2a3a5c] rounded-xl p-3">
              <p className="text-xs font-semibold text-[#8899bb] mb-2">Como pagar:</p>
              <ol className="text-xs text-[#8899bb] space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escolha pagar via PIX</li>
                <li>Escaneie o QR Code ou cole o código</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

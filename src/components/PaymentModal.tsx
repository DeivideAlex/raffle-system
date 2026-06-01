import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, CheckCircle, Loader2, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

declare global {
  interface Window { MercadoPago: any; }
}

const BASE_URL = 'https://raffle-system-chi.vercel.app';
const MP_PUBLIC_KEY = 'TEST-6002262f-3fe7-475d-a8e8-a5e6a1725a69';

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

type Tab = 'pix' | 'card';

export function PaymentModal({
  isOpen, onOpenChange, pixCode = '', paymentId, initPoint,
  totalAmount, numbers, raffleId, purchaseId, raffleName = 'Rifa', email = '', onPaid
}: PaymentModalProps) {
  const [tab, setTab] = useState<Tab>('pix');
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isApproved, setIsApproved] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [docNumber, setDocNumber] = useState('12345678909');
  const [installments, setInstallments] = useState(1);
  const [cardLoading, setCardLoading] = useState(false);

  // MP SDK loaded
  const [mpReady, setMpReady] = useState(false);
  const mpRef = useRef<any>(null);

  // Load MP SDK
  useEffect(() => {
    if (window.MercadoPago) { setMpReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      mpRef.current = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
      setMpReady(true);
    };
    document.head.appendChild(script);
  }, []);

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

  // Polling (PIX / webhook)
  useEffect(() => {
    if (!isOpen || isApproved || tab === 'card') return;
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
  }, [isOpen, isApproved, purchaseId, paymentId, tab]);

  const handleManualVerify = async () => {
    setIsVerifying(true);
    try {
      if (purchaseId) {
        const res = await fetch(`${BASE_URL}/api/confirm-payment?purchaseId=${encodeURIComponent(purchaseId)}&t=${Date.now()}`);
        if (res.ok) { const d = await res.json(); if (d.status === 'approved') { handleApproval(); return; } }
      }
      toast.info('Pagamento ainda não confirmado. Aguarde.');
    } catch { toast.error('Erro ao verificar. Tente novamente.'); }
    finally { setIsVerifying(false); }
  };

  // Detect card brand from number
  const getCardBrand = (num: string) => {
    const n = num.replace(/\s/g, '');
    if (/^4/.test(n)) return 'visa';
    if (/^5[01345]/.test(n)) return 'master';
    if (/^3[47]/.test(n)) return 'amex';
    if (/^(636368|438935|504175|451416|509048|509067|509049|509069|509550|509322|509051|509016)/.test(n)) return 'elo';
    return '';
  };

  const formatCardNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpReady || !mpRef.current) { toast.error('SDK do Mercado Pago não carregado ainda.'); return; }
    if (!purchaseId) { toast.error('ID da compra não encontrado.'); return; }

    const [expMonth, expYear] = cardExpiry.split('/');
    const brand = getCardBrand(cardNumber);
    if (!brand) { toast.error('Número de cartão inválido ou bandeira não reconhecida.'); return; }

    setCardLoading(true);
    try {
      // Create card token via MP SDK
      const tokenData = await mpRef.current.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: cardName,
        cardExpirationMonth: expMonth,
        cardExpirationYear: expYear.length === 2 ? `20${expYear}` : expYear,
        securityCode: cardCvv,
        identificationType: 'CPF',
        identificationNumber: docNumber.replace(/\D/g, '')
      });

      if (!tokenData || !tokenData.id) {
        toast.error('Erro ao tokenizar cartão: ' + (tokenData?.cause?.[0]?.description || 'Tente novamente.'));
        return;
      }

      // Submit to our backend
      const result = await api.createCardPayment({
        cardToken: tokenData.id,
        paymentMethodId: brand,
        installments,
        totalAmount,
        email,
        docType: 'CPF',
        docNumber: docNumber.replace(/\D/g, ''),
        purchaseId,
        raffleName,
        numbers
      });

      if (result.status === 'approved') {
        handleApproval();
      } else if (result.status === 'pending' || result.status === 'in_process') {
        toast.info('Pagamento em análise. Acompanhe o status.');
        // poll for approval
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          if (attempts > 24 || isApproved) { clearInterval(poll); return; }
          try {
            const r = await fetch(`${BASE_URL}/api/confirm-payment?purchaseId=${encodeURIComponent(purchaseId)}&t=${Date.now()}`);
            if (r.ok) { const d = await r.json(); if (d.status === 'approved') { handleApproval(); clearInterval(poll); } }
          } catch { /* ignore */ }
        }, 5000);
      } else {
        const msgs: Record<string, string> = {
          cc_rejected_insufficient_amount: 'Saldo insuficiente.',
          cc_rejected_bad_filled_card_number: 'Número do cartão inválido.',
          cc_rejected_bad_filled_security_code: 'CVV inválido.',
          cc_rejected_bad_filled_date: 'Data de vencimento inválida.',
          cc_rejected_call_for_authorize: 'Autorize o pagamento com seu banco.',
        };
        const detail = result.status_detail || '';
        toast.error(msgs[detail] || `Pagamento recusado: ${detail || result.status}`);
      }
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || 'Tente novamente.'));
    } finally {
      setCardLoading(false);
    }
  };

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
      <DialogContent className="sm:max-w-[700px] bg-[#111d3a] border border-[#2a3a5c] shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Pagamento Seguro
          </DialogTitle>
          <p className="text-[#8899bb]">
            {numbers.length} número(s) · <span className="text-[#f5a623] font-bold">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
            <span className="ml-3 font-mono text-sm text-[#f5a623] bg-[#f5a623]/10 px-2 py-0.5 rounded-full border border-[#f5a623]/30 animate-pulse">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </p>
        </DialogHeader>

        {/* Tab selector */}
        <div className="flex gap-2 px-4 pt-2">
          <button
            onClick={() => setTab('pix')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'pix' ? 'bg-[#00c853] text-white shadow-lg shadow-[#00c853]/20' : 'bg-[#0a1128] text-[#8899bb] border border-[#2a3a5c] hover:border-[#00c853]/40'}`}
          >
            <Smartphone className="w-4 h-4" /> PIX
          </button>
          <button
            onClick={() => setTab('card')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'card' ? 'bg-[#1e88e5] text-white shadow-lg shadow-[#1e88e5]/20' : 'bg-[#0a1128] text-[#8899bb] border border-[#2a3a5c] hover:border-[#1e88e5]/40'}`}
          >
            <CreditCard className="w-4 h-4" /> Cartão de Crédito
          </button>
        </div>

        {/* PIX Tab */}
        {tab === 'pix' && (
          <div className="flex flex-col md:flex-row gap-6 p-4 items-start">
            <div className="flex-1 flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl shadow-inner">
                {pixCode ? (
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`} alt="PIX QR Code" className="w-[200px] h-[200px]" />
                ) : (
                  <div className="w-[200px] h-[200px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-sm text-center p-4">
                    Use o botão abaixo para abrir o Checkout do Mercado Pago
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-3 min-w-[260px]">
              {pixCode && (
                <div className="bg-[#0a1128] border border-[#2a3a5c] rounded-xl p-3">
                  <p className="text-xs font-semibold text-[#8899bb] mb-1">Código Copia e Cola:</p>
                  <div className="flex relative">
                    <input readOnly value={pixCode} className="w-full pr-10 pl-2 py-1.5 bg-[#111d3a] border border-[#2a3a5c] rounded-lg text-xs text-[#8899bb] font-mono outline-none" />
                    <button onClick={() => { navigator.clipboard.writeText(pixCode); toast.success('Código copiado!'); }} className="absolute right-1 top-1 h-6 w-6 text-[#f5a623] hover:text-[#ffd700]">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              {initPoint && (
                <Button className="w-full bg-[#1e88e5] hover:bg-[#1976d2] text-white font-bold h-11 rounded-xl" onClick={() => window.open(initPoint, '_blank')}>
                  Abrir Checkout Mercado Pago <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              )}
              <Button variant="outline" className="w-full border-[#2a3a5c] text-[#8899bb] hover:text-white hover:bg-[#1a2d52] h-10 rounded-xl text-sm" onClick={handleManualVerify} disabled={isVerifying}>
                {isVerifying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verificando...</> : 'Já paguei — Verificar agora'}
              </Button>
              <p className="text-xs text-[#00c853] bg-[#00c853]/10 border border-[#00c853]/20 rounded-xl p-3 leading-relaxed">
                ✅ Sua reserva será confirmada <strong>automaticamente</strong> após o pagamento.
              </p>
            </div>
          </div>
        )}

        {/* Card Tab */}
        {tab === 'card' && (
          <form onSubmit={handleCardPayment} className="p-4 flex flex-col gap-4">
            <p className="text-xs text-[#8899bb] bg-[#0a1128] border border-[#2a3a5c] rounded-xl p-3">
              🔒 Dados processados com segurança pelo <strong className="text-white">Mercado Pago</strong>. Não armazenamos seus dados de cartão.
            </p>

            {/* Card Number */}
            <div>
              <label className="text-xs font-semibold text-[#8899bb] mb-1 block">Número do Cartão</label>
              <div className="relative">
                <input
                  required
                  placeholder="5031 4332 1540 6351"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#0a1128] border border-[#2a3a5c] rounded-xl text-white text-sm font-mono outline-none focus:border-[#1e88e5] transition-colors pr-16"
                />
                {getCardBrand(cardNumber) && (
                  <span className="absolute right-3 top-2 text-xs font-bold text-[#f5a623] uppercase bg-[#f5a623]/10 px-2 py-1 rounded-lg">
                    {getCardBrand(cardNumber)}
                  </span>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-[#8899bb] mb-1 block">Nome no Cartão</label>
              <input
                required
                placeholder="APRO"
                value={cardName}
                onChange={e => setCardName(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 bg-[#0a1128] border border-[#2a3a5c] rounded-xl text-white text-sm font-mono outline-none focus:border-[#1e88e5] transition-colors"
              />
              <p className="text-xs text-[#f5a623] mt-1">💡 Teste: use <strong>APRO</strong> para aprovar, <strong>OTHE</strong> para rejeitar</p>
            </div>

            {/* Expiry + CVV */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-[#8899bb] mb-1 block">Validade (MM/AA)</label>
                <input
                  required
                  placeholder="11/25"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#0a1128] border border-[#2a3a5c] rounded-xl text-white text-sm font-mono outline-none focus:border-[#1e88e5] transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-[#8899bb] mb-1 block">CVV</label>
                <input
                  required
                  placeholder="123"
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-3 py-2.5 bg-[#0a1128] border border-[#2a3a5c] rounded-xl text-white text-sm font-mono outline-none focus:border-[#1e88e5] transition-colors"
                />
              </div>
            </div>

            {/* CPF */}
            <div>
              <label className="text-xs font-semibold text-[#8899bb] mb-1 block">CPF do titular</label>
              <input
                required
                placeholder="12345678909"
                value={docNumber}
                onChange={e => setDocNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="w-full px-3 py-2.5 bg-[#0a1128] border border-[#2a3a5c] rounded-xl text-white text-sm font-mono outline-none focus:border-[#1e88e5] transition-colors"
              />
            </div>

            {/* Cartões de teste info */}
            <details className="bg-[#0a1128] border border-[#2a3a5c] rounded-xl p-3">
              <summary className="text-xs text-[#8899bb] cursor-pointer font-semibold">📋 Cartões de teste disponíveis</summary>
              <div className="mt-2 space-y-1.5 text-xs text-[#8899bb]">
                <p><span className="text-white font-mono">5031 4332 1540 6351</span> — Mastercard (CVV: 123)</p>
                <p><span className="text-white font-mono">4235 6477 2802 5682</span> — Visa (CVV: 123)</p>
                <p><span className="text-white font-mono">3753 651535 56885</span> — Amex (CVV: 1234)</p>
                <p><span className="text-white font-mono">5067 7667 8388 8311</span> — Elo débito (CVV: 123)</p>
                <p className="pt-1 border-t border-[#2a3a5c]">Nome: <span className="text-[#00c853] font-bold">APRO</span> = aprovado · <span className="text-red-400 font-bold">OTHE</span> = recusado</p>
                <p>CPF: <span className="text-white font-mono">12345678909</span></p>
              </div>
            </details>

            <Button type="submit" disabled={cardLoading || !mpReady} className="w-full bg-[#1e88e5] hover:bg-[#1565c0] text-white font-bold h-12 rounded-xl text-base">
              {cardLoading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processando...</> : `Pagar R$ ${totalAmount.toFixed(2).replace('.', ',')}`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

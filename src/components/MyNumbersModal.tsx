
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ReceiptText, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { PaymentModal } from './PaymentModal';

interface MyNumbersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MyNumbersModal({ isOpen, onOpenChange }: MyNumbersModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  
  // Estados para o Modal de Pagamento que abrirá ao clicar em "Pagar"
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [pixCode, setPixCode] = useState('');
  const [initPoint, setInitPoint] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loadingPayment, setLoadingPayment] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return toast.error('Digite seu telefone ou e-mail');
    setLoading(true);
    try {
      const data = await api.getMyPurchases(searchTerm);
      setPurchases(data);
      if (data.length === 0) toast.info('Nenhuma reserva encontrada.');
    } catch (error) {
      toast.error('Erro ao buscar números.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (purchase: any) => {
    setLoadingPayment(true);
    try {
      const payment = await api.createPayment({
        raffleId: purchase.raffleId,
        raffleName: purchase.raffleName,
        numbers: purchase.numbers,
        totalAmount: purchase.totalAmount,
        phone: purchase.phone,
        email: purchase.email
      });

      setPixCode(payment.pix_code);
      setInitPoint(payment.init_point);
      setPaymentId(payment.paymentId);
      setSelectedPurchase(purchase);
      setShowPayment(true);
    } catch (error) {
      toast.error('Erro ao gerar novo pagamento.');
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px] bg-white border-0 shadow-2xl p-0 overflow-hidden">
          <div className="bg-white p-6 md:p-8 flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-800">
                Meus Números
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-500">
                Digite o <b>Telefone</b> ou <b>E-mail</b> usado na compra para consultar seus bilhetes.
              </p>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Seu telefone ou e-mail" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-slate-50 border-slate-200"
                />
                <Button onClick={handleSearch} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <div className="max-h-[350px] overflow-y-auto flex flex-col gap-3 mt-2 pr-1 custom-scrollbar">
                {purchases.map((p, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">PEDIDO #{p.id.slice(-6)}</span>
                        <span className="text-[10px] font-medium text-slate-400">{p.raffleName}</span>
                      </div>
                      {p.status === 'paid' ? (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> PAGO
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> RESERVADO
                          </span>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 px-3 text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700" 
                            onClick={() => handlePay(p)} 
                            disabled={loadingPayment}
                          >
                            PAGAR
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.numbers.map((n: number) => (
                        <span key={n} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm ${p.status === 'paid' ? 'bg-green-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                          {String(n).padStart(2, '0')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                
                {purchases.length === 0 && !loading && (
                  <div className="text-center py-8 text-slate-400">
                    <ReceiptText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-medium">Nenhum resultado para exibir</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPurchase && (
        <PaymentModal 
          isOpen={showPayment}
          onOpenChange={setShowPayment}
          pixCode={pixCode}
          paymentId={paymentId}
          initPoint={initPoint}
          totalAmount={selectedPurchase.totalAmount}
          ticketCount={selectedPurchase.numbers.length}
          numbers={selectedPurchase.numbers}
          onPaid={() => {
            setShowPayment(false);
            handleSearch(); // Atualiza a lista após pagar
          }}
        />
      )}
    </>
  );
}

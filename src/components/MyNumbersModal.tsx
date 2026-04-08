
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ReceiptText, Clock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface MyNumbersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MyNumbersModal({ isOpen, onOpenChange }: MyNumbersModalProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!phone) return toast.error('Digite seu telefone');
    setLoading(true);
    try {
      const data = await api.getMyPurchases(phone);
      setPurchases(data);
      if (data.length === 0) toast.info('Nenhuma reserva encontrada para este número.');
    } catch (error) {
      toast.error('Erro ao buscar números.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800">
            Meus Números
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <p className="text-sm text-slate-500">
            Digite o telefone usado na compra para consultar seus bilhetes.
          </p>
          
          <div className="flex gap-2">
            <Input 
              placeholder="(00) 00000-0000" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="max-h-[350px] overflow-y-auto flex flex-col gap-3 mt-2 pr-1">
            {purchases.map((p, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">PEDIDO #{p.purchaseDate ? new Date(p.purchaseDate).getTime().toString().slice(-6) : '---'}</span>
                  {p.status === 'paid' ? (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> PAGO
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> AGUARDANDO
                    </span>
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
                <p>Nenhum resultado para exibir</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

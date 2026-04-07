import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { TopBar } from '@/components/TopBar';
import { PrizeHeader } from '@/components/PrizeHeader';
import { StatusSummary } from '@/components/StatusSummary';
import { NumberGrid } from '@/components/NumberGrid';
import { FloatingCart } from '@/components/FloatingCart';
import { PhoneModal } from '@/components/PhoneModal';
import { PaymentModal } from '@/components/PaymentModal';
import { RaffleData, RaffleNumber } from '../types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function RafflePage() {
  const { raffleId } = useParams<{ raffleId: string }>();
  const navigate = useNavigate();
  
  const [raffle, setRaffle] = useState<RaffleData | null>(null);
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<{ phone: string, email: string } | null>(null);
  const [initPoint, setInitPoint] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);

  // Load raffle and numbers data
  useEffect(() => {
    if (!raffleId) return;

    try {
      const dataStr = localStorage.getItem(raffleId);
      if (!dataStr) {
        toast.error('Rifa não encontrada');
        navigate('/');
        return;
      }
      
      const raffleData: RaffleData = JSON.parse(dataStr);
      setRaffle(raffleData);

      const numbersKey = `${raffleId}-numbers`;
      const numbersStr = localStorage.getItem(numbersKey);
      
      if (numbersStr) {
        setNumbers(JSON.parse(numbersStr));
      } else {
        // Initialize numbers if not found
        const total = parseInt(raffleData.totalNumbers);
        const initialNumbers: RaffleNumber[] = Array.from({ length: total }).map((_, i) => ({
          number: i,
          status: 'free'
        }));
        setNumbers(initialNumbers);
        localStorage.setItem(numbersKey, JSON.stringify(initialNumbers));
      }

    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar dados da rifa');
    }
  }, [raffleId, navigate, isPaymentModalOpen]); // Reload when payment finishes

  const handleSelectNumber = (num: number) => {
    setSelectedNumbers((prev) => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const handleCheckoutClick = () => {
    setIsPhoneModalOpen(true);
  };

  const handlePhoneSubmit = async (phone: string, email: string) => {
    if (!raffle) return;
    setIsProcessing(true);

    try {
      const totalAmount = selectedNumbers.length * parseFloat(raffle.ticketPrice);

      const mpData = await api.createPayment({
        raffleId: raffleId!,
        raffleName: raffle.prizeName,
        numbers: selectedNumbers,
        phone,
        totalAmount
      });
      
      setInitPoint(mpData.init_point);

      // Set numbers to reserved locally before opening payment
      const updatedNumbers = [...numbers];
      selectedNumbers.forEach(num => {
        const target = updatedNumbers.find(n => n.number === num);
        if (target) {
          target.status = 'reserved';
          target.owner = phone;
          target.email = email;
        }
      });

      setNumbers(updatedNumbers);
      localStorage.setItem(`${raffleId}-numbers`, JSON.stringify(updatedNumbers));
      
      setBuyerInfo({ phone, email });
      setIsPhoneModalOpen(false);
      setIsPaymentModalOpen(true);
    } catch (e: any) {
      toast.error('Erro ao gerar pagamento: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentConfirmed = () => {
    if (!raffle || !buyerInfo) return;

    const updatedNumbers = [...numbers];
    selectedNumbers.forEach(num => {
      const target = updatedNumbers.find(n => n.number === num);
      if (target && target.status === 'reserved' && target.owner === buyerInfo.phone) {
        target.status = 'paid';
      }
    });

    setNumbers(updatedNumbers);
    localStorage.setItem(`${raffleId}-numbers`, JSON.stringify(updatedNumbers));
    
    // In future: push purchase to /dynamic-action/save-purchase or localStorage 'purchases'
    const purchaseId = Date.now().toString();
    const purchase = {
      id: purchaseId,
      raffleId: raffleId!,
      numbers: selectedNumbers,
      phone: buyerInfo.phone,
      email: buyerInfo.email,
      totalAmount: selectedNumbers.length * parseFloat(raffle.ticketPrice),
      status: 'paid',
      purchaseDate: new Date().toISOString()
    };

    const storedPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    storedPurchases.push(purchase);
    localStorage.setItem('purchases', JSON.stringify(storedPurchases));

    toast.success('Pagamento confirmado com sucesso!');
    setIsPaymentModalOpen(false);
    setSelectedNumbers([]);
    setBuyerInfo(null);
  };

  if (!raffle) return null;

  const totalAmount = selectedNumbers.length * parseFloat(raffle.ticketPrice);
  const freeCount = numbers.filter(n => n.status === 'free').length;
  const reservedCount = numbers.filter(n => n.status === 'reserved').length;
  const paidCount = numbers.filter(n => n.status === 'paid').length;

  const isEnded = new Date(raffle.endDate) < new Date() || !!raffle.winnerNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 pb-32">
      <TopBar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl relative">
        <PrizeHeader 
          name={raffle.prizeName}
          value={raffle.prizeValue}
          description={raffle.prizeDescription}
          ticketPrice={raffle.ticketPrice}
          image={raffle.prizeImage}
          endDate={raffle.endDate}
        />

        <StatusSummary free={freeCount} reserved={reservedCount} paid={paidCount} />

        {raffle.winnerNumber !== undefined && (
          <div className="mt-8 bg-yellow-400 p-6 rounded-2xl shadow-xl border-4 border-yellow-500 text-center animate-pulse">
            <h2 className="text-3xl font-black text-yellow-900 mb-2">🎉 TEMOS UM GANHADOR! 🎉</h2>
            <p className="text-xl font-bold text-yellow-800">
              O número premiado foi o <span className="bg-white px-3 py-1 rounded-lg ml-2">{String(raffle.winnerNumber).padStart(2, '0')}</span>
            </p>
          </div>
        )}

        <div className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800">Escolha seus números</h2>
            <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {raffle.totalNumbers} números no total
            </span>
          </div>

          <NumberGrid 
            numbers={numbers} 
            selectedNumbers={selectedNumbers} 
            onSelectNumber={handleSelectNumber} 
            winnerNumber={raffle.winnerNumber}
          />
        </div>
      </main>

      {!isEnded && (
        <FloatingCart 
          selectedNumbers={selectedNumbers} 
          ticketPrice={parseFloat(raffle.ticketPrice)} 
          onCheckout={handleCheckoutClick}
          onClose={() => setSelectedNumbers([])} 
        />
      )}

      <PhoneModal 
        isOpen={isPhoneModalOpen} 
        onOpenChange={setIsPhoneModalOpen} 
        onSubmit={handlePhoneSubmit} 
      />

      {buyerInfo && (
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onOpenChange={(open) => {
            if (!open && isPaymentModalOpen) {
              // Modals closed without paying -> revert reserved to free
              const revertNumbers = [...numbers];
              selectedNumbers.forEach(n => {
                const target = revertNumbers.find(rn => rn.number === n);
                if (target && target.status === 'reserved' && target.owner === buyerInfo.phone) {
                  target.status = 'free';
                  delete target.owner;
                  delete target.email;
                }
              });
              setNumbers(revertNumbers);
              localStorage.setItem(`${raffleId}-numbers`, JSON.stringify(revertNumbers));
              setSelectedNumbers([]);
              toast.info('Sua reserva expirou ou foi cancelada.');
            }
            setIsPaymentModalOpen(open);
          }} 
          totalAmount={totalAmount} 
          numbers={selectedNumbers} 
          onPaid={handlePaymentConfirmed} 
          initPoint={initPoint}
        />
      )}
    </div>
  );
}

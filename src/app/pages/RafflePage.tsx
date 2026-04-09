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
  const [pixCode, setPixCode] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);

  // Load raffle and numbers data
  useEffect(() => {
    if (!raffleId) return;

    const fetchData = async () => {
      try {
        const raffleData = await api.getRaffle(raffleId);
        setRaffle(raffleData);

        const ticketsData = await api.getTickets(raffleId);
        
        if (ticketsData && Array.isArray(ticketsData) && ticketsData.length > 0) {
          setNumbers(ticketsData);
        } else {
          // Initialize numbers if not found in DB
          const total = parseInt(raffleData.totalNumbers);
          const initialNumbers: RaffleNumber[] = Array.from({ length: total }).map((_, i) => ({
            number: i,
            status: 'free'
          }));
          setNumbers(initialNumbers);
          await api.updateTickets(raffleId, initialNumbers);
        }

      } catch (e: any) {
        console.error(e);
        toast.error('Erro ao carregar dados da rifa: ' + e.message);
        // navigate('/'); // Optional: redirect if not found
      }
    };

    fetchData();
  }, [raffleId, navigate, isPaymentModalOpen]); // Reload when payment finishes

  // Cleanup expired reservations
  useEffect(() => {
    if (!raffleId || numbers.length === 0) return;

    const interval = setInterval(async () => {
      const now = new Date();
      let changed = false;
      const updatedNumbers = numbers.map(n => {
        if (n.status === 'reserved' && n.reservedAt) {
          const reservedDate = new Date(n.reservedAt);
          const diffInMinutes = (now.getTime() - reservedDate.getTime()) / (1000 * 60);
          
          if (diffInMinutes >= 10) {
            changed = true;
            return { ...n, status: 'free' as const, owner: undefined, email: undefined, reservedAt: undefined };
          }
        }
        return n;
      });

      if (changed) {
        setNumbers(updatedNumbers);
        await api.updateTickets(raffleId!, updatedNumbers);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [raffleId, numbers]);

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

      // 1. Set numbers to reserved in DB immediately
      const updatedNumbers = [...numbers];
      selectedNumbers.forEach(num => {
        const target = updatedNumbers.find(n => n.number === num);
        if (target) {
          target.status = 'reserved';
          target.owner = phone;
          target.email = email;
          target.reservedAt = new Date().toISOString();
        }
      });

      setNumbers(updatedNumbers);
      await api.updateTickets(raffleId!, updatedNumbers);

      // 2. Save reservation/purchase record to DB
      await api.savePurchase({
        raffleId: raffleId!,
        raffleName: raffle.prizeName,
        numbers: selectedNumbers,
        phone,
        email,
        totalAmount,
        status: 'pending',
        purchaseDate: new Date().toISOString()
      });

      setBuyerInfo({ phone, email });
      setIsPhoneModalOpen(false);
      setIsPaymentModalOpen(true);

      // 3. Generate Mercado Pago link (async, doesn't block the UI if it takes time)
      try {
        const mpData = await api.createPayment({
          raffleId: raffleId!,
          raffleName: raffle.prizeName,
          numbers: selectedNumbers,
          phone,
          email,
          totalAmount
        });
        
        setInitPoint(mpData.init_point);
        setPixCode(mpData.pix_code);
      } catch (mpErr) {
        console.error('MP Error:', mpErr);
        toast.error('Ganhamos o seu registro! Mas houve um erro ao criar o link de pagamento. Tente novamente em Ver Meus números.');
      }

    } catch (e: any) {
      toast.error('Erro ao processar reserva: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentConfirmed = async () => {
    if (!raffle || !buyerInfo) return;

    const updatedNumbers = numbers.map(target => {
      if (selectedNumbers.includes(target.number) && target.status === 'reserved' && target.owner === buyerInfo.phone) {
        return { ...target, status: 'paid' as const };
      }
      return target;
    });

    setNumbers(updatedNumbers);
    await api.updateTickets(raffleId!, updatedNumbers);
    
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

    // No need to save in localStorage purchases since savePurchase was called in handlePhoneSubmit
    // But we might want to update the status to paid in the DB purchase record too.
    await api.savePurchase({ ...purchase, status: 'paid' });

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

  const isEnded = new Date(raffle.endDate) < new Date() || (raffle.winnerNumber !== null && raffle.winnerNumber !== undefined);

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

        {(raffle.winnerNumber !== null && raffle.winnerNumber !== undefined) && (
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
            if (!open) {
              setSelectedNumbers([]);
              setBuyerInfo(null);
            }
            setIsPaymentModalOpen(open);
          }} 
          totalAmount={totalAmount} 
          ticketCount={selectedNumbers.length}
          numbers={selectedNumbers} 
          onPaid={handlePaymentConfirmed} 
          initPoint={initPoint}
          pixCode={pixCode}
        />
      )}
    </div>
  );
}

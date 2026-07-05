import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { TopBar } from '@/components/TopBar';
import { PrizeHeader } from '@/components/PrizeHeader';
import { StatusSummary } from '@/components/StatusSummary';
import { NumberGrid } from '@/components/NumberGrid';
import { AnimalGrid } from '@/components/AnimalGrid';
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
  const [buyerInfo, setBuyerInfo] = useState<{ name: string, phone: string, email: string } | null>(null);
  const [initPoint, setInitPoint] = useState<string | undefined>();
  const [pixCode, setPixCode] = useState<string | undefined>();
  const [paymentId, setPaymentId] = useState<string | undefined>();
  const [purchaseId, setPurchaseId] = useState<string | undefined>();
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

  const handlePhoneSubmit = async (name: string, phone: string, email: string) => {
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
      const purchaseRes = await api.savePurchase({
        raffleId: raffleId!,
        raffleName: raffle.prizeName,
        numbers: selectedNumbers,
        name,
        phone,
        email,
        totalAmount,
        status: 'pending',
        purchaseDate: new Date().toISOString()
      });

      const newPurchaseId = purchaseRes.id;
      setPurchaseId(newPurchaseId);

      setBuyerInfo({ name, phone, email });
      setIsPhoneModalOpen(false);
      setIsPaymentModalOpen(true);

      // 3. Generate Mercado Pago link (async, doesn't block the UI if it takes time)
      try {
        const mpData = await api.createPayment({
          raffleId: raffleId!,
          raffleName: raffle.prizeName,
          numbers: selectedNumbers,
          name,
          phone,
          email,
          totalAmount,
          purchaseId: newPurchaseId
        });
        
        setInitPoint(mpData.init_point);
        setPixCode(mpData.pix_code);
        setPaymentId(mpData.paymentId);
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
    
    // Update the purchase record in the DB to paid status
    if (purchaseId) {
      await api.savePurchase({
        id: purchaseId,
        raffleId: raffleId!,
        numbers: selectedNumbers,
        name: buyerInfo.name,
        phone: buyerInfo.phone,
        email: buyerInfo.email,
        totalAmount: selectedNumbers.length * parseFloat(raffle.ticketPrice),
        status: 'paid',
        purchaseDate: new Date().toISOString()
      });
    }

    toast.success('Pagamento carregado! Redirecionando...');
    setIsPaymentModalOpen(false);
    setSelectedNumbers([]);
    setBuyerInfo(null);
    
    // Automatic redirect to home after 2 seconds
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (!raffle) return null;

  const totalAmount = selectedNumbers.length * parseFloat(raffle.ticketPrice);
  const freeCount = numbers.filter(n => n.status === 'free').length;
  const reservedCount = numbers.filter(n => n.status === 'reserved').length;
  const paidCount = numbers.filter(n => n.status === 'paid').length;

  const isEnded = new Date(raffle.endDate) < new Date() || (raffle.winnerNumber !== null && raffle.winnerNumber !== undefined);

  return (
    <div className="min-h-screen bg-[#0a1128] pb-32">
      <TopBar hideAdmin />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl relative">
        <PrizeHeader 
          name={raffle.prizeName}
          value={raffle.prizeValue}
          description={raffle.prizeDescription}
          ticketPrice={raffle.ticketPrice}
          image={raffle.prizeImage}
          endDate={raffle.endDate}
          type={raffle.type}
        />

        <StatusSummary free={freeCount} reserved={reservedCount} paid={paidCount} />

        {(raffle.winnerNumber !== null && raffle.winnerNumber !== undefined) && (
          <div className="mt-8 bg-gradient-to-r from-[#f5a623] to-[#ffd700] p-6 rounded-2xl shadow-xl shadow-[#f5a623]/20 border-4 border-[#ffd700] text-center animate-pulse">
            <h2 className="text-3xl font-black text-[#0a1128] mb-2">🎉 TEMOS UM GANHADOR! 🎉</h2>
            <p className="text-xl font-bold text-[#0a1128]/80">
              O número premiado foi o <span className="bg-white px-3 py-1 rounded-lg ml-2">{String(raffle.winnerNumber).padStart(2, '0')}</span>
            </p>
          </div>
        )}

        <div className="mt-12 bg-[#111d3a] rounded-3xl p-6 md:p-8 shadow-xl border border-[#2a3a5c]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Escolha seus números</h2>
            <span className="text-sm font-semibold text-[#8899bb] bg-[#0a1128] px-3 py-1 rounded-full border border-[#2a3a5c]">
              {raffle.totalNumbers} números no total
            </span>
          </div>

          {raffle.type === 'animals' ? (
            <AnimalGrid 
              numbers={numbers} 
              selectedNumbers={selectedNumbers} 
              onSelectAnimal={(animalNums) => {
                // Se o primeiro número já estiver selecionado, remove todos
                if (selectedNumbers.includes(animalNums[0])) {
                  setSelectedNumbers(prev => prev.filter(n => !animalNums.includes(n)));
                } else {
                  setSelectedNumbers(prev => [...prev, ...animalNums]);
                }
              }} 
              winnerNumber={raffle.winnerNumber}
            />
          ) : (
            <NumberGrid 
              numbers={numbers} 
              selectedNumbers={selectedNumbers} 
              onSelectNumber={handleSelectNumber} 
              winnerNumber={raffle.winnerNumber}
            />
          )}
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
          paymentId={paymentId}
          purchaseId={purchaseId}
          raffleId={raffleId!}
          raffleName={raffle.prizeName}
          email={buyerInfo.email}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Purchase, RaffleData } from '../app/types';
import { Card, CardContent } from './ui/card';
import { TopBar } from './TopBar';
import { Ticket, Trophy, DollarSign } from 'lucide-react';
import { ClientLoginModal } from './ClientLoginModal';
import { api } from '@/lib/api';

export function MyNumbers() {
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [credentials, setCredentials] = useState<{phone: string, email: string} | null>(null);
  
  const [myPurchases, setMyPurchases] = useState<(Purchase & { raffle?: RaffleData })[]>([]);

  useEffect(() => {
    if (!credentials) return;

    const fetchData = async () => {
      try {
        const userPurchases = await api.getMyPurchases(credentials.phone);
        // Filtrar por email também se necessário (já feito no backend opcionalmente)
        const filtered = userPurchases.filter(p => !credentials.email || p.email === credentials.email);

        const enriched = await Promise.all(filtered.map(async p => {
          try {
            const raffleData = await api.getRaffle(p.raffleId);
            return { ...p, raffle: raffleData };
          } catch (e) {
            console.error('Erro ao carregar rifa:', p.raffleId, e);
            return p;
          }
        }));

        setMyPurchases(enriched.sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()));
      } catch (e: any) {
        console.error('Erro ao buscar compras:', e);
      }
    };

    fetchData();
  }, [credentials]);

  const handleLogin = (phone: string, email: string) => {
    setCredentials({ phone, email });
    setIsLoginOpen(false);
  };

  if (!credentials) {
    return (
      <div className="min-h-screen bg-[#0a1128]">
        <TopBar />
        <ClientLoginModal isOpen={isLoginOpen} onOpenChange={(v) => {
          if (!v) {
            // Se fechar e não logou, volta
            window.location.href = '/';
          }
        }} onLogin={handleLogin} />
      </div>
    );
  }

  const totalSpent = myPurchases.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalNumbers = myPurchases.reduce((acc, curr) => acc + curr.numbers.length, 0);
  const prizesWon = myPurchases.filter(p => p.raffle && p.raffle.winnerNumber && p.numbers.includes(p.raffle.winnerNumber)).length;

  return (
    <div className="min-h-screen bg-[#0a1128] pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-black text-white mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>Minhas Compras</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-[#111d3a] border border-[#2a3a5c] shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-[#1e88e5]/15 p-3 rounded-xl text-[#1e88e5] border border-[#1e88e5]/30">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#8899bb]">Números Comprados</p>
                <p className="text-2xl font-bold text-white">{totalNumbers}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111d3a] border border-[#2a3a5c] shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-[#00c853]/15 p-3 rounded-xl text-[#00c853] border border-[#00c853]/30">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#8899bb]">Total Investido</p>
                <p className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2).replace('.',',')}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111d3a] border border-[#2a3a5c] shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-[#ffd700]/15 p-3 rounded-xl text-[#ffd700] border border-[#ffd700]/30">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#8899bb]">Prêmios Ganhos</p>
                <p className="text-2xl font-bold text-white">{prizesWon}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {myPurchases.length === 0 ? (
          <div className="text-center py-16 bg-[#111d3a] rounded-2xl shadow-sm border border-[#2a3a5c]">
            <Ticket className="w-12 h-12 text-[#2a3a5c] mx-auto mb-4" />
            <p className="text-[#5a6a8a] text-lg">Você ainda não tem compras registradas.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {myPurchases.map(purchase => {
              const raffle = purchase.raffle;
              const hasWon = raffle && raffle.winnerNumber !== undefined && purchase.numbers.includes(raffle.winnerNumber);

              return (
                <Card key={purchase.id} className={`overflow-hidden border border-[#2a3a5c] shadow-md ${hasWon ? 'ring-4 ring-[#ffd700]/50 bg-[#ffd700]/5' : 'bg-[#111d3a]'}`}>
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-48 md:h-auto bg-[#0a1128] shrink-0">
                      <img 
                        src={raffle?.prizeImage || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48'} 
                        alt="Prêmio"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-white line-clamp-1 flex-1">
                            {raffle?.prizeName || 'Rifa Desconhecida'}
                          </h3>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${purchase.status === 'paid' ? 'bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30' : 'bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30'}`}>
                            {purchase.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                          </span>
                        </div>
                        <p className="text-sm text-[#8899bb] mb-4">
                          Comprado em {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')} 
                        </p>
                        
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-[#8899bb] uppercase mb-2">Seus números:</p>
                          <div className="flex flex-wrap gap-2">
                            {purchase.numbers.map(n => (
                              <div key={n} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${raffle?.winnerNumber === n ? 'bg-[#ffd700] text-[#0a1128] border-2 border-[#f5a623] animate-pulse scale-110' : 'bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30'}`}>
                                {String(n).padStart(2, '0')}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[#2a3a5c]">
                        <p className="font-bold text-white">
                          Total: R$ {purchase.totalAmount.toFixed(2).replace('.', ',')}
                        </p>
                        {hasWon && (
                          <div className="flex items-center text-[#ffd700] font-bold bg-[#ffd700]/15 px-3 py-1 rounded-full border border-[#ffd700]/30">
                            <Trophy className="w-4 h-4 mr-2" /> Vencedor!
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  );
}

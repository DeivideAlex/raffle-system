import { useState, useEffect } from 'react';
import { Purchase, RaffleData } from '../app/types';
import { Card, CardContent } from './ui/card';
import { TopBar } from './TopBar';
import { Ticket, Trophy, DollarSign } from 'lucide-react';
import { ClientLoginModal } from './ClientLoginModal';

export function MyNumbers() {
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [credentials, setCredentials] = useState<{phone: string, email: string} | null>(null);
  
  const [myPurchases, setMyPurchases] = useState<(Purchase & { raffle?: RaffleData })[]>([]);

  useEffect(() => {
    if (!credentials) return;

    // Load from local storage mocks
    const storedPurchases: Purchase[] = JSON.parse(localStorage.getItem('purchases') || '[]');
    const userPurchases = storedPurchases.filter(p => p.phone === credentials.phone && p.email === credentials.email);

    const enriched = userPurchases.map(p => {
      const raffleData = JSON.parse(localStorage.getItem(p.raffleId) || 'null');
      return { ...p, raffle: raffleData };
    });

    setMyPurchases(enriched.sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()));
  }, [credentials]);

  const handleLogin = (phone: string, email: string) => {
    setCredentials({ phone, email });
    setIsLoginOpen(false);
  };

  if (!credentials) {
    return (
      <div className="min-h-screen bg-slate-50">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-black text-slate-800 mb-8">Minhas Compras</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Números Comprados</p>
                <p className="text-2xl font-bold text-slate-800">{totalNumbers}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Investido</p>
                <p className="text-2xl font-bold text-slate-800">R$ {totalSpent.toFixed(2).replace('.',',')}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-xl text-yellow-600">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Prêmios Ganhos</p>
                <p className="text-2xl font-bold text-slate-800">{prizesWon}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {myPurchases.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Você ainda não tem compras registradas.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {myPurchases.map(purchase => {
              const raffle = purchase.raffle;
              const hasWon = raffle && raffle.winnerNumber !== undefined && purchase.numbers.includes(raffle.winnerNumber);

              return (
                <Card key={purchase.id} className={`overflow-hidden border-0 shadow-md ${hasWon ? 'ring-4 ring-yellow-400 bg-yellow-50' : 'bg-white'}`}>
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-48 md:h-auto bg-slate-200 shrink-0">
                      <img 
                        src={raffle?.prizeImage || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48'} 
                        alt="Prêmio"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-slate-800 line-clamp-1 flex-1">
                            {raffle?.prizeName || 'Rifa Desconhecida'}
                          </h3>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${purchase.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {purchase.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                          Comprado em {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')} 
                        </p>
                        
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Seus números:</p>
                          <div className="flex flex-wrap gap-2">
                            {purchase.numbers.map(n => (
                              <div key={n} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${raffle?.winnerNumber === n ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-500 animate-pulse scale-110' : 'bg-purple-100 text-purple-700'}`}>
                                {String(n).padStart(2, '0')}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <p className="font-bold text-slate-800">
                          Total: R$ {purchase.totalAmount.toFixed(2).replace('.', ',')}
                        </p>
                        {hasWon && (
                          <div className="flex items-center text-yellow-600 font-bold bg-yellow-100 px-3 py-1 rounded-full">
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

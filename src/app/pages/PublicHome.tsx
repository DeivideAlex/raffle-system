import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent } from '@/components/ui/card';
import { WinnersDrawer } from '@/components/WinnersDrawer';
import { RaffleData } from '../types';
import { Activity, Ticket } from 'lucide-react';

export function PublicHome() {
  const [raffles, setRaffles] = useState<RaffleData[]>([]);
  const [isWinnersOpen, setIsWinnersOpen] = useState(false);

  useEffect(() => {
    // Load mock from localStorage
    const keys = Object.keys(localStorage);
    const loadedRaffles: RaffleData[] = [];
    
    keys.forEach(key => {
      if (key.startsWith('raffle-') && !key.endsWith('-numbers')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          loadedRaffles.push({ ...data, id: key });
        } catch (e) {
          console.error(e);
        }
      }
    });

    setRaffles(loadedRaffles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex flex-col">
      <TopBar onWinnersClick={() => setIsWinnersOpen(true)} />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mb-4">
            Sorteios Extraordinários
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Participe das nossas rifas e concorra a prêmios incríveis com as melhores chances.
          </p>
        </div>

        {raffles.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-white backdrop-blur-sm">
            <Ticket className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">Nenhuma rifa ativa no momento</h3>
            <p className="text-slate-400">Volte em breve para novas oportunidades de ganhar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map(raffle => {
              const isEnded = new Date(raffle.endDate) < new Date() || !!raffle.winnerNumber;
              
              return (
                <Link key={raffle.id} to={`/r/${raffle.id}`}>
                  <Card className="overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-300 border-0 bg-white/80 backdrop-blur-lg">
                    <div className="h-48 relative overflow-hidden bg-slate-100">
                      <img 
                        src={raffle.prizeImage || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48'} 
                        alt={raffle.prizeName} 
                        className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${isEnded ? 'grayscale' : ''}`}
                      />
                      {isEnded && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="text-white font-black tracking-widest uppercase border-2 border-white px-4 py-1 rounded-lg transform -rotate-12">
                            Finalizada
                          </span>
                        </div>
                      )}
                      {!isEnded && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
                          <Activity className="w-3 h-3 mr-1 animate-pulse" /> Ativa
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-black text-xl text-slate-800 line-clamp-1 mb-2">
                        {raffle.prizeName}
                      </h3>
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-semibold uppercase">Valor</span>
                          <span className="font-bold text-green-600">
                            {raffle.prizeValue.includes('R$') ? raffle.prizeValue : `R$ ${raffle.prizeValue}`}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-500 font-semibold uppercase">Por número</span>
                          <span className="font-black text-purple-600">
                            R$ {parseFloat(raffle.ticketPrice).toLocaleString('pt-BR', {minimumFractionDigits:2})}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <WinnersDrawer isOpen={isWinnersOpen} onOpenChange={setIsWinnersOpen} />
    </div>
  );
}

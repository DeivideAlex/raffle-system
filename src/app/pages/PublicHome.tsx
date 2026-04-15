import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent } from '@/components/ui/card';
import { WinnersDrawer } from '@/components/WinnersDrawer';
import { RaffleData } from '../types';
import { Activity, Ticket, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';


export function PublicHome() {
  const [raffles, setRaffles] = useState<RaffleData[]>([]);
  const [isWinnersOpen, setIsWinnersOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getRaffles();
        setRaffles(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (e) {
        console.error('Error fetching raffles:', e);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1128] flex flex-col">
      <TopBar onWinnersClick={() => setIsWinnersOpen(true)} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative coins */}
        <div className="absolute top-8 left-8 w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] to-[#f5a623] opacity-60 coin-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-16 right-12 w-6 h-6 rounded-full bg-gradient-to-br from-[#ffd700] to-[#e8941a] opacity-40 coin-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-32 left-1/4 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#f5a623] opacity-30 coin-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-10 right-1/3 w-7 h-7 rounded-full bg-gradient-to-br from-[#ffd700] to-[#f5a623] opacity-50 coin-float" style={{ animationDelay: '1.5s' }} />
        
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-[#ffd700]" />
              <span className="text-[#f5a623] text-sm font-bold uppercase tracking-widest">Premiações Online</span>
              <Sparkles className="w-6 h-6 text-[#ffd700]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="gold-shimmer">Sorteios</span>{' '}
              <span className="text-white">Extraordinários</span>
            </h1>
            <p className="text-lg text-[#8899bb] max-w-2xl mx-auto">
              Participe das nossas rifas e concorra a prêmios incríveis com as melhores chances.
            </p>
          </div>

          {raffles.length === 0 ? (
            <div className="text-center py-20 bg-[#111d3a]/80 rounded-3xl border border-[#2a3a5c] backdrop-blur-sm">
              <Ticket className="w-16 h-16 text-[#2a3a5c] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#8899bb] mb-2">Nenhuma rifa ativa no momento</h3>
              <p className="text-[#5a6a8a]">Volte em breve para novas oportunidades de ganhar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.map(raffle => {
                const isEnded = new Date(raffle.endDate) < new Date() || !!raffle.winnerNumber;
                
                return (
                  <Link key={raffle.id} to={`/r/${raffle.id}`}>
                    <Card className="overflow-hidden hover:shadow-2xl hover:shadow-[#f5a623]/20 hover:-translate-y-2 transition-all duration-300 border border-[#2a3a5c] bg-[#111d3a]/80 backdrop-blur-lg">
                      <div className="h-48 relative overflow-hidden bg-[#0a1128]">
                        <img 
                          src={raffle.prizeImage || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48'} 
                          alt={raffle.prizeName} 
                          className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${isEnded ? 'grayscale opacity-60' : ''}`}
                        />
                        {isEnded && (
                          <div className="absolute inset-0 bg-[#0a1128]/70 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="text-[#ffd700] font-black tracking-widest uppercase border-2 border-[#ffd700] px-4 py-1 rounded-lg transform -rotate-12">
                              Finalizada
                            </span>
                          </div>
                        )}
                        {!isEnded && (
                          <div className="absolute top-4 right-4 bg-[#00c853] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
                            <Activity className="w-3 h-3 mr-1 animate-pulse" /> Ativa
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="font-black text-xl text-white line-clamp-1 mb-2">
                          {raffle.prizeName}
                        </h3>
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-[#8899bb] font-semibold uppercase">Valor</span>
                            <span className="font-bold text-[#00c853]">
                              {raffle.prizeValue.includes('R$') ? raffle.prizeValue : `R$ ${raffle.prizeValue}`}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-[#8899bb] font-semibold uppercase">Por número</span>
                            <span className="font-black text-[#f5a623]">
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
      </div>

      <WinnersDrawer isOpen={isWinnersOpen} onOpenChange={setIsWinnersOpen} />
    </div>
  );
}

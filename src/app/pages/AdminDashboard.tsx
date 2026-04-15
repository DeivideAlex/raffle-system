import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { RaffleData } from '../types';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart3, Users, Ticket, Trash2, Eye, Trophy } from 'lucide-react';
import { WinnerModal } from '@/components/WinnerModal';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ShieldCheck } from 'lucide-react';


export function AdminDashboard() {
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<RaffleData[]>([]);
  const [selectedRaffleToWin, setSelectedRaffleToWin] = useState<RaffleData | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth !== JSON.stringify({ authenticated: true })) {
      navigate('/admin');
      return;
    }

    loadRaffles();
  }, [navigate]);

  const loadRaffles = async () => {
    try {
      const data = await api.getRaffles();
      setRaffles(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      toast.error('Erro ao carregar rifas do banco de dados');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta rifa permanente?')) {
      localStorage.removeItem(id);
      localStorage.removeItem(`${id}-numbers`);
      loadRaffles();
      toast.success('Rifa excluída.');
    }
  };

  const totalRaffles = raffles.length;
  // TODO: extract actual paid numbers from mock later for correct sum
  const totalPaid = 0; 
  const totalRevenue = 0;

  return (
    <div className="min-h-screen bg-[#0a1128]">
      <div className="w-full h-16 bg-[#111d3a] border-b border-[#2a3a5c] flex items-center px-6 justify-between text-white">
        <h1 className="font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#f5a623]" /> <span className="gold-shimmer">Admin Panel</span>
        </h1>
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="ghost" className="text-[#8899bb] hover:text-white hover:bg-[#1a2744]">Ver Site</Button>
          </Link>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleLogout}>Sair</Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Dashboard</h2>
          <Link to="/admin/create">
            <Button className="bg-gradient-to-r from-[#f5a623] to-[#e8941a] hover:from-[#e8941a] hover:to-[#d4810f] text-[#0a1128] font-bold shadow-md">
              <PlusCircle className="w-4 h-4 mr-2" /> Nova Rifa
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111d3a] border border-[#2a3a5c] shadow-sm">
            <CardContent className="p-6">
              <Ticket className="w-8 h-8 text-[#f5a623] mb-2" />
              <p className="text-sm font-semibold text-[#8899bb] uppercase">Rifas Criadas</p>
              <p className="text-3xl font-black text-white">{totalRaffles}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111d3a] border border-[#2a3a5c] shadow-sm">
             <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 text-[#00c853] mb-2" />
              <p className="text-sm font-semibold text-[#8899bb] uppercase">Receita Total</p>
              <p className="text-3xl font-black text-white">R$ {totalRevenue.toFixed(2).replace('.',',')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Todas as Rifas</h3>
          
          {raffles.map(r => (
            <Card key={r.id} className="border border-[#2a3a5c] shadow-sm overflow-hidden bg-[#111d3a]">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 h-32 bg-[#0a1128] shrink-0">
                  <img src={r.prizeImage} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-white">{r.prizeName}</h4>
                      <p className="text-sm text-[#8899bb]">{r.totalNumbers} números • R$ {parseFloat(r.ticketPrice).toFixed(2).replace('.',',')} cada</p>
                    </div>
                    {r.winnerNumber ? (
                      <span className="bg-[#ffd700]/15 text-[#ffd700] px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center border border-[#ffd700]/30">
                        <Trophy className="w-3 h-3 mr-1" /> Sorteada
                      </span>
                    ) : (new Date(r.endDate) < new Date() ? (
                      <span className="bg-red-500/15 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-red-500/30">Finalizada</span>
                    ) : (
                      <span className="bg-[#00c853]/15 text-[#00c853] px-3 py-1 rounded-full text-xs font-bold uppercase border border-[#00c853]/30">Ativa</span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-4 mt-auto">
                    <Link to={`/r/${r.id}`}>
                      <Button variant="outline" size="sm" className="border-[#2a3a5c] text-[#8899bb] hover:text-white hover:bg-[#1a2744]"><Eye className="w-4 h-4 mr-1"/> Ver</Button>
                    </Link>
                    <Button variant="outline" size="sm" className="border-[#2a3a5c] text-[#8899bb] hover:text-white hover:bg-[#1a2744]"><Users className="w-4 h-4 mr-1"/> Participantes</Button>
                    {!r.winnerNumber && (
                      <Button variant="outline" size="sm" className="text-[#f5a623] border-[#f5a623]/30 bg-[#f5a623]/10 hover:bg-[#f5a623]/20" onClick={() => setSelectedRaffleToWin(r)}><Trophy className="w-4 h-4 mr-1"/> Informar Resultado</Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-400 ml-auto hover:bg-red-500/10" onClick={() => handleDelete(r.id!)}><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {raffles.length === 0 && (
            <p className="text-[#5a6a8a] p-8 text-center bg-[#111d3a] rounded-xl border border-dashed border-[#2a3a5c]">Nenhuma rifa criada ainda.</p>
          )}
        </div>
      </main>

      {selectedRaffleToWin && (
        <WinnerModal 
          isOpen={!!selectedRaffleToWin}
          onOpenChange={(v) => !v && setSelectedRaffleToWin(null)}
          raffle={selectedRaffleToWin}
          onWinnerSelected={loadRaffles}
        />
      )}
    </div>
  );
}


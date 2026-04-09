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
    <div className="min-h-screen bg-slate-50">
      <div className="w-full h-16 bg-slate-900 border-b border-white/10 flex items-center px-6 justify-between text-white">
        <h1 className="font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-400" /> Admin Panel
        </h1>
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="ghost" className="text-slate-300 hover:text-white">Ver Site</Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleLogout}>Sair</Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-800">Dashboard</h2>
          <Link to="/admin/create">
            <Button className="bg-purple-600 hover:bg-purple-700 font-bold shadow-md">
              <PlusCircle className="w-4 h-4 mr-2" /> Nova Rifa
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <Ticket className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-sm font-semibold text-slate-500 uppercase">Rifas Criadas</p>
              <p className="text-3xl font-black text-slate-800">{totalRaffles}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-sm">
             <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-sm font-semibold text-slate-500 uppercase">Receita Total</p>
              <p className="text-3xl font-black text-slate-800">R$ {totalRevenue.toFixed(2).replace('.',',')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Todas as Rifas</h3>
          
          {raffles.map(r => (
            <Card key={r.id} className="border-0 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 h-32 bg-slate-200 shrink-0">
                  <img src={r.prizeImage} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{r.prizeName}</h4>
                      <p className="text-sm text-slate-500">{r.totalNumbers} números • R$ {parseFloat(r.ticketPrice).toFixed(2).replace('.',',')} cada</p>
                    </div>
                    {r.winnerNumber ? (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center">
                        <Trophy className="w-3 h-3 mr-1" /> Sorteada
                      </span>
                    ) : (new Date(r.endDate) < new Date() ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase">Finalizada</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase">Ativa</span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-4 mt-auto">
                    <Link to={`/r/${r.id}`}>
                      <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1"/> Ver</Button>
                    </Link>
                    <Button variant="outline" size="sm"><Users className="w-4 h-4 mr-1"/> Participantes</Button>
                    {!r.winnerNumber && (
                      <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100" onClick={() => setSelectedRaffleToWin(r)}><Trophy className="w-4 h-4 mr-1"/> Informar Resultado</Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-500 ml-auto" onClick={() => handleDelete(r.id!)}><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {raffles.length === 0 && (
            <p className="text-slate-500 p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">Nenhuma rifa criada ainda.</p>
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


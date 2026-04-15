import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Winner } from '../app/types';
import { Trophy, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';


interface WinnersDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WinnersDrawer({ isOpen, onOpenChange }: WinnersDrawerProps) {
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchWinners = async () => {
        try {
          const stored = await api.getWinners();
          setWinners(stored.sort((a: Winner, b: Winner) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (e) {
          console.error('Error fetching winners:', e);
        }
      };
      fetchWinners();
    }
  }, [isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] bg-[#0a1128] border-t border-[#2a3a5c]">
        <div className="mx-auto w-full max-w-lg h-full flex flex-col">
          <DrawerHeader className="border-b border-[#2a3a5c]">
            <DrawerTitle className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-[#ffd700]" />
              <span className="gold-shimmer">Galeria de Ganhadores</span>
            </DrawerTitle>
            <DrawerDescription className="text-center text-[#8899bb]">
              Histórico de todos os sortudos do nosso sistema.
            </DrawerDescription>
          </DrawerHeader>

          <ScrollArea className="flex-1 p-4">
            {winners.length === 0 ? (
              <div className="text-center py-12 text-[#5a6a8a]">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20" />
                Nenhum sorteio foi finalizado ainda.
              </div>
            ) : (
              <div className="space-y-4 pb-8">
                {winners.map((w) => (
                  <div key={w.id} className="bg-[#111d3a] border border-[#f5a623]/20 rounded-2xl p-4 flex gap-4 items-center">
                    <img 
                      src={w.prizeImage || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48'} 
                      alt="Prêmio" 
                      className="w-16 h-16 rounded-xl object-cover shadow-sm bg-[#0a1128]"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-white line-clamp-1">{w.raffleName}</h4>
                      <div className="flex text-xs text-[#8899bb] items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(w.date).toLocaleDateString('pt-BR')}
                      </div>
                      <p className="text-sm font-semibold text-[#f5a623] mt-1">Ganhador: {w.winnerName}</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#ffd700] to-[#f5a623] text-[#0a1128] font-black text-xl w-14 h-14 rounded-full flex items-center justify-center border-2 border-[#ffd700] shadow-md">
                      {String(w.winnerNumber).padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

import { Link } from 'react-router';
import { Button } from './ui/button';
import { Trophy, ShieldCheck, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { MyNumbersModal } from './MyNumbersModal';

export function TopBar({ isAdmin = false, onWinnersClick }: { isAdmin?: boolean, onWinnersClick?: () => void }) {
  const [isMyNumbersOpen, setIsMyNumbersOpen] = useState(false);

  return (
    <div className="w-full h-16 border-b border-white/20 bg-white/10 backdrop-blur-md flex items-center px-4 md:px-8 justify-between sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-80 transition-opacity">
        <span className="bg-gradient-to-tr from-pink-500 to-purple-500 text-transparent bg-clip-text">Win</span>Raffle
      </Link>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          className="text-white hover:text-purple-200" 
          onClick={() => setIsMyNumbersOpen(true)}
        >
          <ReceiptText className="w-5 h-5 mr-2" />
          <span className="hidden md:inline">Meus Números</span>
        </Button>

        {onWinnersClick && (
          <Button variant="ghost" className="text-white hover:text-purple-200" onClick={onWinnersClick}>
            <Trophy className="w-5 h-5 mr-2" />
            <span className="hidden md:inline">Ganhadores</span>
          </Button>
        )}
        
        {isAdmin ? (
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 mr-2" /> Painel
            </Button>
          </Link>
        ) : (
          <Link to="/admin">
            <Button variant="secondary" className="font-semibold shadow-sm">
              Entrar
            </Button>
          </Link>
        )}
      </div>

      <MyNumbersModal isOpen={isMyNumbersOpen} onOpenChange={setIsMyNumbersOpen} />
    </div>
  )
}

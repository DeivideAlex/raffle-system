import { Trophy, CheckCircle2, Clock, CircleDot } from 'lucide-react';

interface StatusSummaryProps {
  free: number;
  reserved: number;
  paid: number;
}

export function StatusSummary({ free, reserved, paid }: StatusSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
      <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <CircleDot className="w-6 h-6 text-green-500 mb-1" />
        <span className="text-2xl font-bold text-slate-800">{free}</span>
        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Livres</span>
      </div>
      
      <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <Clock className="w-6 h-6 text-yellow-500 mb-1" />
        <span className="text-2xl font-bold text-slate-800">{reserved}</span>
        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold text-center">Reservados</span>
      </div>

      <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <CheckCircle2 className="w-6 h-6 text-blue-500 mb-1" />
        <span className="text-2xl font-bold text-slate-800">{paid}</span>
        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pagos</span>
      </div>
    </div>
  )
}

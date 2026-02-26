import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export default function TopNav({ lastRefresh }) {
     return (
          <div className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-8">
               <h1 className="text-xl font-semibold tracking-wide flex items-center gap-3">
                    SOC Automation Command Center
               </h1>
               <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                         <Activity size={16} className="animate-pulse" />
                         <span className="font-medium tracking-wide">SYSTEM LIVE</span>
                    </div>
                    <div className="text-slate-400">
                         Last Refresh: <span className="text-slate-200">{lastRefresh ? format(lastRefresh, 'HH:mm:ss') : '--:--:--'}</span>
                    </div>
               </div>
          </div>
     );
}

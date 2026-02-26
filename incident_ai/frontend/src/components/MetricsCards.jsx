import { AlertOctagon, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function MetricsCards({ metrics }) {
     return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex items-center relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                         <ShieldAlert size={120} />
                    </div>
                    <div className="z-10">
                         <p className="text-slate-400 font-medium tracking-wide mb-1">Total Incidents</p>
                         <p className="text-4xl font-bold text-slate-100">{metrics.total_incidents || 0}</p>
                    </div>
               </div>

               <div className="bg-slate-900 border border-orange-900/50 p-6 rounded-xl shadow-lg flex items-center relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 text-orange-500/10 group-hover:text-orange-500/20 transition-colors">
                         <AlertTriangle size={120} />
                    </div>
                    <div className="z-10">
                         <p className="text-orange-400 font-medium tracking-wide mb-1">High Severity</p>
                         <p className="text-4xl font-bold text-orange-500">{metrics.high_severity || 0}</p>
                    </div>
               </div>

               <div className="bg-slate-900 border border-red-900/50 p-6 rounded-xl shadow-lg flex items-center relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 text-red-500/10 group-hover:text-red-500/20 transition-colors">
                         <AlertOctagon size={120} />
                    </div>
                    <div className="z-10">
                         <p className="text-red-400 font-medium tracking-wide mb-1">Critical Severity</p>
                         <p className="text-4xl font-bold text-red-500">{metrics.critical_severity || 0}</p>
                    </div>
               </div>
          </div>
     );
}

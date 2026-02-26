import { AlertTriangle, TrendingUp, BarChart3, Activity } from 'lucide-react';

export default function AnalyticsCharts({ incidents }) {
     if (!incidents || incidents.length === 0) {
          return (
               <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p>Not enough data to generate analytics yet.</p>
               </div>
          );
     }

     // 1. Severity Distribution
     const severities = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
     // 2. Stage Distribution
     const stages = { OPEN: 0, INVESTIGATING: 0, RESOLVED: 0 };
     // 3. Escalations (heat)
     let escalationCount = 0;

     incidents.forEach(inc => {
          if (severities[inc.severity] !== undefined) severities[inc.severity]++;
          if (stages[inc.incident_stage] !== undefined) stages[inc.incident_stage]++;
          if (inc.occurrence_count >= 3) escalationCount++;
     });

     const total = incidents.length;

     return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

               {/* Severity Chart */}
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                    <h3 className="text-slate-300 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
                         <AlertTriangle size={16} className="text-orange-500" />
                         Severity Distribution
                    </h3>
                    <div className="space-y-4">
                         {Object.entries(severities).map(([sev, count]) => {
                              const width = total > 0 ? (count / total) * 100 : 0;
                              const color = sev === 'CRITICAL' ? 'bg-red-500' : sev === 'HIGH' ? 'bg-orange-500' : sev === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500';
                              return (
                                   <div key={sev}>
                                        <div className="flex justify-between text-xs mb-1 font-medium">
                                             <span className="text-slate-400">{sev}</span>
                                             <span className="text-slate-300">{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                             <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${width}%` }}></div>
                                        </div>
                                   </div>
                              );
                         })}
                    </div>
               </div>

               {/* Stage Chart */}
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                    <h3 className="text-slate-300 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
                         <BarChart3 size={16} className="text-blue-400" />
                         Workflow Stages
                    </h3>
                    <div className="flex h-32 items-end justify-between pt-4 gap-2">
                         {Object.entries(stages).map(([stage, count]) => {
                              const height = total > 0 ? (count / total) * 100 : 0;
                              const color = stage === 'OPEN' ? 'bg-red-500/80' : stage === 'INVESTIGATING' ? 'bg-orange-500/80' : 'bg-emerald-500/80';
                              return (
                                   <div key={stage} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <div className="font-bold text-slate-300 text-sm transition-opacity">{count}</div>
                                        <div className="w-12 bg-slate-800/50 rounded-t border-t border-slate-700/50 flex justify-center relative overflow-hidden" style={{ height: '100%' }}>
                                             <div className={`w-full ${color} rounded-t absolute bottom-0 transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.5)] border-t border-white/20`} style={{ height: `${height}%` }}></div>
                                        </div>
                                        <div className="text-[10px] uppercase text-slate-500 font-bold w-full text-center truncate px-1" title={stage}>{stage}</div>
                                   </div>
                              );
                         })}
                    </div>
               </div>

               {/* Escalation Heat Indicator */}
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 opacity-5">
                         <TrendingUp size={150} />
                    </div>
                    <h3 className="text-slate-300 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-6 self-start">
                         <TrendingUp size={16} className="text-rose-500" />
                         Escalation Heat
                    </h3>
                    <div className="flex items-center gap-8 z-10 w-full justify-center">
                         <div className="relative">
                              <div className="w-24 h-24 rounded-full border-8 border-slate-800 flex items-center justify-center bg-slate-950 shadow-inner">
                                   <div className={`absolute inset-[-4px] rounded-full border-4 border-rose-500 border-t-transparent ${escalationCount > 0 ? 'animate-spin-slow opacity-100' : 'opacity-0'}`}></div>
                                   <span className={`text-3xl font-bold ${escalationCount > 0 ? 'text-rose-500' : 'text-slate-600'}`}>{escalationCount}</span>
                              </div>
                         </div>
                         <div>
                              <p className="text-slate-400 text-sm max-w-[150px] leading-relaxed">
                                   Incidents tracking <span className="text-white font-bold">3 or more</span> recursive occurrences.
                              </p>
                         </div>
                    </div>
               </div>

          </div>
     );
}

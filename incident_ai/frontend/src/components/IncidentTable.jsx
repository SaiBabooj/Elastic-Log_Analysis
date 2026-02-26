import { useState, useMemo } from 'react';
import { Search, Shield, AlertCircle, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export default function IncidentTable({ incidents, onUpdateStage, onRowClick }) {
     const [search, setSearch] = useState('');
     const [severityFilter, setSeverityFilter] = useState('ALL');
     const [stageFilter, setStageFilter] = useState('ALL');
     const [repeatFilter, setRepeatFilter] = useState('ALL');
     const [sortOrder, setSortOrder] = useState('DESC');

     const filteredIncidents = useMemo(() => {
          let result = incidents.filter(i => {
               const matchSearch = search ?
                    i.source_ip?.includes(search) ||
                    i.threat_type?.toLowerCase().includes(search.toLowerCase())
                    : true;
               const matchSeverity = severityFilter !== 'ALL' ? i.severity === severityFilter : true;
               const matchStage = stageFilter !== 'ALL' ? i.incident_stage === stageFilter : true;
               const matchRepeat = repeatFilter !== 'ALL' ?
                    (repeatFilter === 'YES' ? i.repeat_offender : !i.repeat_offender)
                    : true;

               return matchSearch && matchSeverity && matchStage && matchRepeat;
          });

          return result.sort((a, b) => {
               const dateA = new Date(a['@timestamp']).getTime();
               const dateB = new Date(b['@timestamp']).getTime();
               return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
          });
     }, [incidents, search, severityFilter, stageFilter, repeatFilter, sortOrder]);

     const severityColor = (sev) => {
          switch (sev) {
               case 'CRITICAL': return 'bg-red-500/20 text-red-500 border-red-500/30';
               case 'HIGH': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
               case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
               case 'LOW': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
               default: return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
          }
     };

     const stageColor = (stage) => {
          switch (stage) {
               case 'OPEN': return 'text-red-400 flex items-center gap-1';
               case 'INVESTIGATING': return 'text-orange-400 flex items-center gap-1';
               case 'RESOLVED': return 'text-emerald-400 flex items-center gap-1';
               default: return 'text-slate-400 flex items-center gap-1';
          }
     };

     const StageIcon = ({ stage }) => {
          switch (stage) {
               case 'OPEN': return <AlertCircle size={14} />;
               case 'INVESTIGATING': return <RefreshCw size={14} className="animate-spin-slow" />;
               case 'RESOLVED': return <CheckCircle size={14} />;
               default: return null;
          }
     };

     return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full shadow-2xl">
               <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-slate-800/50 rounded-t-xl">
                    <div className="relative flex-1 min-w-[250px]">
                         <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                         <input
                              type="text"
                              placeholder="Search IP or Threat Type..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                         />
                    </div>

                    <div className="flex flex-wrap gap-3">
                         <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity:</span>
                              <select
                                   className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
                                   value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
                              >
                                   <option value="ALL">All Levels</option>
                                   <option value="CRITICAL">Critical</option>
                                   <option value="HIGH">High</option>
                                   <option value="MEDIUM">Medium</option>
                                   <option value="LOW">Low</option>
                              </select>
                         </div>

                         <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stage:</span>
                              <select
                                   className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
                                   value={stageFilter} onChange={e => setStageFilter(e.target.value)}
                              >
                                   <option value="ALL">All</option>
                                   <option value="OPEN">Open</option>
                                   <option value="INVESTIGATING">Investigating</option>
                                   <option value="RESOLVED">Resolved</option>
                              </select>
                         </div>

                         <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type:</span>
                              <select
                                   className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
                                   value={repeatFilter} onChange={e => setRepeatFilter(e.target.value)}
                              >
                                   <option value="ALL">All</option>
                                   <option value="YES">Repeats</option>
                                   <option value="NO">First-Time</option>
                              </select>
                         </div>

                         <button
                              onClick={() => setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
                              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 transition-colors flex items-center gap-2 font-medium"
                         >
                              <Clock size={16} className="text-blue-400" />
                              {sortOrder === 'DESC' ? 'Newest First' : 'Oldest First'}
                         </button>
                    </div>
               </div>

               <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                         <thead>
                              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                                   <th className="p-4 font-medium">Threat Info</th>
                                   <th className="p-4 font-medium">Source IP</th>
                                   <th className="p-4 font-medium">Severity</th>
                                   <th className="p-4 font-medium">Stage</th>
                                   <th className="p-4 font-medium">MITRE & Context</th>
                                   <th className="p-4 font-medium text-right">Actions</th>
                              </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-800/50">
                              {filteredIncidents.length === 0 ? (
                                   <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500">
                                             <Shield size={48} className="mx-auto mb-3 opacity-20" />
                                             <p>No incidents match the given criteria.</p>
                                        </td>
                                   </tr>
                              ) : (
                                   filteredIncidents.map(incident => (
                                        <tr
                                             key={incident._id}
                                             className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                                             onClick={() => onRowClick(incident)}
                                        >
                                             <td className="p-4">
                                                  <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">{incident.threat_type}</div>
                                                  <div className="text-xs text-slate-500 mt-1">
                                                       {new Date(incident['@timestamp']).toLocaleString()}
                                                  </div>
                                             </td>
                                             <td className="p-4 text-slate-300 font-mono text-sm">{incident.source_ip}</td>
                                             <td className="p-4">
                                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${severityColor(incident.severity)}`}>
                                                       {incident.severity}
                                                  </span>
                                             </td>
                                             <td className="p-4">
                                                  <span className={`text-sm font-medium ${stageColor(incident.incident_stage)}`}>
                                                       <StageIcon stage={incident.incident_stage} />
                                                       {incident.incident_stage}
                                                  </span>
                                             </td>
                                             <td className="p-4">
                                                  <div className="flex flex-wrap gap-2">
                                                       {incident.mitre?.technique && (
                                                            <span className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded">
                                                                 {incident.mitre.technique}
                                                            </span>
                                                       )}
                                                       {incident.repeat_offender && (
                                                            <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs rounded font-medium">
                                                                 Repeat
                                                            </span>
                                                       )}
                                                       {incident.occurrence_count >= 3 && (
                                                            <span className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs rounded font-medium animate-pulse">
                                                                 Escalation x{incident.occurrence_count}
                                                            </span>
                                                       )}
                                                  </div>
                                             </td>
                                             <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                                                  <div className="flex justify-end gap-2">
                                                       {incident.incident_stage === 'OPEN' && (
                                                            <button
                                                                 onClick={() => onUpdateStage(incident._id, 'INVESTIGATING')}
                                                                 className="bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-600/30 px-3 py-1.5 rounded text-xs font-medium transition-all"
                                                            >
                                                                 Investigate
                                                            </button>
                                                       )}
                                                       {(incident.incident_stage === 'OPEN' || incident.incident_stage === 'INVESTIGATING') && (
                                                            <button
                                                                 onClick={() => onUpdateStage(incident._id, 'RESOLVED')}
                                                                 className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/30 px-3 py-1.5 rounded text-xs font-medium transition-all"
                                                            >
                                                                 Resolve
                                                            </button>
                                                       )}
                                                  </div>
                                             </td>
                                        </tr>
                                   ))
                              )}
                         </tbody>
                    </table>
               </div>
          </div>
     );
}

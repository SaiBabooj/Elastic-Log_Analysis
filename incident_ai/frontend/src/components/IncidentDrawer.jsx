import { useState, useEffect } from 'react';
import { X, Network, BrainCircuit, Activity, ShieldCheck, History, Info, GitCommit, FileText, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react';

export default function IncidentDrawer({ incident, onClose, onUpdateStage }) {
     const [analystNote, setAnalystNote] = useState('');
     const [isUpdating, setIsUpdating] = useState(false);

     useEffect(() => {
          if (incident) {
               // eslint-disable-next-line react-hooks/set-state-in-effect
               setAnalystNote('');
               // eslint-disable-next-line react-hooks/set-state-in-effect
               setIsUpdating(false);
          }
     }, [incident]);
     const severityColor = (sev) => {
          switch (sev) {
               case 'CRITICAL': return 'bg-red-500/20 text-red-500 border-red-500/30';
               case 'HIGH': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
               case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
               case 'LOW': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
               default: return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
          }
     };

     const isEscalation = incident?.occurrence_count >= 3;

     return (
          <>
               {/* Dimmed Backdrop */}
               <div
                    className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${incident ? "opacity-100 visible" : "opacity-0 invisible"
                         }`}
                    onClick={onClose}
               />

               {/* Slide-in Drawer */}
               <div
                    className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] md:w-[650px] lg:w-[750px] bg-[#0c0e12] border-l border-slate-700 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${incident ? "translate-x-0" : "translate-x-full"
                         }`}
               >
                    {incident && (
                         <>
                              {/* 1. Header Section */}
                              <div className="px-6 py-5 flex justify-between items-start bg-slate-900/80 border-b border-slate-800">
                                   <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                             <h2 className="text-2xl font-bold tracking-wide text-white truncate" title={incident.threat_type}>
                                                  {incident.threat_type}
                                             </h2>
                                             <span className={`px-2.5 py-1 rounded text-xs font-bold border ${severityColor(incident.severity)}`}>
                                                  {incident.severity}
                                             </span>
                                             <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-800 border border-slate-600 text-slate-300">
                                                  {incident.incident_stage}
                                             </span>
                                        </div>
                                        <div className="text-slate-400 text-sm font-mono flex items-center gap-2">
                                             <span>ID: {incident._id}</span>
                                             <span className="text-slate-600">|</span>
                                             <span>{new Date(incident['@timestamp']).toLocaleString()}</span>
                                        </div>
                                   </div>
                                   <button
                                        onClick={onClose}
                                        className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 px-3 py-2 rounded-lg shrink-0"
                                   >
                                        <X size={20} />
                                   </button>
                              </div>

                              {/* Scrollable Body Content */}
                              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                                   {/* 2. Core Metadata Card Grid */}
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                                             <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                  <Network size={16} /> <span className="text-xs uppercase tracking-wider font-semibold">Source IP</span>
                                             </div>
                                             <div className="font-mono text-lg text-slate-200 truncate" title={incident.source_ip}>{incident.source_ip || 'N/A'}</div>
                                        </div>
                                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                                             <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                  <ShieldCheck size={16} /> <span className="text-xs uppercase tracking-wider font-semibold">User</span>
                                             </div>
                                             <div className="font-mono text-lg text-slate-200 truncate" title={incident.user}>{incident.user || 'Unknown'}</div>
                                        </div>
                                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                                             <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                  <Activity size={16} /> <span className="text-xs uppercase tracking-wider font-semibold">Risk Score</span>
                                             </div>
                                             <div className={`text-xl font-bold ${incident.risk_score >= 90 ? 'text-red-500' : incident.risk_score >= 70 ? 'text-orange-400' : 'text-yellow-400'}`}>
                                                  {incident.risk_score}/100
                                             </div>
                                        </div>
                                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 relative overflow-hidden">
                                             <div className="flex items-center gap-2 text-slate-400 mb-2 relative z-10">
                                                  <History size={16} /> <span className="text-xs uppercase tracking-wider font-semibold">Occurrences</span>
                                             </div>
                                             <div className="flex flex-wrap items-center gap-2 relative z-10">
                                                  <span className="text-xl font-bold text-slate-200">{incident.occurrence_count || 1}</span>
                                                  <div className="flex flex-col gap-1">
                                                       {incident.repeat_offender && (
                                                            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">Repeat</span>
                                                       )}
                                                       {isEscalation && (
                                                            <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">Escalation</span>
                                                       )}
                                                  </div>
                                             </div>
                                             {isEscalation && <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>}
                                        </div>
                                   </div>

                                   {/* 3. MITRE ATT&CK Section */}
                                   {incident.mitre && (
                                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                             <div className="bg-slate-800/50 p-3 px-4 flex items-center gap-2 border-b border-slate-800">
                                                  <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">MITRE ATT&CK Context</h3>
                                                  <Info size={14} className="text-slate-500 cursor-help" title="MITRE ATT&CK categorization enriched by AI" />
                                             </div>
                                             <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/50">
                                                  <div>
                                                       <div className="text-xs uppercase font-bold text-slate-500 mb-1.5">Tactic</div>
                                                       <div className="font-medium text-slate-300 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">{incident.mitre.tactic || 'N/A'}</div>
                                                  </div>
                                                  <div>
                                                       <div className="text-xs uppercase font-bold text-slate-500 mb-1.5">Technique</div>
                                                       <div className="font-mono text-sm text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">{incident.mitre.technique || 'N/A'}</div>
                                                  </div>
                                                  <div>
                                                       <div className="text-xs uppercase font-bold text-slate-500 mb-1.5">Confidence Level</div>
                                                       <div className="font-medium text-slate-300 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
                                                            {incident.mitre.confidence ? (incident.mitre.confidence * 100).toFixed(0) + '%' : 'N/A'}
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {/* 4. AI Investigation Section */}
                                   {incident.ai_analysis && (
                                        <div className="bg-blue-950/10 border border-blue-900/30 rounded-xl overflow-hidden relative">
                                             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                  <BrainCircuit size={100} />
                                             </div>
                                             <div className="bg-blue-900/20 p-3 px-4 border-b border-blue-900/30 flex items-center gap-2">
                                                  <BrainCircuit className="text-blue-400" size={18} />
                                                  <h3 className="font-bold text-blue-300 uppercase tracking-wider text-sm">AI Analyst Insights</h3>
                                             </div>
                                             <div className="p-5 space-y-6 relative z-10">
                                                  <div>
                                                       <h4 className="flex items-center gap-2 text-xs uppercase text-blue-400/80 font-bold mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Executive Summary
                                                       </h4>
                                                       <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                                                            {incident.ai_analysis.summary || 'Analysis summary currently unavailable.'}
                                                       </p>
                                                  </div>
                                                  <div>
                                                       <h4 className="flex items-center gap-2 text-xs uppercase text-orange-400/80 font-bold mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Potential Impact
                                                       </h4>
                                                       <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                                                            {incident.ai_analysis.impact || 'Impact analysis currently unavailable.'}
                                                       </p>
                                                  </div>
                                                  {incident.ai_analysis.remediation && incident.ai_analysis.remediation.length > 0 && (
                                                       <div>
                                                            <h4 className="flex items-center gap-2 text-xs uppercase text-emerald-400/80 font-bold mb-3">
                                                                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Remediation Guide
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                 {incident.ai_analysis.remediation.map((step, idx) => (
                                                                      <li key={idx} className="flex gap-3 text-sm text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                                                                           <span className="text-slate-500 font-mono mt-0.5">{idx + 1}.</span>
                                                                           <span className="leading-relaxed">{step}</span>
                                                                      </li>
                                                                 ))}
                                                            </ul>
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   )}

                                   {/* 4.5 Deep Investigation Section */}
                                   {incident.deep_investigation && (
                                        <div className="bg-purple-950/10 border border-purple-900/30 rounded-xl overflow-hidden relative">
                                             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                  <FileText size={100} />
                                             </div>
                                             <div className="bg-purple-900/20 p-3 px-4 border-b border-purple-900/30 flex items-center gap-2">
                                                  <FileText className="text-purple-400" size={18} />
                                                  <h3 className="font-bold text-purple-300 uppercase tracking-wider text-sm">Deep Investigation Findings</h3>
                                             </div>
                                             <div className="p-5 space-y-6 relative z-10">
                                                  <div>
                                                       <h4 className="flex items-center gap-2 text-xs uppercase text-purple-400/80 font-bold mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Attack Path Analysis
                                                       </h4>
                                                       <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                                                            {incident.deep_investigation.attack_path_analysis || 'N/A'}
                                                       </p>
                                                  </div>
                                                  <div>
                                                       <h4 className="flex items-center gap-2 text-xs uppercase text-emerald-400/80 font-bold mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Containment Strategy
                                                       </h4>
                                                       <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                                                            {incident.deep_investigation.containment_strategy || 'N/A'}
                                                       </p>
                                                  </div>
                                                  <div>
                                                       <h4 className="flex items-center gap-2 text-xs uppercase text-red-400/80 font-bold mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Risk If Ignored
                                                       </h4>
                                                       <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                                                            {incident.deep_investigation.risk_if_ignored || 'N/A'}
                                                       </p>
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {/* 4.75 Closure Report Section */}
                                   {incident.incident_stage === 'RESOLVED' && incident.closure_report && (
                                        <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl overflow-hidden relative">
                                             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                  <CheckCircle size={100} />
                                             </div>
                                             <div className="bg-emerald-900/20 p-3 px-4 border-b border-emerald-900/30 flex items-center gap-2">
                                                  <CheckCircle className="text-emerald-400" size={18} />
                                                  <h3 className="font-bold text-emerald-300 uppercase tracking-wider text-sm">Incident Closure Report</h3>
                                             </div>
                                             <div className="p-5 space-y-6 relative z-10">
                                                  <div>
                                                       <h4 className="flex items-center gap-2 text-xs uppercase text-emerald-400/80 font-bold mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Executive Summary
                                                       </h4>
                                                       <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                                                            {incident.closure_report.executive_summary || 'N/A'}
                                                       </p>
                                                  </div>
                                                  <div>
                                                       <h4 className="flex items-center gap-2 text-xs uppercase text-emerald-400/80 font-bold mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Response Actions Taken
                                                       </h4>
                                                       <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                                                            {incident.closure_report.response_actions_taken || 'N/A'}
                                                       </p>
                                                  </div>
                                                  <div>
                                                       <h4 className="flex items-center gap-2 text-xs uppercase text-orange-400/80 font-bold mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Residual Risk
                                                       </h4>
                                                       <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                                                            {incident.closure_report.residual_risk || 'N/A'}
                                                       </p>
                                                  </div>
                                                  <div>
                                                       <h4 className="flex items-center gap-2 text-xs uppercase text-blue-400/80 font-bold mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Lessons Learned
                                                       </h4>
                                                       <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                                                            {incident.closure_report.lessons_learned || 'N/A'}
                                                       </p>
                                                  </div>
                                                  <div className="text-right text-xs text-emerald-500/50 font-mono">
                                                       Generated at: {new Date(incident.closure_report.generated_at).toLocaleString()}
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {/* 5. Lifecycle Timeline Section */}
                                   {incident.history && incident.history.length > 0 && (
                                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                             <div className="bg-slate-800/50 p-3 px-4 border-b border-slate-800 flex items-center gap-2">
                                                  <History className="text-slate-400" size={16} />
                                                  <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">Lifecycle Audit Trail</h3>
                                             </div>
                                             <div className="p-6">
                                                  <div className="space-y-6">
                                                       {incident.history.map((hist, idx) => {
                                                            const isLast = idx === incident.history.length - 1;
                                                            return (
                                                                 <div key={idx} className="flex gap-4 relative group">
                                                                      {/* Line connecting nodes */}
                                                                      {!isLast && (
                                                                           <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-700 group-hover:bg-slate-600 transition-colors"></div>
                                                                      )}

                                                                      {/* Timeline Node */}
                                                                      <div className="relative z-10 mt-1 flex-shrink-0">
                                                                           <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                                                                                <GitCommit size={14} className="text-slate-400" />
                                                                           </div>
                                                                      </div>

                                                                      {/* Timeline Content */}
                                                                      <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 flex-1">
                                                                           <div className="flex flex-wrap items-center justify-between gap-4 mb-1">
                                                                                <span className={`font-bold text-sm ${hist.stage === 'RESOLVED' ? 'text-emerald-400' : hist.stage === 'INVESTIGATING' ? 'text-orange-400' : 'text-slate-200'}`}>
                                                                                     {hist.stage}
                                                                                </span>
                                                                                <span className="text-xs font-mono text-slate-500">
                                                                                     {new Date(hist.timestamp).toLocaleString()}
                                                                                </span>
                                                                           </div>
                                                                           {hist.notes && <p className="text-sm text-slate-400 mt-2 bg-slate-900/50 p-2 rounded border border-slate-800">{hist.notes}</p>}
                                                                      </div>
                                                                 </div>
                                                            );
                                                       })}
                                                  </div>
                                             </div>
                                        </div>
                                   )}
                              </div>

                              {/* 6. Analyst Notes & Action Section (Footer) */}
                              <div className="border-t border-slate-800 bg-slate-900/80 shrink-0">
                                   {incident.incident_stage === 'OPEN' && (
                                        <div className="p-4 px-6 border-b border-slate-800/50 bg-slate-950/30">
                                             <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                  <MessageSquare size={14} /> Analyst Notes Before Investigation
                                             </label>
                                             <textarea
                                                  value={analystNote}
                                                  onChange={(e) => setAnalystNote(e.target.value)}
                                                  placeholder="Document initial findings, suspicious behavior, or rationale for investigating..."
                                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all custom-scrollbar min-h-[80px]"
                                             />
                                        </div>
                                   )}
                                   <div className="p-4 px-6 flex flex-wrap justify-end gap-3">
                                        {incident.incident_stage === 'OPEN' && (
                                             <button
                                                  onClick={async () => {
                                                       setIsUpdating(true);
                                                       await onUpdateStage(incident._id, 'INVESTIGATING', analystNote ? `Analyst Notes: ${analystNote}` : 'Stage updated to INVESTIGATING via UI.');
                                                       onClose();
                                                  }}
                                                  disabled={isUpdating}
                                                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:shadow-[0_0_20px_rgba(234,88,12,0.5)] transform hover:-translate-y-0.5"
                                             >
                                                  {isUpdating ? 'Initiating Deep Scan...' : 'Start Deep Investigation'}
                                             </button>
                                        )}
                                        {(incident.incident_stage === 'OPEN' || incident.incident_stage === 'INVESTIGATING') && (
                                             <button
                                                  onClick={async () => {
                                                       setIsUpdating(true);
                                                       await onUpdateStage(incident._id, 'RESOLVED', 'Incident manually resolved by analyst.');
                                                       onClose();
                                                  }}
                                                  disabled={isUpdating}
                                                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(5,150,105,0.3)] hover:shadow-[0_0_20px_rgba(5,150,105,0.5)] transform hover:-translate-y-0.5"
                                             >
                                                  Mark as Resolved
                                             </button>
                                        )}
                                        {incident.incident_stage === 'RESOLVED' && (
                                             <div className="flex items-center gap-2 text-emerald-500 font-bold px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                  ✓ Incident Resolved
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </>
                    )}
               </div >
          </>
     );
}

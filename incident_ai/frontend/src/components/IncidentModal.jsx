import { X, Network, BrainCircuit, Activity, ShieldCheck, History } from 'lucide-react';

export default function IncidentModal({ incident, onClose, onUpdateStage }) {
     if (!incident) return null;

     return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-800/30">
                         <div>
                              <div className="flex items-center gap-3 mb-1">
                                   <h2 className="text-2xl font-bold text-white">{incident.threat_type}</h2>
                                   <span className={`px-2 py-1 rounded text-xs font-bold border ${incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500 border-red-500/30' : incident.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'}`}>
                                        {incident.severity}
                                   </span>
                                   <span className="px-2 py-1 rounded text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300">
                                        {incident.incident_stage}
                                   </span>
                              </div>
                              <p className="text-slate-400 text-sm font-mono">ID: {incident._id} | Time: {new Date(incident['@timestamp']).toLocaleString()}</p>
                         </div>
                         <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 p-2 rounded-lg">
                              <X size={20} />
                         </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">

                         {/* Quick Stats Grid */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                                   <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Network size={16} /> <span className="text-xs uppercase font-semibold">Source IP</span>
                                   </div>
                                   <div className="font-mono text-lg text-slate-200">{incident.source_ip}</div>
                              </div>
                              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                                   <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <ShieldCheck size={16} /> <span className="text-xs uppercase font-semibold">User</span>
                                   </div>
                                   <div className="font-mono text-lg text-slate-200">{incident.user || 'Unknown'}</div>
                              </div>
                              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                                   <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Activity size={16} /> <span className="text-xs uppercase font-semibold">Occurrences</span>
                                   </div>
                                   <div className="text-lg font-bold text-slate-200">{incident.occurrence_count || 1}
                                        {incident.repeat_offender && <span className="ml-2 text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Repeat</span>}
                                   </div>
                              </div>
                              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                                   <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Activity size={16} /> <span className="text-xs uppercase font-semibold">Risk Score</span>
                                   </div>
                                   <div className={`text-lg font-bold ${incident.risk_score > 80 ? 'text-red-400' : 'text-orange-400'}`}>{incident.risk_score}/100</div>
                              </div>
                         </div>

                         {/* AI Analysis Section */}
                         {incident.ai_analysis && (
                              <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl overflow-hidden">
                                   <div className="bg-blue-900/20 p-3 px-4 border-b border-blue-900/30 flex items-center gap-2">
                                        <BrainCircuit className="text-blue-400" size={18} />
                                        <h3 className="font-bold text-blue-300">AI Context & Analysis</h3>
                                   </div>
                                   <div className="p-5 space-y-4">
                                        <div>
                                             <h4 className="text-xs uppercase text-slate-500 font-bold mb-1">Exec Summary</h4>
                                             <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">{incident.ai_analysis.summary || 'No summary available.'}</p>
                                        </div>
                                        <div>
                                             <h4 className="text-xs uppercase text-slate-500 font-bold mb-1">Potential Impact</h4>
                                             <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">{incident.ai_analysis.impact || 'Unknown impact.'}</p>
                                        </div>
                                        {incident.ai_analysis.remediation && (
                                             <div>
                                                  <h4 className="text-xs uppercase text-slate-500 font-bold mb-2">Remediation Steps</h4>
                                                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                                       {incident.ai_analysis.remediation.map((step, idx) => (
                                                            <li key={idx} className="text-slate-200">{step}</li>
                                                       ))}
                                                  </ul>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         )}

                         {/* Mitre Matrix */}
                         {incident.mitre && (
                              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                                   <div className="bg-slate-800/50 p-3 px-4 border-b border-slate-700/50">
                                        <h3 className="font-bold text-slate-200 text-sm uppercase">MITRE ATT&CK Mapping</h3>
                                   </div>
                                   <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                             <div className="text-xs text-slate-500 mb-1">Tactic</div>
                                             <div className="font-medium text-slate-300">{incident.mitre.tactic || 'N/A'}</div>
                                        </div>
                                        <div>
                                             <div className="text-xs text-slate-500 mb-1">Technique</div>
                                             <div className="font-medium text-slate-300 bg-slate-800 inline-block px-2 py-1 rounded border border-slate-600">{incident.mitre.technique || 'N/A'}</div>
                                        </div>
                                        <div>
                                             <div className="text-xs text-slate-500 mb-1">Confidence</div>
                                             <div className="font-medium text-slate-300">{(incident.mitre.confidence * 100).toFixed(0)}%</div>
                                        </div>
                                   </div>
                              </div>
                         )}

                         {/* History */}
                         {incident.history && incident.history.length > 0 && (
                              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                                   <div className="bg-slate-800/50 p-3 px-4 border-b border-slate-700/50 flex items-center gap-2">
                                        <History className="text-slate-400" size={16} />
                                        <h3 className="font-bold text-slate-200 text-sm uppercase">Lifecycle History</h3>
                                   </div>
                                   <div className="p-4">
                                        <div className="space-y-4">
                                             {incident.history.map((hist, idx) => (
                                                  <div key={idx} className="flex gap-4 relative">
                                                       {idx !== incident.history.length - 1 && <div className="absolute left-[7px] top-5 bottom-[-16px] w-[2px] bg-slate-700"></div>}
                                                       <div className="w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-900 relative z-10 mt-1 flex-shrink-0"></div>
                                                       <div>
                                                            <div className="flex items-center gap-2">
                                                                 <span className="font-bold text-sm text-slate-200">{hist.stage}</span>
                                                                 <span className="text-xs text-slate-500">{new Date(hist.timestamp).toLocaleString()}</span>
                                                            </div>
                                                            {hist.notes && <p className="text-sm text-slate-400 mt-1">{hist.notes}</p>}
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              </div>
                         )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                         {incident.incident_stage === 'OPEN' && (
                              <button
                                   onClick={() => { onUpdateStage(incident._id, 'INVESTIGATING'); onClose(); }}
                                   className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-orange-900/20"
                              >
                                   Start Investigation
                              </button>
                         )}
                         {(incident.incident_stage === 'OPEN' || incident.incident_stage === 'INVESTIGATING') && (
                              <button
                                   onClick={() => { onUpdateStage(incident._id, 'RESOLVED'); onClose(); }}
                                   className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20"
                              >
                                   Mark as Resolved
                              </button>
                         )}
                         <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                              Close
                         </button>
                    </div>
               </div>
          </div>
     );
}

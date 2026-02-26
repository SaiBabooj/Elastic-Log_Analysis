import { useEffect, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import MetricsCards from "./components/MetricsCards";
import IncidentTable from "./components/IncidentTable";
import IncidentDrawer from "./components/IncidentDrawer";
import AnalyticsCharts from "./components/AnalyticsCharts";
import { AlertOctagon, RefreshCw, Shield, CheckCircle, AlertCircle } from "lucide-react";

// The required styling rules from tailwind to make sure everything spins/blinks smoothly
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
`;
document.head.appendChild(style);

function App() {
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState({ total_incidents: 0, high_severity: 0, critical_severity: 0 });
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTriggering, setIsTriggering] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/incidents`);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
        setLastRefresh(new Date());
      }
    } catch (e) {
      console.error("Failed to fetch incidents", e);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/metrics`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchMetrics();

    const interval = setInterval(() => {
      fetchIncidents();
      fetchMetrics();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchIncidents, fetchMetrics]);

  const updateStage = async (id, newStage, notes = "Stage updated via UI action") => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/incidents/${id}/update-stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_stage: newStage,
          notes: notes,
        }),
      });
      // Optimistic refresh
      fetchIncidents();
      fetchMetrics();
    } catch (e) {
      console.error("Failed to update incident stage", e);
    }
  };

  const handleManualTrigger = async () => {
    setIsTriggering(true);
    setToast(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/run-detection`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setToast({
          type: 'success',
          message: data.status === 'NO_INCIDENT' || data.status === 'NO_THREAT' || data.status === 'DUPLICATE_SKIPPED'
            ? `Engine executed: ${data.message || 'No new incidents detected at this time.'}`
            : `Engine executed: Threat escalated! (${data.threat_type || 'New'})`
        });
      } else {
        setToast({ type: 'error', message: 'Failed to run detection pipeline. API returned an error.' });
      }
      await fetchIncidents();
      await fetchMetrics();
    } catch (e) {
      console.error("Failed manual trigger", e);
      setToast({ type: 'error', message: 'Network error. Engine could not be reached.' });
    } finally {
      setIsTriggering(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0c10] text-slate-300 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopNav lastRefresh={lastRefresh} />

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-24">

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {metrics.critical_severity > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-xl flex items-center gap-4 animate-pulse shadow-lg shadow-red-500/10">
                  <AlertOctagon size={28} />
                  <div>
                    <h3 className="font-bold text-lg">CRITICAL ALERTS ACTIVE</h3>
                    <p className="text-sm text-red-400">There are {metrics.critical_severity} critical incidents demanding immediate response.</p>
                  </div>
                </div>
              )}

              <MetricsCards metrics={metrics} />

              <div className="h-[calc(100vh-320px)] min-h-[400px]">
                <IncidentTable
                  incidents={incidents}
                  onUpdateStage={updateStage}
                  onRowClick={(inc) => setSelectedIncident(inc)}
                />
              </div>
            </div>
          )}

          {/* Other Tabs placeholders */}
          {activeTab === 'incidents' && (
            <div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
              <IncidentTable
                incidents={incidents}
                onUpdateStage={updateStage}
                onRowClick={(inc) => setSelectedIncident(inc)}
              />
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="max-w-7xl mx-auto space-y-6 lg:max-w-4xl pt-4">
              <h2 className="text-2xl font-bold mb-4 text-white">Security Posture Analytics</h2>
              <AnalyticsCharts incidents={incidents} />
            </div>
          )}

          {activeTab === 'trigger' && (
            <div className="max-w-3xl mx-auto mt-10 p-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-center relative">
                <div className="bg-blue-900/10 p-10 border-b border-slate-800">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <Shield size={36} className="text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 text-white tracking-wide">Manual Detection Orchestrator</h2>
                  <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Manually execute the SOC analytic pipeline. This will force ingestion of recent logs, perform AI heuristic evaluations, and orchestrate new incidents.
                  </p>
                </div>

                <div className="p-10 bg-slate-900/50">
                  <button
                    onClick={handleManualTrigger}
                    disabled={isTriggering}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:shadow-none text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3 mx-auto w-full max-w-sm text-lg border border-blue-500"
                  >
                    {isTriggering ? (
                      <>
                        <RefreshCw className="animate-spin-slow" size={20} />
                        Executing Pipeline...
                      </>
                    ) : (
                      <>
                        <AlertOctagon size={20} />
                        Run SOAR Engine Now
                      </>
                    )}
                  </button>

                  {toast && (
                    <div className={`mt-8 p-4 rounded-xl font-medium border flex items-center justify-center gap-3 max-w-md mx-auto shadow-lg transition-all animate-in zoom-in-95 ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5'}`}>
                      {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      {toast.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <IncidentDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdateStage={updateStage}
      />
    </div>
  );
}

export default App;
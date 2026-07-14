import React, { useState, useEffect } from 'react';
import { LiveData } from '../types';
import { triggerAlert, sendChatMessage } from '../api';
import {
  Activity, Users, AlertTriangle, Leaf,
  TrendingUp, RefreshCw, Send, CheckCircle2
} from 'lucide-react';

interface OrganizerDashboardProps {
  liveData: LiveData | null;
  onRefresh: () => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ liveData, onRefresh }) => {
  const [alertTitle, setAlertTitle] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'Info' | 'Warning' | 'Critical'>('Warning');
  const [alertStatus, setAlertStatus] = useState<string | null>(null);

  // Volunteer state locally managed (initialized from liveData, and adjustable)
  const [volunteerAlloc, setVolunteerAlloc] = useState<Record<string, number>>({});
  // AI summary state
  const [aiSummary, setAiSummary] = useState<string>('Click "Generate Summary" to run an automated Gemini stadium audit.');
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    if (liveData && Object.keys(volunteerAlloc).length === 0) {
      setVolunteerAlloc(liveData.volunteers.zones);
    }
  }, [liveData]);

  if (!liveData) return null;

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim()) return;
    try {
      await triggerAlert(alertSeverity, alertTitle.trim());
      setAlertStatus('Alert broadcasted successfully. Fans are notified.');
      setAlertTitle('');
      onRefresh(); // Trigger update immediately
      setTimeout(() => setAlertStatus(null), 5000);
    } catch (err) {
      setAlertStatus('Error broadcasting alert.');
    }
  };

  const reallocateVolunteer = (fromZone: string, toZone: string) => {
    if ((volunteerAlloc[fromZone] || 0) <= 0) return;
    setVolunteerAlloc((prev) => ({
      ...prev,
      [fromZone]: (prev[fromZone] || 0) - 5,
      [toZone]: (prev[toZone] || 0) + 5,
    }));
  };

  const generateAISummary = async () => {
    setGeneratingAi(true);
    try {
      const prompt = "Perform a stadium logistics audit. Detail any high-occupancy stands, bottleneck gates (wait time > 15m), and recommend concrete volunteer or steward adjustments.";
      const res = await sendChatMessage(prompt, "organizer");
      setAiSummary(res.response);
    } catch (e) {
      setAiSummary("Unable to contact Gemini API. Offline fallback suggestion: Check Gate B wait times and consider shifting 10 volunteers from West Stand to Gate B to alleviate transit bottlenecks.");
    } finally {
      setGeneratingAi(false);
    }
  };

  // Compute total volunteers in local state
  const totalLocalVolunteers = Object.values(volunteerAlloc).reduce((a, b) => a + b, 0);

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Organizer Control Room</h2>
          <p className="text-sm text-slate-400 font-medium">
            Real-time control room telemetry, incident triggers, and AI coordination audits.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          Force Sync
        </button>
      </div>

      {/* Top Section: AI Summary Audit */}
      <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <h3 className="font-bold text-slate-100 text-sm">Automated AI Operational Audit</h3>
          </div>
          <button
            onClick={generateAISummary}
            disabled={generatingAi}
            className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10 disabled:opacity-50"
          >
            {generatingAi ? 'Analyzing Telemetry...' : 'Generate Gemini Audit'}
          </button>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900/80 text-xs leading-relaxed text-slate-350 font-semibold font-mono">
          {aiSummary}
        </div>
      </div>

      {/* Middle Row: Visual Graphs & Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crowd Density Heatmap Representation */}
        <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-200 text-sm">Zone Traffic Densities</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              {liveData.crowd.occupancy_percentage}% Stadium Occupied
            </span>
          </div>

          {/* Visual representations of stands */}
          <div className="grid grid-cols-2 gap-4 py-4">
            {Object.entries(liveData.crowd.zones).map(([name, info]) => {
              const capRatio = info.occupancy / info.capacity;
              return (
                <div key={name} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-200">{name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      info.density === 'High' ? 'bg-red-500/10 text-red-400' :
                      info.density === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {info.density}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className={`h-full transition-all duration-500 ${
                        capRatio > 0.9 ? 'bg-red-500' : capRatio > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${capRatio * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {info.occupancy.toLocaleString()} / {info.capacity.toLocaleString()} spectators
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gate Wait Times SVG Bar Chart */}
        <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-200 text-sm">Gate Queues & Wait Times</h3>
          </div>

          {/* SVG Bar Chart */}
          <div className="flex-1 min-h-[160px] flex items-end justify-around border-b border-slate-850 pb-2 gap-4">
            {liveData.gates.map((gate) => {
              // Wait time ranges up to 30 mins
              const pct = Math.min(100, (gate.wait_time_minutes / 30) * 100);
              const color = gate.wait_time_minutes > 20 ? '#ef4444' : gate.wait_time_minutes > 10 ? '#f59e0b' : '#10b981';
              return (
                <div key={gate.id} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-[10px] font-bold text-slate-350">{gate.wait_time_minutes}m</div>
                  <div className="w-full bg-slate-950/60 rounded-t-lg border border-slate-850 h-28 flex items-end overflow-hidden">
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{ height: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate max-w-[65px]">{gate.id}</div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 leading-normal flex items-center justify-between">
            <span>Critical Bottleneck Threshold: 20 mins</span>
            <span className="font-bold text-emerald-400">Updates every 5 seconds</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Operations, Volunteers, Sustainability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations Emergency Alert Broadcaster */}
        <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-slate-200 text-sm">Broadcast Emergency Notice</h3>
          </div>

          {alertStatus && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{alertStatus}</span>
            </div>
          )}

          <form onSubmit={handleBroadcastAlert} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Alert Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Info', 'Warning', 'Critical'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setAlertSeverity(sev)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      alertSeverity === sev
                        ? sev === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400 glow-red' :
                          sev === 'Warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 glow-gold' :
                          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 glow-emerald'
                        : 'bg-slate-900/80 border-slate-850 text-slate-500'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Broadcast message</label>
              <textarea
                required
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="e.g. Shuttle Bus delay on Route 4 due to traffic. Route via Gate D..."
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-255 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-650 shadow-md shadow-red-500/10 border border-red-400/20 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Transmit Live Alert
            </button>
          </form>
        </div>

        {/* Volunteer Allocation Grid */}
        <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-200 text-sm">Volunteer Staffing</h3>
          </div>

          <div className="space-y-3.5">
            {Object.entries(volunteerAlloc).map(([zone, count]) => (
              <div key={zone} className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-200">{zone}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{count} Stewards allocated</p>
                </div>
                {/* Allocation control buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      // Decrease this zone and add to others
                      const otherZones = Object.keys(volunteerAlloc).filter(z => z !== zone);
                      if (otherZones.length > 0) {
                        const target = otherZones[Math.floor(Math.random() * otherZones.length)];
                        reallocateVolunteer(zone, target);
                      }
                    }}
                    className="w-7 h-7 bg-slate-900 hover:bg-slate-855 rounded-lg border border-slate-800 font-black text-slate-400 hover:text-white"
                    title="Transfer 5 out"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      // Transfer from another zone into this one
                      const otherZones = Object.keys(volunteerAlloc).filter(z => z !== zone && volunteerAlloc[z] > 5);
                      if (otherZones.length > 0) {
                        const source = otherZones[0];
                        reallocateVolunteer(source, zone);
                      }
                    }}
                    className="w-7 h-7 bg-slate-900 hover:bg-slate-855 rounded-lg border border-slate-800 font-black text-slate-400 hover:text-white"
                    title="Transfer 5 in"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-3">
            <span>Total Staff: {totalLocalVolunteers}</span>
            <span>Pending Requests: {liveData.volunteers.assistance_requests_pending}</span>
          </div>
        </div>

        {/* Sustainability Dashboard */}
        <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-200 text-sm">Sustainability Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Waste Recycled</span>
              <span className="text-sm font-extrabold text-slate-200 mt-1">{liveData.sustainability.waste_diverted_kg} kg</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Water Conserved</span>
              <span className="text-sm font-extrabold text-slate-200 mt-1">{liveData.sustainability.water_saved_liters} L</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Solar/Green Power</span>
              <span className="text-sm font-extrabold text-slate-200 mt-1">{liveData.sustainability.renewable_energy_kwh} kWh</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Carbon Offset</span>
              <span className="text-sm font-extrabold text-slate-200 mt-1">{liveData.sustainability.carbon_offset_kg} kg</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold rounded-xl text-emerald-400 text-center">
            🏟️ Stadium operating on 100% clean grid offset
          </div>
        </div>
      </div>
    </div>
  );
};

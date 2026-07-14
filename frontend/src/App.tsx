import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { FanDashboard } from './components/FanDashboard';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { getLiveData, getWeatherInfo } from './api';
import { LiveData, WeatherInfo } from './types';
import { ShieldAlert, BellRing, RefreshCw } from 'lucide-react';

function App() {
  const [role, setRole] = useState<'fan' | 'organizer'>('fan');
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [liveDataLoading, setLiveDataLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Function to load live stadium telemetry
  const loadLiveData = async (isPoll = false) => {
    if (isPoll) {
      setIsUpdating(true);
    }
    try {
      const data = await getLiveData();
      setLiveData(data);
      setSyncError(null);
    } catch (err) {
      console.error('Error syncing telemetry:', err);
      setSyncError('Telemetry Sync Lagging - Retrying...');
    } finally {
      setLiveDataLoading(false);
      setIsUpdating(false);
    }
  };

  // Function to load Dallas weather
  const loadWeather = async () => {
    try {
      const data = await getWeatherInfo();
      setWeather(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Poll live data every 5 seconds, load weather on mount
  useEffect(() => {
    loadLiveData();
    loadWeather();

    const interval = setInterval(() => {
      loadLiveData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Determine active alerts status for sidebar telemetry pulse
  const getSystemStatus = () => {
    if (!liveData) return 'Syncing';
    const hasCritical = liveData.alerts.some((a) => a.severity === 'Critical');
    return hasCritical ? 'Critical' : 'Healthy';
  };

  // Find any active critical emergency alerts to display in the header banner
  const criticalAlert = liveData?.alerts.find((a) => a.severity === 'Critical');
  const warningAlert = liveData?.alerts.find((a) => a.severity === 'Warning');

  return (
    <div className="min-h-screen bg-fifa-dark text-slate-100 flex relative overflow-x-hidden">
      {/* Decorative ambient glowing circles in the background */}
      <div className="absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <Sidebar
        role={role}
        setRole={setRole}
        isUpdating={isUpdating}
        status={getSystemStatus()}
      />

      {/* Main Panel Content Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Global Warning / Critical Broadcast Header Banners */}
        {criticalAlert && (
          <div className="bg-red-500 text-white font-bold text-xs py-3 px-6 flex items-center justify-between shadow-lg animate-pulse gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 animate-bounce shrink-0" />
              <span>EMERGENCY BROADCAST: {criticalAlert.title}</span>
            </div>
            <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded border border-white/20 uppercase tracking-widest font-black shrink-0">
              Evac Exit routes active
            </span>
          </div>
        )}

        {!criticalAlert && warningAlert && (
          <div className="bg-amber-500 text-slate-950 font-bold text-xs py-3 px-6 flex items-center justify-between shadow-lg gap-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 shrink-0" />
              <span>LOGISTICS NOTICE: {warningAlert.title}</span>
            </div>
            <span className="text-[10px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded border border-amber-400/25 uppercase tracking-widest font-black shrink-0">
              Traffic Advisory
            </span>
          </div>
        )}

        {/* Sync Syncing Alert Banner */}
        {syncError && (
          <div className="bg-slate-900 border-b border-slate-800 text-slate-400 py-1.5 px-6 text-center text-xs font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
            {syncError}
          </div>
        )}

        {/* Screen Switcher */}
        {liveDataLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3.5">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm font-semibold tracking-wide">Connecting to Dallas Stadium Operations Network...</p>
          </div>
        ) : role === 'fan' ? (
          <FanDashboard
            liveData={liveData}
            weather={weather}
            weatherLoading={weatherLoading}
          />
        ) : (
          <OrganizerDashboard
            liveData={liveData}
            onRefresh={() => loadLiveData(true)}
          />
        )}
      </main>
    </div>
  );
}

export default App;

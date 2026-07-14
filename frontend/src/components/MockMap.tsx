import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { LiveData } from '../types';
import { Map, RefreshCw } from 'lucide-react';

interface MockMapProps {
  liveData: LiveData | null;
}

// Generate inline div icons to ensure styling works 100% with no broken Leaflet images
const getCustomIcon = (bgColor: string, pingColor: string, symbol: string) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center" style="width: 28px; height: 28px;">
        <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full opacity-50" style="background-color: ${pingColor};"></span>
        <span class="relative flex items-center justify-center rounded-full border border-white/30 text-[10px] font-bold text-white shadow-md shadow-black/40" style="background-color: ${bgColor}; width: 22px; height: 22px;">
          ${symbol}
        </span>
      </div>
    `,
    className: 'leaflet-custom-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const MockMap: React.FC<MockMapProps> = ({ liveData }) => {
  const [filter, setFilter] = useState<'all' | 'gates-parking' | 'amenities' | 'safety'>('all');

  if (!liveData) {
    return (
      <div className="glass-panel w-full h-[500px] rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="font-semibold text-sm">Syncing Live Map Overlays...</p>
      </div>
    );
  }

  // Stadium Center
  const position: [number, number] = [32.7473, -97.0845];

  // Helper to determine status color
  const getGateColor = (waitMin: number) => {
    if (waitMin > 20) return { bg: '#ef4444', ping: 'rgba(239, 68, 68, 0.4)' }; // Red
    if (waitMin > 10) return { bg: '#f59e0b', ping: 'rgba(245, 158, 11, 0.4)' }; // Orange
    return { bg: '#10b981', ping: 'rgba(16, 185, 129, 0.4)' }; // Green
  };

  const getParkingColor = (status: string) => {
    if (status === 'Full') return { bg: '#ef4444', ping: 'rgba(239, 68, 68, 0.4)' };
    if (status === 'Almost Full') return { bg: '#f59e0b', ping: 'rgba(245, 158, 11, 0.4)' };
    return { bg: '#10b981', ping: 'rgba(16, 185, 129, 0.4)' };
  };

  return (
    <div className="glass-panel w-full h-[520px] rounded-3xl border border-slate-800 p-4 flex flex-col space-y-4 shadow-xl">
      {/* Map Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-slate-200">Interactive Arena Layout</h3>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-850">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Show All
          </button>
          <button
            onClick={() => setFilter('gates-parking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'gates-parking' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Access & Parking
          </button>
          <button
            onClick={() => setFilter('amenities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'amenities' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Food & Restrooms
          </button>
          <button
            onClick={() => setFilter('safety')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'safety' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Medical & Lost
          </button>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 relative z-10">
        <MapContainer center={position} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Stadium Circle Marker to outline core venue */}
          <Circle
            center={position}
            radius={250}
            pathOptions={{ fillColor: '#10b981', fillOpacity: 0.15, color: '#10b981', weight: 1.5 }}
          />

          {/* 1. GATES OVERLAYS */}
          {(filter === 'all' || filter === 'gates-parking') &&
            liveData.gates.map((gate) => {
              const colors = getGateColor(gate.wait_time_minutes);
              const icon = getCustomIcon(colors.bg, colors.ping, 'G');
              return (
                <Marker key={gate.id} position={[gate.latitude, gate.longitude]} icon={icon}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-slate-100">{gate.name}</p>
                      <p className="text-xs text-slate-400">Status: <span className="text-emerald-400 font-semibold">{gate.status}</span></p>
                      <p className="text-xs text-slate-400">Queue wait: <span className="font-bold text-white">{gate.wait_time_minutes} mins</span></p>
                      <p className="text-xs text-slate-400">Flow rate: {gate.flow_rate_per_min} fans/min</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* 2. PARKING OVERLAYS */}
          {(filter === 'all' || filter === 'gates-parking') &&
            Object.entries(liveData.parking).map(([name, zone]) => {
              const colors = getParkingColor(zone.status);
              const icon = getCustomIcon(colors.bg, colors.ping, 'P');
              return (
                <Marker key={name} position={[zone.latitude, zone.longitude]} icon={icon}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-slate-100">{name}</p>
                      <p className="text-xs text-slate-400">Status: <span className="font-bold text-white">{zone.status}</span></p>
                      <p className="text-xs text-slate-400">Occupancy: {zone.occupied} / {zone.capacity} spaces</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* 3. FOOD OVERLAYS */}
          {(filter === 'all' || filter === 'amenities') &&
            liveData.food.map((stall) => {
              const colors = { bg: '#eab308', ping: 'rgba(234, 179, 8, 0.4)' }; // Yellow
              const icon = getCustomIcon(colors.bg, colors.ping, 'F');
              return (
                <Marker key={stall.name} position={[stall.latitude, stall.longitude]} icon={icon}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-slate-100">{stall.name}</p>
                      <p className="text-xs text-slate-400">Location: {stall.location}</p>
                      <p className="text-xs text-slate-400">Queue wait: <span className="font-bold text-white">{stall.queue_wait_minutes} mins</span> ({stall.status})</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* 4. WASHROOM OVERLAYS */}
          {(filter === 'all' || filter === 'amenities') &&
            liveData.washrooms.map((wc) => {
              const colors = { bg: '#06b6d4', ping: 'rgba(6, 182, 212, 0.4)' }; // Cyan
              const icon = getCustomIcon(colors.bg, colors.ping, 'W');
              return (
                <Marker key={wc.id} position={[wc.latitude, wc.longitude]} icon={icon}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-slate-100">Restroom {wc.id}</p>
                      <p className="text-xs text-slate-400">Location: {wc.location}</p>
                      <p className="text-xs text-slate-400">Type: {wc.gender} | Accessible: {wc.accessible ? 'Yes' : 'No'}</p>
                      <p className="text-xs text-slate-400">Wait: <span className="font-bold text-white">{wc.queue_wait_minutes} mins</span> ({wc.status})</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* 5. MEDICAL OVERLAYS */}
          {(filter === 'all' || filter === 'safety') &&
            liveData.medical.stations.map((station) => {
              const colors = { bg: '#ef4444', ping: 'rgba(239, 68, 68, 0.4)' }; // Red
              const icon = getCustomIcon(colors.bg, colors.ping, 'M');
              return (
                <Marker key={station.id} position={[station.latitude, station.longitude]} icon={icon}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-slate-100">Medical Station {station.id}</p>
                      <p className="text-xs text-slate-400">Location: {station.location}</p>
                      <p className="text-xs text-slate-400">Status: <span className="font-semibold text-red-400">{station.status}</span></p>
                      <p className="text-xs text-slate-400">Active Cases: {station.cases_active} | Staffing: {station.staff_count}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* 6. LOST & FOUND OVERLAYS */}
          {(filter === 'all' || filter === 'safety') &&
            liveData.lost_and_found.map((item, idx) => {
              const colors = { bg: '#a855f7', ping: 'rgba(168, 85, 247, 0.4)' }; // Purple
              const icon = getCustomIcon(colors.bg, colors.ping, 'L');
              return (
                <Marker key={idx} position={[item.latitude, item.longitude]} icon={icon}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-slate-100">{item.item}</p>
                      <p className="text-xs text-slate-400">Last seen: {item.location}</p>
                      <p className="text-xs text-slate-400">Status: <span className="font-semibold text-purple-400">{item.status}</span></p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

        </MapContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-2xl border border-slate-900 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
          <span>Low Queue / Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
          <span>Moderate Queue / Almost Full</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span>Busy Queue / Full</span>
        </div>
        <div className="w-px h-3 bg-slate-800 hidden md:block" />
        <div className="flex items-center gap-4">
          <span><strong>G:</strong> Gate</span>
          <span><strong>P:</strong> Parking</span>
          <span><strong>F:</strong> Food</span>
          <span><strong>W:</strong> Washroom</span>
          <span><strong>M:</strong> Medical</span>
          <span><strong>L:</strong> Lost Item</span>
        </div>
      </div>
    </div>
  );
};

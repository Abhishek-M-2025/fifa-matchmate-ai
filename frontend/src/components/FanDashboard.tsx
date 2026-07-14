import React, { useState } from 'react';
import { LiveData, WeatherInfo } from '../types';
import { MockMap } from './MockMap';
import { AIChatVoice } from './AIChatVoice';
import { WeatherWidget } from './WeatherWidget';
import {
  Bus, Car, Utensils, Bath, HeartPulse, Accessibility,
  Users, HelpCircle, AlertOctagon, Bell, ShieldAlert,
  Globe, CheckCircle2, ChevronRight, ChevronDown
} from 'lucide-react';

interface FanDashboardProps {
  liveData: LiveData | null;
  weather: WeatherInfo | null;
  weatherLoading: boolean;
}

const TRANSLATIONS = {
  en: {
    transit: "Transit & Shuttles",
    parking: "Parking Status",
    dining: "Concourse Dining",
    restrooms: "Restrooms",
    medical: "Medical Stations",
    accessibility: "Accessibility Info",
    volunteers: "Volunteer Support",
    lostFound: "Lost & Found Log",
    emergency: "Emergency Escape Guide",
    activeAlerts: "Live Security & Operations Alerts",
    langSelect: "Language",
    stadiumStatus: "Dallas Stadium Status",
    capacityLabel: "Capacity Occupied",
    assistReqSuccess: "Volunteer help requested successfully. A crew member in an emerald shirt will reach your sector shortly.",
    requestVolunteer: "Request Assistance"
  },
  es: {
    transit: "Tránsito y Lanzaderas",
    parking: "Estado del Estacionamiento",
    dining: "Comedor del Concurso",
    restrooms: "Servicios Higiénicos",
    medical: "Estaciones Médicas",
    accessibility: "Información de Accesibilidad",
    volunteers: "Soporte de Voluntarios",
    lostFound: "Registro de Objetos Perdidos",
    emergency: "Guía de Escape de Emergencia",
    activeAlerts: "Alertas de Seguridad y Operaciones",
    langSelect: "Idioma",
    stadiumStatus: "Estado del Estadio de Dallas",
    capacityLabel: "Capacidad Ocupada",
    assistReqSuccess: "Ayuda voluntaria solicitada con éxito. Un miembro del equipo en camisa esmeralda llegará a su sector en breve.",
    requestVolunteer: "Solicitar Asistencia"
  },
  fr: {
    transit: "Transports & Navettes",
    parking: "État du Parking",
    dining: "Restauration Hall",
    restrooms: "Toilettes",
    medical: "Postes Médicaux",
    accessibility: "Infos Accessibilité",
    volunteers: "Aide des Bénévoles",
    lostFound: "Objets Trouvés",
    emergency: "Directives d'Urgence",
    activeAlerts: "Flux d'Alertes Sécurité & Trafic",
    langSelect: "Langue",
    stadiumStatus: "Statut du Stade de Dallas",
    capacityLabel: "Capacité Occupée",
    assistReqSuccess: "Demande d'aide envoyée. Un bénévole portant un maillot émeraude arrivera à votre secteur sous peu.",
    requestVolunteer: "Demander de l'aide"
  }
};

type Language = 'en' | 'es' | 'fr';

export const FanDashboard: React.FC<FanDashboardProps> = ({ liveData, weather, weatherLoading }) => {
  const [lang, setLang] = useState<Language>('en');
  const [activeWidget, setActiveWidget] = useState<string | null>('transit');
  const [volunteerSubmitted, setVolunteerSubmitted] = useState(false);
  const [volSector, setVolSector] = useState('');
  const [volIssue, setVolIssue] = useState('');

  const t = TRANSLATIONS[lang];

  if (!liveData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium">Synchronizing live fan dashboard telemetry...</p>
        </div>
      </div>
    );
  }

  const toggleWidget = (widget: string) => {
    setActiveWidget(activeWidget === widget ? null : widget);
  };

  const handleVolunteerRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volSector || !volIssue) return;
    setVolunteerSubmitted(true);
    setTimeout(() => {
      setVolunteerSubmitted(false);
      setVolSector('');
      setVolIssue('');
    }, 6000);
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {t.stadiumStatus}
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Welcome back! Monitor live crowd, navigation routes, and ask our AI anything.
          </p>
        </div>

        {/* Global Selectors */}
        <div className="flex items-center gap-4">
          {/* Weather Widget */}
          <div className="w-64">
            <WeatherWidget weather={weather} loading={weatherLoading} />
          </div>

          {/* Lang Widget */}
          <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 border-slate-800">
            <Globe className="w-4 h-4 text-emerald-400 ml-2" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-slate-900 border-none outline-none text-xs font-bold text-slate-200 cursor-pointer pr-4"
            >
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout: Map and Controls on Left, AI Assistant & Alerts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Map + Widgets */}
        <div className="lg:col-span-8 space-y-6">
          <MockMap liveData={liveData} />

          {/* Collapsible Info Panels */}
          <div className="space-y-3">
            {/* Widget 1: Transport */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleWidget('transit')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Bus className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-slate-200">{t.transit}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                    {liveData.transport.metro_line_status}
                  </span>
                  {activeWidget === 'transit' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>
              {activeWidget === 'transit' && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3.5 bg-slate-950/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Metro Trains</p>
                      <p className="text-sm font-extrabold text-slate-200 mt-1">Every {liveData.transport.metro_frequency_minutes} mins</p>
                    </div>
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Transit Shuttle Buses</p>
                      <p className="text-sm font-extrabold text-slate-200 mt-1">{liveData.transport.shuttle_buses.active} Active shuttles</p>
                      <p className="text-xs text-slate-400 font-medium">Wait: ~{liveData.transport.shuttle_buses.waiting_time_minutes} mins</p>
                    </div>
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Rideshare Delays</p>
                      <p className="text-sm font-extrabold text-slate-200 mt-1">{liveData.transport.rideshare_delay_minutes} mins latency</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                    <h4 className="font-bold text-xs text-slate-300 mb-2">Next Departures from Stadium Station</h4>
                    <div className="space-y-2">
                      {liveData.transport.next_trains.map((train, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-semibold py-1 border-b border-slate-900 last:border-0 text-slate-350">
                          <span>{train.destination}</span>
                          <span className="text-emerald-400">in {train.minutes_away} mins</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Widget 2: Parking */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleWidget('parking')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-slate-200">{t.parking}</span>
                </div>
                {activeWidget === 'parking' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {activeWidget === 'parking' && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {Object.entries(liveData.parking).map(([name, zone]) => (
                      <div key={name} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
                        <p className="font-bold text-xs text-slate-200">{name}</p>
                        <p className="text-lg font-black text-white mt-1">
                          {Math.round((zone.occupied / zone.capacity) * 100)}%
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          {zone.occupied} / {zone.capacity} spaces
                        </p>
                        <span className={`inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          zone.status === 'Full' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          zone.status === 'Almost Full' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {zone.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Widget 3: Dining */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleWidget('dining')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-slate-200">{t.dining}</span>
                </div>
                {activeWidget === 'dining' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {activeWidget === 'dining' && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {liveData.food.map((stall) => (
                      <div key={stall.name} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-200">{stall.name}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{stall.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-white">{stall.queue_wait_minutes} mins</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            stall.status === 'Very Busy' ? 'bg-red-500/10 text-red-400' :
                            stall.status === 'Busy' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {stall.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Widget 4: Washrooms */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleWidget('restrooms')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Bath className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-slate-200">{t.restrooms}</span>
                </div>
                {activeWidget === 'restrooms' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {activeWidget === 'restrooms' && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {liveData.washrooms.map((wc) => (
                      <div key={wc.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-200">Restroom {wc.id}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{wc.location}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-semibold">{wc.gender}</span>
                            {wc.accessible && <Accessibility className="w-3.5 h-3.5 text-blue-400" />}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-white">{wc.queue_wait_minutes} min wait</p>
                          <span className={`text-[10px] font-bold ${wc.status === 'Busy' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {wc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Widget 5: Medical & Safety */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleWidget('medical')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <HeartPulse className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-sm text-slate-200">{t.medical}</span>
                </div>
                {activeWidget === 'medical' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {activeWidget === 'medical' && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20">
                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-400">Average Incident Response Time</p>
                    <p className="text-lg font-black text-red-400">{liveData.medical.emergency_response_time_seconds} seconds</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {liveData.medical.stations.map((st) => (
                      <div key={st.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-200">First Aid {st.id}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.status === 'Busy' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {st.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{st.location}</p>
                        <p className="text-xs text-slate-500">Active incidents: {st.cases_active} | Staff: {st.staff_count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Widget 6: Accessibility */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleWidget('accessibility')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Accessibility className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm text-slate-200">{t.accessibility}</span>
                </div>
                {activeWidget === 'accessibility' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {activeWidget === 'accessibility' && (
                <div className="px-5 pb-5 pt-4 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20 text-slate-300">
                  <p className="text-xs leading-relaxed font-semibold">
                    Dallas Arena is fully ADA compliant. We support wheelchairs, service animals, sensory rooms, and accessible restrooms in all sections.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                    <li>Accessible entry gates are equipped with wider ticket stiles (Gate D).</li>
                    <li>Wheelchair loan points are available at guest services in Concourse 102 & 218.</li>
                    <li>Sensory calming room is open in Sector 132 for sensory-sensitive visitors.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Widget 7: Volunteer Help */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleWidget('volunteer-help')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-slate-200">{t.volunteers}</span>
                </div>
                {activeWidget === 'volunteer-help' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {activeWidget === 'volunteer-help' && (
                <div className="px-5 pb-5 pt-3 border-t border-slate-900 text-sm space-y-4 bg-slate-950/20">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Active Volunteers inside Arena</span>
                    <span className="font-extrabold text-white">{liveData.volunteers.active_now} active</span>
                  </div>

                  {volunteerSubmitted ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      <span>{t.assistReqSuccess}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleVolunteerRequest} className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Your Sector / Seat Location</label>
                        <input
                          type="text"
                          required
                          value={volSector}
                          onChange={(e) => setVolSector(e.target.value)}
                          placeholder="e.g. Section 104, Row G, Seat 12"
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">What do you need help with?</label>
                        <textarea
                          required
                          value={volIssue}
                          onChange={(e) => setVolIssue(e.target.value)}
                          placeholder="e.g. Wheelchair assistance, lost child, medical query, water spill..."
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium h-16 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 border border-emerald-400/20"
                      >
                        {t.requestVolunteer}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Widget 8: Lost and Found */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleWidget('lost-found')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-sm text-slate-200">{t.lostFound}</span>
                </div>
                {activeWidget === 'lost-found' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {activeWidget === 'lost-found' && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20">
                  <div className="space-y-2">
                    {liveData.lost_and_found.map((item, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-200">{item.item}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Location: {item.location}</p>
                        </div>
                        <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                          item.status === 'Reported Found' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Widget 9: Emergency exit */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleWidget('emergency')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <AlertOctagon className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-sm text-slate-200">{t.emergency}</span>
                </div>
                {activeWidget === 'emergency' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {activeWidget === 'emergency' && (
                <div className="px-5 pb-5 pt-3 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20 text-slate-350">
                  <p className="text-xs font-semibold leading-relaxed text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    Always check the active emergency broadcast guidelines during evac situations.
                  </p>
                  <ul className="space-y-1 text-xs list-decimal list-inside">
                    <li>Locate the green glowing exit signs in your sector corridor.</li>
                    <li>Move calmly towards the nearest gate (Gate A, B, C, or D) as directed by stewards.</li>
                    <li>Do not use elevators; stairs are equipped with emergency battery power.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant + Notifications */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Chatbot */}
          <AIChatVoice role="fan" />

          {/* Active Alerts List */}
          <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-200 text-sm">{t.activeAlerts}</h3>
              </div>
              <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-bold border border-slate-800">
                {liveData.alerts.length} alerts
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
              {liveData.alerts.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium text-center py-4">No active notices at this time.</p>
              ) : (
                liveData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-2xl border text-xs leading-relaxed flex gap-2.5 ${
                      alert.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                      alert.severity === 'Warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                      'bg-slate-900/60 border-slate-850 text-slate-300'
                    }`}
                  >
                    <span className="font-black text-[10px] text-slate-500 shrink-0">{alert.timestamp}</span>
                    <div>
                      <p className="font-bold">{alert.severity === 'Critical' ? '⚠️ Critical' : alert.severity === 'Warning' ? '⚠️ Notice' : 'ℹ️ Info'}</p>
                      <p className="mt-0.5 text-slate-300 font-medium">{alert.title}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

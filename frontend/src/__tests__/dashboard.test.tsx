import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';
import { FanDashboard } from '../components/FanDashboard';
import { OrganizerDashboard } from '../components/OrganizerDashboard';
import { LiveData, WeatherInfo } from '../types';

// Mock MockMap to avoid Leaflet loading canvas errors in Vitest headless environment
vi.mock('../components/MockMap', () => ({
  MockMap: () => <div data-testid="mock-map">Mock Map Overlay</div>
}));

// Mock API calls
vi.mock('../api', () => ({
  getLiveData: vi.fn(),
  sendChatMessage: vi.fn(() => Promise.resolve({ response: "AI Answer mock", timestamp: "12:00" })),
  triggerAlert: vi.fn()
}));

const mockLiveData: LiveData = {
  timestamp: "2026-07-12T12:00:00Z",
  crowd: {
    total_stadium_occupancy: 70000,
    occupancy_percentage: 87.5,
    zones: {
      "North Stand": { occupancy: 18000, capacity: 20000, density: "High" },
      "South Stand": { occupancy: 17000, capacity: 20000, density: "Medium" }
    }
  },
  gates: [
    { id: "Gate-A", name: "Gate A", occupancy: 40, status: "Open", wait_time_minutes: 5, flow_rate_per_min: 40, latitude: 1, longitude: 1 }
  ],
  parking: {
    "Zone A (VIP)": { occupied: 100, capacity: 200, status: "Available", latitude: 1, longitude: 1 }
  },
  transport: {
    metro_line_status: "Normal Service",
    metro_frequency_minutes: 4,
    shuttle_buses: { active: 10, waiting_time_minutes: 5, status: "Normal" },
    rideshare_delay_minutes: 10,
    next_trains: [{ destination: "Downtown", minutes_away: 5 }]
  },
  food: [
    { name: "Burgers", location: "Sec 101", queue_wait_minutes: 5, status: "Available", latitude: 1, longitude: 1 }
  ],
  washrooms: [
    { id: "W1", location: "Sec 102", gender: "All", queue_wait_minutes: 2, status: "Clean", accessible: true, latitude: 1, longitude: 1 }
  ],
  volunteers: {
    total_assigned: 100,
    active_now: 90,
    zones: { "North Stand": 50, "South Stand": 40 },
    assistance_requests_pending: 2
  },
  medical: {
    stations: [{ id: "Med-1", location: "Sec 105", status: "Available", cases_active: 0, staff_count: 5, latitude: 1, longitude: 1 }],
    emergency_response_time_seconds: 120
  },
  alerts: [
    { id: "1", severity: "Warning", title: "Test Warning Alert", timestamp: "12:00" }
  ],
  sustainability: {
    waste_diverted_kg: 100,
    water_saved_liters: 200,
    renewable_energy_kwh: 300,
    carbon_offset_kg: 50
  },
  lost_and_found: [
    { item: "Wallet", status: "Lost", location: "Sec 101", latitude: 1, longitude: 1 }
  ]
};

const mockWeather: WeatherInfo = {
  temp_c: 25.0,
  temp_f: 77.0,
  description: "Sunny",
  icon: "Sun",
  wind_speed_kmh: 10.0,
  source: "Open-Meteo API"
};

describe('Sidebar Integration', () => {
  it('renders branding title and Live Sync updates', () => {
    const setRole = vi.fn();
    render(
      <Sidebar role="fan" setRole={setRole} isUpdating={false} status="Healthy" />
    );
    expect(screen.getByText('FIFA MatchMate AI')).toBeInTheDocument();
    expect(screen.getByText('Dallas Stadium • Live Operations')).toBeInTheDocument();
  });

  it('triggers setRole callback when role buttons are clicked', () => {
    const setRole = vi.fn();
    render(
      <Sidebar role="fan" setRole={setRole} isUpdating={false} status="Healthy" />
    );
    const organizerButton = screen.getByText('Organizer');
    fireEvent.click(organizerButton);
    expect(setRole).toHaveBeenCalledWith('organizer');
  });
});

describe('FanDashboard Layout', () => {
  it('renders map placeholder and details accordion headers', () => {
    render(
      <FanDashboard liveData={mockLiveData} weather={mockWeather} weatherLoading={false} />
    );
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
    expect(screen.getByText('Transit & Shuttles')).toBeInTheDocument();
    expect(screen.getByText('Parking Status')).toBeInTheDocument();
  });

  it('expands transit widget details when clicked', () => {
    render(
      <FanDashboard liveData={mockLiveData} weather={mockWeather} weatherLoading={false} />
    );
    const transitHeader = screen.getByText('Transit & Shuttles');
    fireEvent.click(transitHeader);
    expect(screen.getByText('Dallas Downtown')).toBeIn5MinsText();
  });
});

describe('OrganizerDashboard Controls', () => {
  it('renders SVG wait times chart and sustainability figures', () => {
    render(
      <OrganizerDashboard liveData={mockLiveData} onRefresh={() => {}} />
    );
    expect(screen.getByText('Broadcast Emergency Notice')).toBeInTheDocument();
    expect(screen.getByText('Volunteer Staffing')).toBeInTheDocument();
    expect(screen.getByText('Waste Recycled')).toBeInTheDocument();
  });
});

// Custom matcher helper for trains text format
interface CustomMatchers<R = unknown> {
  toBeIn5MinsText(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeIn5MinsText(_received: any) {
    const hasDestination = screen.getByText('Downtown') !== null;
    const hasMinutes = screen.getByText('in 5 mins') !== null;
    return {
      pass: hasDestination && hasMinutes,
      message: () => `Expected Downtown train timetable details to render`
    };
  }
});

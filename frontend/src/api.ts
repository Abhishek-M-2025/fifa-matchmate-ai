import { LiveData, WeatherInfo } from './types';

const API_BASE = 'https://fifa-matchmate-ai.onrender.com';

export async function getLiveData(): Promise<LiveData> {
  const res = await fetch(`${API_BASE}/api/live-data`);
  if (!res.ok) {
    throw new Error('Failed to fetch live data');
  }
  return res.json();
}

export async function getWeatherInfo(): Promise<WeatherInfo> {
  const res = await fetch(`${API_BASE}/api/weather`);
  if (!res.ok) {
    throw new Error('Failed to fetch weather info');
  }
  return res.json();
}

export async function sendChatMessage(
  message: string,
  role: string
): Promise<{ response: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, role }),
  });

  if (!res.ok) {
    throw new Error('Failed to send chat message');
  }

  return res.json();
}

export async function triggerAlert(
  severity: string,
  title: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/alerts/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ severity, title }),
  });

  if (!res.ok) {
    throw new Error('Failed to trigger alert');
  }

  return res.json();
}

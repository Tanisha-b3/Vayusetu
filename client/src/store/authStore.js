import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Calls the auth API. Throws with the server's message when the credentials are rejected.
async function postAuth(path, body, fallbackMessage) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.token) {
    throw new Error(data?.error || `${fallbackMessage} (HTTP ${res.status})`);
  }
  return data;
}

function saveSession(user, token) {
  localStorage.setItem('vayusetu_user', JSON.stringify(user));
  localStorage.setItem('vayusetu_token', token);
}

// One-time reset: earlier builds auto-signed every visitor in as a demo user and accepted any
// password, leaving fake sessions in localStorage. Dropping them here makes everyone sign in again.
const AUTH_VERSION = '2';
if (localStorage.getItem('vayusetu_auth_version') !== AUTH_VERSION) {
  localStorage.removeItem('vayusetu_user');
  localStorage.removeItem('vayusetu_token');
  localStorage.setItem('vayusetu_auth_version', AUTH_VERSION);
}

export const useAuthStore = create((set, get) => {
  const savedUser = localStorage.getItem('vayusetu_user');
  const savedToken = localStorage.getItem('vayusetu_token');

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
    isAuthenticated: !!savedToken,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const data = await postAuth('/auth/login', { email, password }, 'Sign-in failed.');
        saveSession(data.user, data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (err) {
        set({ error: err.message, isLoading: false });
        return { success: false, error: err.message };
      }
    },

    demoLogin: (role = 'ward_officer') => {
      const demoProfiles = {
        ward_officer: {
          id: 'demo_ward_1',
          name: 'Ashok Sharma',
          email: 'ashok.sharma@bhopal.gov.in',
          role: 'ward_officer',
          roleTitle: 'Zonal Health & Ward Officer',
          organization: 'Bhopal Municipal Corporation',
          city: 'Bhopal',
          ward: 'Zone 8 (Ward 42 & 43)',
          language: 'hi',
        },
        housing_society: {
          id: 'demo_rwa_1',
          name: 'Rajesh Verma',
          email: 'secretary@gulmohar-rwa.in',
          role: 'housing_society',
          roleTitle: 'RWA Management Secretary',
          organization: 'Gulmohar Greens Residents Association',
          city: 'Bhopal',
          ward: 'Arera Colony',
          language: 'en',
        },
        school: {
          id: 'demo_school_1',
          name: 'Dr. Priya Nair',
          email: 'principal@dps-bhopal.edu.in',
          role: 'school',
          roleTitle: 'Principal & Student Safety Lead',
          organization: 'Delhi Public School, Kolar Road',
          city: 'Bhopal',
          ward: 'Kolar Road',
          language: 'en',
        },
        citizen: {
          id: 'demo_citizen_1',
          name: 'Kavita Deshmukh',
          email: 'kavita.deshmukh@gmail.com',
          role: 'citizen',
          roleTitle: 'Concerned Citizen & Parent',
          organization: 'Clean Air Bhopal Volunteer Network',
          city: 'Bhopal',
          ward: 'MP Nagar',
          language: 'mr',
        },
      };

      const demoUser = demoProfiles[role] || demoProfiles.ward_officer;
      const demoToken = 'demo_jwt_token_bhopal_2026';

      localStorage.setItem('vayusetu_user', JSON.stringify(demoUser));
      localStorage.setItem('vayusetu_token', demoToken);
      set({ user: demoUser, token: demoToken, isAuthenticated: true, error: null });
      return demoUser;
    },

    signup: async (formData) => {
      set({ isLoading: true, error: null });
      try {
        const data = await postAuth(
          '/auth/signup',
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            organization: formData.organization,
            city: formData.city,
            ward: formData.ward,
            language: formData.language,
          },
          'Sign-up failed.'
        );
        saveSession(data.user, data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (err) {
        set({ error: err.message, isLoading: false });
        return { success: false, error: err.message };
      }
    },

    // Checks the saved token with the server. Offline-only demo sessions are skipped, and a
    // network failure keeps the session so a flaky connection doesn't sign people out.
    verifySession: async () => {
      const { token } = get();
      if (!token || token.startsWith('demo_')) return;
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) {
          get().logout();
        } else if (res.ok) {
          const data = await res.json();
          localStorage.setItem('vayusetu_user', JSON.stringify(data.user));
          set({ user: data.user });
        }
      } catch {
        /* offline: keep the current session */
      }
    },

    logout: () => {
      localStorage.removeItem('vayusetu_user');
      localStorage.removeItem('vayusetu_token');
      set({ user: null, token: null, isAuthenticated: false, error: null });
    },

    updateProfile: (updates) => {
      const current = get().user || {};
      const updated = { ...current, ...updates };
      localStorage.setItem('vayusetu_user', JSON.stringify(updated));
      set({ user: updated });
    },
  };
});

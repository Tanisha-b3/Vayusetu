import { create } from 'zustand';

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
        // Try backend login if available, or authenticate locally
        let userData = null;
        let token = 'jwt_token_' + Date.now();
        
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (res.ok) {
            const data = await res.json();
            userData = data.user;
            token = data.token;
          }
        } catch {
          // Fallback to local authentication for seamless demo
        }

        if (!userData) {
          userData = {
            id: 'usr_' + Date.now(),
            name: email.split('@')[0].replace(/[._]/g, ' '),
            email,
            role: 'ward_officer',
            organization: 'Municipal Corporation',
            city: 'Bhopal',
            ward: 'Ward 42',
            language: 'en',
          };
        }

        localStorage.setItem('vayusetu_user', JSON.stringify(userData));
        localStorage.setItem('vayusetu_token', token);
        set({ user: userData, token, isAuthenticated: true, isLoading: false });
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
        const newUser = {
          id: 'usr_' + Date.now(),
          name: formData.name,
          email: formData.email,
          role: formData.role || 'ward_officer',
          organization: formData.organization || 'Civic Administration',
          city: formData.city || 'Bhopal',
          ward: formData.ward || 'Zone 1',
          language: formData.language || 'en',
        };
        const token = 'jwt_token_' + Date.now();

        localStorage.setItem('vayusetu_user', JSON.stringify(newUser));
        localStorage.setItem('vayusetu_token', token);
        set({ user: newUser, token, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (err) {
        set({ error: err.message, isLoading: false });
        return { success: false, error: err.message };
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

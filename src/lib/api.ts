// src/lib/api.ts
// Client-side API caller that targets the Express backend via proxy.

export interface UserProfilePayload {
    name: string;
    goal: string;
    email?: string;
    weight?: number;
    height?: number;
    age?: number;
}

const getHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('fitguru_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    auth: {
        signup: async (payload: UserProfilePayload) => {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Signup failed');
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('fitguru_token', data.token);
            }
            return data;
        },
        login: async (email: string) => {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email })
            });
            if (!res.ok) throw new Error('Login failed');
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('fitguru_token', data.token);
            }
            return data;
        },
        getProfile: async () => {
            const res = await fetch('/api/auth/profile', {
                method: 'GET',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
        updateProfile: async (profile: Partial<UserProfilePayload>) => {
            const res = await fetch('/api/auth/profile', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(profile)
            });
            if (!res.ok) throw new Error('Failed to update profile');
            return res.json();
        }
    },
    home: {
        getProgress: async () => {
            const res = await fetch('/api/home/progress', {
                method: 'GET',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch progress');
            return res.json();
        },
        updateProgress: async (id: string, value: number) => {
            const res = await fetch('/api/home/progress', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ id, value })
            });
            if (!res.ok) throw new Error('Failed to update progress');
            return res.json();
        },
        getGymOffers: async () => {
            const res = await fetch('/api/home/gyms', {
                method: 'GET',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch gym offers');
            return res.json();
        }
    },
    tracker: {
        getHabits: async () => {
            const res = await fetch('/api/tracker/habits', {
                method: 'GET',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch habits');
            return res.json();
        },
        saveHabits: async (habits: any[]) => {
            const res = await fetch('/api/tracker/habits', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(habits)
            });
            if (!res.ok) throw new Error('Failed to save habits');
            return res.json();
        }
    },
    chat: {
        sendMessage: async (message: string) => {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ message })
            });
            if (!res.ok) throw new Error('Failed to send message');
            return res.json();
        }
    }
};

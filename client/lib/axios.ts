import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('smartsolar_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('smartsolar_refresh_token');
                if (refreshToken) {
                    const { data } = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
                        { refreshToken }
                    );

                    if (data.success) {
                        localStorage.setItem('smartsolar_token', data.data.token);
                        localStorage.setItem('smartsolar_refresh_token', data.data.refreshToken);
                        originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
                        return api(originalRequest);
                    }
                }
            } catch {
                localStorage.removeItem('smartsolar_token');
                localStorage.removeItem('smartsolar_refresh_token');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;

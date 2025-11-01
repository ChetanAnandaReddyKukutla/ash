const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').trim();
const CONTRACT_ADDRESS = (process.env.REACT_APP_CONTRACT_ADDRESS || '').trim();
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const buildApiUrl = (pathname = '') => {
    if (!pathname) return '';
    if (!API_BASE_URL) {
        return pathname;
    }
    const base = API_BASE_URL.replace(/\/$/, '');
    const normalizedPath = pathname.replace(/^\//, '');
    return `${base}/${normalizedPath}`;
};

export { API_BASE_URL, CONTRACT_ADDRESS, GOOGLE_MAPS_API_KEY, buildApiUrl };

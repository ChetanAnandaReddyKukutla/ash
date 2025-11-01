import axios from 'axios';
import { API_BASE_URL } from '../config';

const resolvedBaseUrl = API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: resolvedBaseUrl,
});

export default apiClient;
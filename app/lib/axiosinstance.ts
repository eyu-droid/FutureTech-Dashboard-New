import type { response } from '@/types/response';
import axios, { type AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_ENDPOINT;

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY,
        
    },
    withCredentials: true
});




export default axiosInstance;
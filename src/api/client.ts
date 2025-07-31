import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://127.0.0.1:5000';

const client = axios.create({
baseURL: API_URL,
withCredentials: true,
});

export default client;
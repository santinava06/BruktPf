import axios from 'axios';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const API_URL = 'http://localhost:3001/api/settings';

export const getUserSettings = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

export const updateUserSettings = async (settings) => {
    const response = await axios.put(API_URL, settings, getAuthHeader());
    return response.data;
};

import axios from 'axios';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const API_URL = 'http://localhost:3001/api/debts';

export const simplifyDebts = async (balances) => {
    const response = await axios.post(`${API_URL}/simplify`, { balances }, getAuthHeader());
    return response.data;
};

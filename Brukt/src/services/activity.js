import axios from 'axios';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const API_URL = 'http://localhost:3001/api/activity';

export const getGroupActivity = async (groupId, page = 1, limit = 20) => {
    const response = await axios.get(`${API_URL}/${groupId}?page=${page}&limit=${limit}`, getAuthHeader());
    return response.data;
};

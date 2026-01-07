import axios from 'axios';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const API_URL = 'http://localhost:3001/api/categories';

export const getCategories = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

export const createCategory = async (categoryData) => {
    const response = await axios.post(API_URL, categoryData, getAuthHeader());
    return response.data;
};

export const updateCategory = async (id, categoryData) => {
    const response = await axios.put(`${API_URL}/${id}`, categoryData, getAuthHeader());
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
};

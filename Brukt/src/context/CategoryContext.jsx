import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categories';
import { useAuth } from '../hooks/useAuth';

const CategoryContext = createContext();

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};

export const CategoryProvider = ({ children }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (categoryData) => {
        try {
            const newCategory = await createCategory(categoryData);
            setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
            return newCategory;
        } catch (err) {
            console.error('Error adding category:', err);
            throw err;
        }
    };

    const editCategory = async (id, categoryData) => {
        try {
            const updatedCategory = await updateCategory(id, categoryData);
            setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
            return updatedCategory;
        } catch (err) {
            console.error('Error updating category:', err);
            throw err;
        }
    };

    const removeCategory = async (id) => {
        try {
            await deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting category:', err);
            throw err;
        }
    };

    const value = {
        categories,
        loading,
        error,
        fetchCategories,
        addCategory,
        editCategory,
        removeCategory
    };

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
};

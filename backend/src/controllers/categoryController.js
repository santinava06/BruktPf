import Category from '../models/category.js';
import { Op } from 'sequelize';

export const getCategories = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener categorías globales (user_id IS NULL) y del usuario
        const categories = await Category.findAll({
            where: {
                [Op.or]: [
                    { user_id: null },
                    { user_id: userId }
                ],
                is_active: true
            },
            order: [['name', 'ASC']]
        });

        res.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, icon, color } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const category = await Category.create({
            name,
            icon,
            color,
            user_id: userId
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, color } = req.body;
        const userId = req.user.id;

        const category = await Category.findOne({
            where: { id, user_id: userId }
        });

        if (!category) {
            // Verificar si es global (no se puede editar global) o no existe
            const globalCategory = await Category.findOne({ where: { id, user_id: null } });
            if (globalCategory) {
                return res.status(403).json({ error: 'No puedes editar categorías predeterminadas' });
            }
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        await category.update({
            name: name || category.name,
            icon: icon || category.icon,
            color: color || category.color
        });

        res.json(category);
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const category = await Category.findOne({
            where: { id, user_id: userId }
        });

        if (!category) {
            const globalCategory = await Category.findOne({ where: { id, user_id: null } });
            if (globalCategory) {
                return res.status(403).json({ error: 'No puedes eliminar categorías predeterminadas' });
            }
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        // Soft delete (o hard delete si preferimos)
        // Usamos hard delete si no hay Expenses asociados, o soft delete si los hay.
        // Por simplicidad ahora usaremos soft delete marcando is_active = false
        await category.update({ is_active: false });

        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};

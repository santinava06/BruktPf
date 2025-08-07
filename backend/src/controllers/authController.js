import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import User from '../models/user.js';

// Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    // Validar datos de entrada
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ 
        error: 'Nombre, apellido, email y contraseña son requeridos' 
      });
    }

    // Verificar si el usuario ya existe por email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Crear nuevo usuario (la contraseña se encripta automáticamente en el modelo)
    const user = await User.create({
      nombre,
      apellido,
      email,
      password
    });

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Iniciar sesión
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos de entrada
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener perfil del usuario
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'nombre', 'apellido', 'username', 'email', 'created_at', 'updated_at']
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar perfil del usuario
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombre, apellido, username, email, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Validar username si se está actualizando
    if (username) {
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ 
          error: 'El nombre de usuario solo puede contener letras, números y guiones bajos' 
        });
      }

      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ 
          error: 'El nombre de usuario debe tener entre 3 y 20 caracteres' 
        });
      }

      // Verificar si el username ya está en uso por otro usuario
      const existingUser = await User.findOne({ 
        where: { 
          username,
          id: { [Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ 
          error: 'El nombre de usuario ya está en uso' 
        });
      }
    }

    // Actualizar campos
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    await user.update(updateData);

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 

// Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validar datos de entrada
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Contraseña actual y nueva contraseña son requeridas' 
      });
    }

    // Validar longitud de la nueva contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Buscar usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Verificar contraseña actual
    const isValidCurrentPassword = await user.comparePassword(currentPassword);
    if (!isValidCurrentPassword) {
      return res.status(401).json({ 
        error: 'La contraseña actual es incorrecta' 
      });
    }

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe ser diferente a la actual' 
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 

// Solicitar recuperación de contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email es requerido' 
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        message: 'Si el email existe en nuestra base de datos, recibirás un enlace de recuperación'
      });
    }

    // Generar token de recuperación (válido por 1 hora)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // En un entorno de producción, aquí enviarías un email
    // Por ahora, solo devolvemos el token para desarrollo
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    console.log('🔗 Enlace de recuperación (desarrollo):', resetUrl);

    res.json({
      message: 'Si el email existe en nuestra base de datos, recibirás un enlace de recuperación',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Resetear contraseña con token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token y nueva contraseña son requeridos' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado' 
      });
    }

    // Verificar que sea un token de recuperación de contraseña
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ 
        error: 'Token inválido' 
      });
    }

    // Buscar usuario
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 
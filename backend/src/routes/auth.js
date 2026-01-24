import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getGoogleAccount,
  unlinkGoogleAccount
} from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Usuario autenticado exitosamente
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    // Redirigir al frontend con el token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      email: req.user.email,
      username: req.user.username
    }))}`);
  }
);

// Rutas protegidas
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

// Google Account Management
router.get('/google-account', auth, getGoogleAccount);
router.delete('/google-account', auth, unlinkGoogleAccount);

export default router; 
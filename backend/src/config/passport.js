// Configuración de Passport movida a app.js
// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import User from '../models/user.js';

// Configuración de la estrategia de Google OAuth movida a app.js
/*
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar usuario existente por google_id
        let user = await User.findOne({ where: { google_id: profile.id } });

        if (user) {
          // Usuario ya existe, actualizar información si es necesario
          return done(null, user);
        }

        // Buscar usuario por email
        const existingUser = await User.findOne({ where: { email: profile.emails[0].value } });

        if (existingUser) {
          // Usuario existe con este email, vincular cuenta de Google
          existingUser.google_id = profile.id;
          await existingUser.save();
          return done(null, existingUser);
        }

        // Crear nuevo usuario
        const names = profile.displayName.split(' ');
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';

        user = await User.create({
          nombre: firstName,
          apellido: lastName,
          email: profile.emails[0].value,
          google_id: profile.id,
          password: Math.random().toString(36), // Password dummy, no se usará
          username: null // Se puede generar después si es necesario
        });

        return done(null, user);
      } catch (error) {
        console.error('Error en estrategia Google OAuth:', error);
        return done(error, null);
      }
    }
  )
);

// Serialización para sesiones
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
*/

import passport from 'passport';

export default passport;
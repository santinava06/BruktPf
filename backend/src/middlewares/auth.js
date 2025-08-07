import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('🔍 Auth header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('🔍 Token extraído:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('🔍 Token completo:', token);
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        error: 'Token de acceso requerido' 
      });
    }

    // Temporalmente usar un secret hardcodeado para testing
    const secret = process.env.JWT_SECRET || 'tu_super_secreto_jwt_aqui_cambialo_en_produccion';
    console.log('🔍 Using secret:', secret.substring(0, 10) + '...');
    
    const decoded = jwt.verify(token, secret);
    console.log('✅ Token decoded successfully:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Error de autenticación:', error);
    console.error('❌ Error details:', error.message);
    res.status(401).json({ 
      error: 'Token inválido',
      details: error.message
    });
  }
}; 
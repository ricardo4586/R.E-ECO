const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (DEBE coincidir con el .env: falanode_clave_segura_para_el_proyecto_arapa339_ecom)
const JWT_SECRET = process.env.JWT_SECRET || 'mi-clave-secreta-temporal'; 

/**
 * Middleware para verificar la validez del token JWT.
 * Agregue este middleware a las rutas que desea proteger (POST, PUT, DELETE).
 */
const authenticateToken = (req, res, next) => {
    // 1. Obtener el token del encabezado 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    if (token == null) {
        // 401: Unauthorized (No hay token)
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    // 2. Verificar la firma del token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // 403: Forbidden (Token inválido o expirado)
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }
        
        // 3. Token es válido, adjuntar la información del usuario a la petición
        req.user = user;
        next(); // Continuar con el controlador de la ruta
    });
};

module.exports = authenticateToken;
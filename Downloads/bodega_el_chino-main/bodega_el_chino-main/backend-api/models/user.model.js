const pool = require('../db/db.config');
const bcrypt = require('bcrypt'); // Para encriptar y comparar contraseñas

const saltRounds = 10; // Nivel de seguridad para el hasheo de contraseñas (10 es el estándar)

/**
 * Registra un nuevo usuario administrador en la base de datos.
 * La contraseña se encripta (hashea) antes de ser almacenada.
 * @param {string} email
 * @param {string} password Contraseña en texto plano.
 * @returns {Promise<object>} El nuevo objeto de usuario creado (sin hash).
 */
const register = async (email, password) => {
    try {
        // 1. Crear el hash de la contraseña de forma asíncrona
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 2. Insertar en PostgreSQL. Por defecto, el campo 'rol' será 'admin' 
        // si la tabla fue creada correctamente con un valor predeterminado.
        const query = 'INSERT INTO usuarios (email, password_hash) VALUES ($1, $2) RETURNING id_usuario, email, rol';
        const result = await pool.query(query, [email, passwordHash]);
        
        // Devolvemos el usuario con su ID y rol, pero sin el hash de la contraseña.
        return result.rows[0];

    } catch (error) {
        // Propagamos el error para que auth.routes.js pueda manejarlo (ej. si el email está duplicado)
        throw error; 
    }
};

/**
 * Verifica las credenciales de inicio de sesión.
 * @param {string} email
 * @param {string} password Contraseña en texto plano ingresada por el usuario.
 * @returns {Promise<object | null>} El objeto de usuario si la verificación es exitosa, o null si falla.
 */
const login = async (email, password) => {
    try {
        // 1. Buscar al usuario por email
        const userQuery = 'SELECT id_usuario, email, password_hash, rol FROM usuarios WHERE email = $1';
        const result = await pool.query(userQuery, [email]);
        const user = result.rows[0];

        if (!user) {
            return null; // Usuario no encontrado
        }

        // 2. Comparar la contraseña ingresada (plano) con el hash almacenado (asíncrono)
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            // Contraseña correcta: Devolver el usuario sin el hash de la contraseña
            const { password_hash, ...userWithoutHash } = user;
            return userWithoutHash; 
        }

        return null; // Contraseña incorrecta
    } catch (error) {
        console.error("Error en login:", error.message);
        throw new Error('Error de base de datos durante el login.');
    }
};

module.exports = {
    register,
    login,
};
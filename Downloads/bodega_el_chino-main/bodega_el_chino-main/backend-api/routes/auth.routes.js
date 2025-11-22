const express = require('express');
const router = express.Router();
// Requerimos el modelo de usuario que maneja la lógica de la DB y bcrypt
const userModel = require('../models/user.model'); 
const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (Se lee del .env: falanode_clave_segura_para_el_proyecto_arapa339_ecom)
const JWT_SECRET = process.env.JWT_SECRET || 'mi-clave-secreta-temporal'; 

// -----------------------------------------------------------------------
// RUTA: POST /api/auth/register
// Usada para crear el primer administrador en el sistema.
// -----------------------------------------------------------------------
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    
    // Verificación de campos obligatorios
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    try {
        // Llama a la función del modelo para hashear y guardar el usuario en PostgreSQL
        const newUser = await userModel.register(email, password);
        
        res.status(201).json({ 
            message: 'Usuario administrador creado con éxito. ¡Inicie sesión ahora!',
            user: newUser 
        });
    } catch (error) {
        // Manejar error de clave duplicada (si el email ya existe)
        if (error.message.includes('duplicate key')) {
             return res.status(409).json({ message: 'Este email ya está registrado.' });
        }
        console.error('Error durante el registro:', error.message);
        res.status(500).json({ message: 'Error interno al registrar usuario.' });
    }
});

// -----------------------------------------------------------------------
// RUTA: POST /api/auth/login
// Usada para verificar credenciales y emitir un token JWT.
// -----------------------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Llama a la función del modelo para verificar email y contraseña (bcrypt)
        const user = await userModel.login(email, password);

        if (!user) {
            // Usuario o contraseña incorrectos
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Generar el token JWT (Payload: id, email, rol)
        const token = jwt.sign(
            { id_usuario: user.id_usuario, email: user.email, rol: user.rol }, 
            JWT_SECRET, 
            { expiresIn: '1h' } // Token expira en 1 hora, luego requiere re-login
        );

        // Devolver el token y la información del usuario al cliente (React)
        res.status(200).json({ 
            message: 'Inicio de sesión exitoso.', 
            user: user, 
            token: token // Este token se guarda en localStorage de React
        });

    } catch (error) {
        console.error('Error durante el login:', error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;
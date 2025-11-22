// Importamos 'Pool' de 'pg' para manejar la gestión de conexiones a la DB
const { Pool } = require('pg');

// Requerimos dotenv para leer las variables del archivo .env (DB_USER, DB_PASSWORD, etc.)
require('dotenv').config(); 

// Creamos un objeto de configuración para la conexión local (usando el archivo .env)
const config = {
    // Lee las variables del archivo .env
    user: process.env.DB_USER, // postgres
    host: process.env.DB_HOST, // localhost
    database: process.env.DB_DATABASE, // postgres
    password: process.env.DB_PASSWORD, // arapa339
    port: process.env.DB_PORT, // 5432
    // Aseguramos que la conexión local no use SSL estricto
    ssl: false,
};

// Creamos un nuevo Pool de conexiones con la configuración local
const pool = new Pool(config);

// Verificación de conexión (Opcional, pero útil para depurar)
pool.query('SELECT NOW()')
    .then(res => {
        // Mensaje que verá en la consola si la conexión es correcta
        console.log('Conexión exitosa a la Base de Datos. Hora DB:', res.rows[0].now);
    })
    .catch(err => {
        // Mensajes de error detallados si la conexión falla
        console.error('Error al intentar conectar con la DB:', err.message);
        console.error("Verifique sus credenciales en el archivo .env (arapa339) y que PostgreSQL esté corriendo.");
        // Opcional: Puede usar process.exit(1) aquí para detener el servidor si la DB es crítica
    });

// Exportamos el pool para que los modelos (user.model.js, product.model.js) puedan hacer consultas SQL
module.exports = pool;
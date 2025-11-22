const express = require('express');
const cors = require('cors');
// Importamos las rutas de productos
const productRoutes = require('./routes/product.routes'); 
// Importamos las nuevas rutas de autenticación
const authRoutes = require('./routes/auth.routes'); 

require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// Opciones de CORS para permitir la comunicación explícita con el frontend React
const corsOptions = {
    origin: 'http://localhost:5173', // El puerto de desarrollo de Vite/React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Permite cookies y encabezados de autenticación
};
app.use(cors(corsOptions)); // Aplicamos las opciones de CORS

app.use(express.json()); // Permite a Express leer JSON en el cuerpo de las peticiones

// ------------------------------------------------------------
// REGISTRAR RUTAS DE LA API
// ------------------------------------------------------------
// Rutas de autenticación
app.use('/api/auth', authRoutes); // Prefijo: /api/auth

// Rutas de productos (sin protección, por ahora solo GET)
app.use('/api/productos', productRoutes); // Prefijo: /api/productos

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Inventario E-commerce PE está corriendo.');
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de la API corriendo en http://localhost:${PORT}`);
});
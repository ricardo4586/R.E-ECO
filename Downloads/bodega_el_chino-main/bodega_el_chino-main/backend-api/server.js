const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product.routes');
const authRoutes = require('./routes/auth.routes'); 

require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// CORS permisivo para desarrollo
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

// ------------------------------------------------------------
// RUTAS
// ------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);

// RUTA DE HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: '✅ Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Inventario E-commerce PE está corriendo.',
        endpoints: {
            health: '/health',
            productos: '/api/productos',
            auth: '/api/auth'
        }
    });
});

// CORRECCIÓN: Manejo de rutas no encontradas - SIN EL *
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: ['/', '/health', '/api/productos', '/api/auth']
    });
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Servidor de la API corriendo`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Red:   http://192.168.1.35:${PORT}`);
  console.log(`📍 Health: http://192.168.1.35:${PORT}/health`);
  console.log(`=================================`);
});
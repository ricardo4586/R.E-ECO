const express = require('express');
const router = express.Router();
const productModel = require('../models/product.model'); // Se requiere el modelo de DB
const authenticateToken = require('../middlewares/auth.middleware'); // Se requiere para proteger rutas

// ------------------------------------------------------------
// RUTAS PÚBLICAS (GET)
// ------------------------------------------------------------

// RUTA: GET /api/productos/catalogo
// Usada por la aplicación React para obtener la lista completa de productos
router.get('/catalogo', async (req, res) => {
    try {
        const products = await productModel.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        // Error 500 si hay problemas con la DB o el servidor
        res.status(500).json({ message: 'Error interno al obtener el catálogo.', error: error.message });
    }
});

// RUTA: GET /api/productos/buscar/:codigo
// Usada por la app Flutter para buscar por código de barras (EAN)
router.get('/buscar/:codigo', async (req, res) => {
    const codigoEAN = req.params.codigo;

    if (!codigoEAN) {
        return res.status(400).json({ message: 'Se requiere el código de barras.' });
    }

    try {
        const product = await productModel.findProductByEAN(codigoEAN);

        if (!product) {
            // Producto no encontrado, importante para el flujo de Flutter (404)
            return res.status(404).json({ message: 'Producto no encontrado con ese código EAN.' });
        }

        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
    }
});

// ------------------------------------------------------------
// RUTAS PROTEGIDAS (CRUD)
// (Requieren un token JWT válido en el encabezado 'Authorization')
// ------------------------------------------------------------

// Middleware de autenticación aplicado a todas las rutas de aquí en adelante
// router.use(authenticateToken); 

// RUTA: POST /api/productos/
// Crear un nuevo producto (Protegida)
router.post('/', /* authenticateToken, */ async (req, res) => {
    // Lógica para crear un producto en la DB usando req.body
    res.status(501).json({ message: "La función de crear producto (POST) está pendiente de implementación." });
});

// RUTA: PUT /api/productos/:id
// Actualizar un producto existente (Protegida)
router.put('/:id', /* authenticateToken, */ async (req, res) => {
    // Lógica para actualizar un producto en la DB usando req.params.id
    res.status(501).json({ message: "La función de actualizar producto (PUT) está pendiente de implementación." });
});

// RUTA: DELETE /api/productos/:id
// Eliminar un producto (Protegida)
router.delete('/:id', /* authenticateToken, */ async (req, res) => {
    // Lógica para eliminar un producto en la DB usando req.params.id
    res.status(501).json({ message: "La función de eliminar producto (DELETE) está pendiente de implementación." });
});

module.exports = router;
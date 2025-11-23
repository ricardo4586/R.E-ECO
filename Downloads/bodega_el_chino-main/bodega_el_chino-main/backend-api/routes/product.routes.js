const express = require('express');
const router = express.Router();
const productModel = require('../models/product.model');
const authenticateToken = require('../middlewares/auth.middleware');

// ------------------------------------------------------------
// RUTAS PÚBLICAS (GET)
// ------------------------------------------------------------

// RUTA: GET /api/productos/catalogo
// Usada por la aplicación React para obtener productos activos
router.get('/catalogo', async (req, res) => {
    try {
        const products = await productModel.getActiveProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno al obtener el catálogo.', 
            error: error.message 
        });
    }
});

// RUTA: GET /api/productos/buscar/:codigo
// Usada por la app Flutter para buscar por código de barras
router.get('/buscar/:codigo', async (req, res) => {
    const codigoEAN = req.params.codigo;

    if (!codigoEAN) {
        return res.status(400).json({ message: 'Se requiere el código de barras.' });
    }

    try {
        const product = await productModel.findProductByEAN(codigoEAN);

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Producto no encontrado con ese código EAN.' 
            });
        }

        res.status(200).json({
            success: true,
            product: product
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor.', 
            error: error.message 
        });
    }
});

// ------------------------------------------------------------
// RUTAS PARA ESCANEO Y GESTIÓN
// ------------------------------------------------------------

// RUTA: POST /api/productos/escaneo
// Flutter envía solo el código de barras escaneado
router.post('/escaneo', async (req, res) => {
    try {
        const { codigo_barras } = req.body;

        if (!codigo_barras) {
            return res.status(400).json({ 
                success: false,
                message: 'Se requiere el código de barras.' 
            });
        }

        // Verificar si el código ya existe
        const existingProduct = await productModel.findProductByEAN(codigo_barras);
        
        if (existingProduct) {
            return res.status(200).json({
                success: true,
                message: 'Código ya registrado',
                product: existingProduct,
                exists: true
            });
        }

        // Crear nuevo producto solo con código de barras (estado: pendiente)
        const newProduct = await productModel.createProductFromScan(codigo_barras);

        res.status(201).json({
            success: true,
            message: 'Código guardado exitosamente',
            product: newProduct,
            exists: false
        });

    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ 
                success: false,
                message: 'El código de barras ya existe.' 
            });
        } else {
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor.', 
                error: error.message 
            });
        }
    }
});

// RUTA: GET /api/productos/pendientes
// Obtener productos pendientes de completar (para React Admin)
router.get('/pendientes', authenticateToken, async (req, res) => {
    try {
        const products = await productModel.getPendingProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener productos pendientes.', 
            error: error.message 
        });
    }
});

// RUTA: GET /api/productos/activos
// Obtener productos completados (para catálogo público)
router.get('/activos', async (req, res) => {
    try {
        const products = await productModel.getActiveProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener productos activos.', 
            error: error.message 
        });
    }
});

// ------------------------------------------------------------
// RUTAS PROTEGIDAS (CRUD - ADMIN)
// ------------------------------------------------------------

// RUTA: POST /api/productos/
// Crear un nuevo producto manualmente (Protegida)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            nombre, 
            precio_unidad, 
            stock_actual, 
            unidad_medida, 
            descripcion, 
            url_imagen,
            codigo_barras 
        } = req.body;

        // Validaciones básicas
        if (!nombre || !precio_unidad || !stock_actual || !unidad_medida || !codigo_barras) {
            return res.status(400).json({ 
                message: 'Todos los campos obligatorios deben ser proporcionados.' 
            });
        }

        const newProduct = await productModel.createProduct({
            nombre,
            precio_unidad: parseFloat(precio_unidad),
            stock_actual: parseInt(stock_actual),
            unidad_medida,
            descripcion: descripcion || '',
            url_imagen: url_imagen || '',
            codigo_barras,
            estado: 'activo' // Crear directamente como activo
        });

        res.status(201).json(newProduct);

    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ 
                message: 'El código de barras ya existe en la base de datos.' 
            });
        } else {
            res.status(500).json({ 
                message: 'Error interno al crear el producto.', 
                error: error.message 
            });
        }
    }
});

// RUTA: PUT /api/productos/:id
// Actualizar un producto existente (Protegida)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;
        const { 
            nombre, 
            precio_unidad, 
            stock_actual, 
            unidad_medida, 
            descripcion, 
            url_imagen,
            codigo_barras,
            estado 
        } = req.body;

        // Verificar que el producto existe
        const existingProduct = await productModel.findProductById(productId);
        if (!existingProduct) {
            return res.status(404).json({ 
                message: 'Producto no encontrado.' 
            });
        }

        // Validaciones básicas
        if (!nombre || !precio_unidad || !stock_actual || !unidad_medida || !codigo_barras) {
            return res.status(400).json({ 
                message: 'Todos los campos obligatorios deben ser proporcionados.' 
            });
        }

        const updatedProduct = await productModel.updateProduct(productId, {
            nombre,
            precio_unidad: parseFloat(precio_unidad),
            stock_actual: parseInt(stock_actual),
            unidad_medida,
            descripcion: descripcion || '',
            url_imagen: url_imagen || '',
            codigo_barras,
            estado: estado || 'activo'
        });

        res.status(200).json(updatedProduct);

    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ 
                message: 'El código de barras ya existe en la base de datos.' 
            });
        } else {
            res.status(500).json({ 
                message: 'Error interno al actualizar el producto.', 
                error: error.message 
            });
        }
    }
});

// RUTA: DELETE /api/productos/:id
// Eliminar un producto (Protegida)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;

        // Verificar que el producto existe
        const existingProduct = await productModel.findProductById(productId);
        if (!existingProduct) {
            return res.status(404).json({ 
                message: 'Producto no encontrado.' 
            });
        }

        const deletedProduct = await productModel.deleteProduct(productId);

        res.status(200).json({ 
            message: 'Producto eliminado correctamente.',
            product: deletedProduct 
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno al eliminar el producto.', 
            error: error.message 
        });
    }
});

// RUTA: GET /api/productos/:id
// Obtener un producto específico por ID (Protegida)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findProductById(productId);

        if (!product) {
            return res.status(404).json({ 
                message: 'Producto no encontrado.' 
            });
        }

        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno al obtener el producto.', 
            error: error.message 
        });
    }
});

module.exports = router;
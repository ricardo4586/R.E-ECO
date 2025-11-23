// ✅ CORREGIDO - Importación correcta
const pool = require('../db/db.config');

const productModel = {
    // Obtener todos los productos (para compatibilidad)
    getAllProducts: async () => {
        try {
            const result = await pool.query(
                'SELECT * FROM productos ORDER BY id_producto DESC'
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Buscar producto por código de barras
    findProductByEAN: async (codigoEAN) => {
        try {
            const result = await pool.query(
                'SELECT * FROM productos WHERE codigo_barras = $1',
                [codigoEAN]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    // Buscar producto por ID
    findProductById: async (id) => {
        try {
            const result = await pool.query(
                'SELECT * FROM productos WHERE id_producto = $1',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    // Crear producto completo
    createProduct: async (productData) => {
        try {
            const { 
                nombre, 
                precio_unidad, 
                stock_actual, 
                unidad_medida, 
                descripcion, 
                url_imagen,
                codigo_barras,
                estado = 'activo'
            } = productData;

            const result = await pool.query(
                `INSERT INTO productos 
                 (nombre, precio_unidad, stock_actual, unidad_medida, descripcion, url_imagen, codigo_barras, estado) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                 RETURNING *`,
                [nombre, precio_unidad, stock_actual, unidad_medida, descripcion, url_imagen, codigo_barras, estado]
            );

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Crear producto solo con código de barras (estado pendiente)
    createProductFromScan: async (codigo_barras) => {
        try {
            const result = await pool.query(
                `INSERT INTO productos 
                 (codigo_barras, estado, fecha_actualizacion) 
                 VALUES ($1, 'pendiente', CURRENT_TIMESTAMP) 
                 RETURNING *`,
                [codigo_barras]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Actualizar producto
    updateProduct: async (id, productData) => {
        try {
            const { 
                nombre, 
                precio_unidad, 
                stock_actual, 
                unidad_medida, 
                descripcion, 
                url_imagen,
                codigo_barras,
                estado 
            } = productData;

            const result = await pool.query(
                `UPDATE productos 
                 SET nombre = $1, precio_unidad = $2, stock_actual = $3, 
                     unidad_medida = $4, descripcion = $5, url_imagen = $6,
                     codigo_barras = $7, estado = $8, fecha_actualizacion = CURRENT_TIMESTAMP
                 WHERE id_producto = $9 
                 RETURNING *`,
                [nombre, precio_unidad, stock_actual, unidad_medida, descripcion, url_imagen, codigo_barras, estado, id]
            );

            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar producto
    deleteProduct: async (id) => {
        try {
            const result = await pool.query(
                'DELETE FROM productos WHERE id_producto = $1 RETURNING *',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    // Obtener productos pendientes
    getPendingProducts: async () => {
        try {
            const result = await pool.query(
                `SELECT * FROM productos 
                 WHERE estado = 'pendiente' 
                 ORDER BY fecha_actualizacion DESC`
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener productos activos
    getActiveProducts: async () => {
        try {
            const result = await pool.query(
                `SELECT * FROM productos 
                 WHERE estado = 'activo' 
                 ORDER BY nombre ASC`
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = productModel;
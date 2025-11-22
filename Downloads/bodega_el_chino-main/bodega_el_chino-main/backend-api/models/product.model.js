// Importamos el pool de conexiones de la DB (necesita el archivo db.config.js)
const pool = require('../db/db.config');

/**
 * Trae todos los productos disponibles en la base de datos para el catálogo web.
 * Se utiliza para poblar la página principal del E-commerce (React).
 * @returns {Promise<Array>} Lista de todos los productos.
 */
const getAllProducts = async () => {
    try {
        // Consulta SQL para ordenar por ID descendente
        const query = 'SELECT * FROM productos ORDER BY id_producto DESC';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error en getAllProducts:", error.message);
        throw new Error('Error al listar los productos del catálogo.');
    }
};

/**
 * Busca un producto por su código de barras (EAN).
 * Se utiliza principalmente por la App Flutter para la función de escaneo.
 * @param {string} codigoEAN El código de barras a buscar.
 * @returns {Promise<object>} El objeto del producto encontrado.
 */
const findProductByEAN = async (codigoEAN) => {
    try {
        // Consulta SQL parametrizada para prevenir inyección SQL
        const query = 'SELECT * FROM productos WHERE codigo_barra_ean = $1';
        const result = await pool.query(query, [codigoEAN]);
        return result.rows[0]; 
    } catch (error) {
        console.error("Error en findProductByEAN:", error.message);
        throw new Error('Error al buscar el producto en la base de datos.');
    }
};

// Exportamos las funciones necesarias para que product.routes.js las use.
module.exports = {
    getAllProducts,
    findProductByEAN,
};
// src/components/admin/ProductManagement.jsx
import React, { useState } from 'react';

const ProductManagement = ({ products, onProductsUpdate, API_BASE_URL }) => {
    // ESTADOS DEL FORMULARIO - AGREGAR CÓDIGO DE BARRAS
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [codigoBarras, setCodigoBarras] = useState(''); // NUEVO ESTADO
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // ... (otros estados se mantienen igual)

    const resetForm = () => {
        setName('');
        setPrice('');
        setStock('');
        setUnit('');
        setDescription('');
        setImageUrl('');
        setCodigoBarras(''); // RESETEAR CÓDIGO BARRAS
        setIsEditing(false);
        setCurrentProductId(null);
        setShowForm(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('Procesando...');
        
        const token = getToken();
        if (!token) {
            setMessage('Error: Usuario no autenticado.');
            setShowErrorModal(true);
            return;
        }

        const productData = { 
            nombre: name, 
            precio_unidad: parseFloat(price), 
            stock_actual: parseInt(stock, 10), 
            unidad_medida: unit, 
            descripcion: description, 
            url_imagen: imageUrl,
            codigo_barras: codigoBarras // INCLUIR CÓDIGO BARRAS
        };

        // ... (resto del código igual)
    };

    const startEdit = (product) => {
        setName(product.nombre);
        setPrice(product.precio_unidad.toString());
        setStock(product.stock_actual.toString());
        setUnit(product.unidad_medida);
        setDescription(product.descripcion || '');
        setImageUrl(product.url_imagen || '');
        setCodigoBarras(product.codigo_barras || ''); // CARGAR CÓDIGO BARRAS
        setCurrentProductId(product.id_producto);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // En el ProductRow, mostrar el código de barras
    const ProductRow = ({ product }) => (
        <tr className="border-b hover:bg-blue-50 transition duration-150">
            <td className="p-4 text-sm font-medium text-gray-900">#{product.id_producto}</td>
            <td className="p-4 text-sm font-mono text-gray-600">
                {product.codigo_barras || 'N/A'}
            </td>
            <td className="p-4 flex items-center">
                <img 
                    src={product.url_imagen || `https://placehold.co/40x40/f1f5f9/94a3b8?text=${product.nombre.substring(0, 1)}`} 
                    alt={product.nombre} 
                    className="w-10 h-10 object-cover rounded-md mr-3" 
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = `https://placehold.co/40x40/f1f5f9/94a3b8?text=${product.nombre.substring(0, 1)}`;
                    }}
                />
                <span className="text-sm text-gray-700 font-medium">{product.nombre}</span>
            </td>
            <td className="p-4 text-sm text-gray-600">S/. {parseFloat(product.precio_unidad).toFixed(2)}</td>
            <td className="p-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    product.stock_actual > 20 ? 'bg-green-100 text-green-800' : 
                    product.stock_actual > 5 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                }`}>
                    {product.stock_actual} {product.unidad_medida}
                </span>
            </td>
            <td className="p-4 text-sm text-gray-600 hidden md:table-cell">
                {new Date(product.fecha_actualizacion).toLocaleDateString('es-PE')}
            </td>
            <td className="p-4 flex space-x-2">
                {/* Botones de editar y eliminar igual */}
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            {/* ... (código anterior igual) */}
            
            {/* FORMULARIO ACTUALIZADO CON CÓDIGO DE BARRAS */}
            <div className={`transition-all duration-300 overflow-hidden ${showForm ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
                    <h3 className="text-2xl font-bold text-blue-600 mb-6">
                        {isEditing ? `✏️ Editando Producto #${currentProductId}` : '✨ Añadir Nuevo Producto'}
                    </h3>
                    
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* NUEVO CAMPO: CÓDIGO DE BARRAS */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Código de Barras *
                                </label>
                                <input 
                                    type="text" 
                                    value={codigoBarras} 
                                    onChange={(e) => setCodigoBarras(e.target.value)} 
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono" 
                                    placeholder="1234567890123"
                                    required 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Este código será escaneado por la app Flutter
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Producto *
                                </label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                                    required 
                                />
                            </div>
                            
                            {/* Resto de campos igual */}
                        </div>

                        {/* ... (resto del formulario igual) */}
                    </form>
                </div>
            </div>

            {/* TABLA ACTUALIZADA CON COLUMNA DE CÓDIGO BARRAS */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Inventario Actual ({products.length})</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Código Barras</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Actualización</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-500">
                                        No hay productos en el inventario.
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <ProductRow key={product.id_producto} product={product} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Modals */}
            <DeleteConfirmationModal />
            <ErrorModal />
        </div>
    );
};

export default ProductManagement;
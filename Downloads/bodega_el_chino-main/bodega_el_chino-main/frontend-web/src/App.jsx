import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, LayoutList, LogOut, Settings, BarChart3, Users, Box } from 'lucide-react';

// CORRECCIÓN: URL LOCAL para desarrollo (Backend de Node.js)
const API_BASE_URL = 'http://localhost:3000/api';

// --- Componentes ---

// 1. Componente de Gestión de Productos (ProductManagement)
const ProductManagement = ({ products, onProductsUpdate }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    
    // Estados para el Modal de Confirmación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false); // Para mostrar errores sin alert()

    // Obtiene el token del localStorage (asume que el usuario está autenticado)
    const getToken = () => localStorage.getItem('userToken');

    const resetForm = () => {
        setName('');
        setPrice('');
        setStock('');
        setUnit('');
        setDescription('');
        setImageUrl('');
        setIsEditing(false);
        setCurrentProductId(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('Procesando...');

        const token = getToken();
        if (!token) {
            setMessage('Error: Usuario no autenticado. Por favor, inicie sesión de nuevo.');
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
        };

        const method = isEditing ? 'PUT' : 'POST';
        const endpoint = isEditing
            ? `${API_BASE_URL}/productos/${currentProductId}`
            : `${API_BASE_URL}/productos`;

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Éxito: ${isEditing ? 'Producto actualizado' : 'Producto creado'} correctamente.`);
                resetForm();
                onProductsUpdate(); // Refresca el catálogo principal
            } else {
                setMessage(`Error al ${isEditing ? 'actualizar' : 'crear'} producto: ${data.message || 'Verifique los datos.'}`);
            }
        } catch (error) {
            setMessage('Error de conexión al servidor Node.js.');
        }
    };

    const initiateDelete = (product) => {
        const token = getToken();
        if (!token) {
            setMessage('Error: Usuario no autenticado. Por favor, inicie sesión de nuevo.');
            setShowErrorModal(true);
            return;
        }
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        setShowDeleteModal(false); // Cierra el modal antes de la operación
        setMessage('Eliminando...');

        const id = productToDelete.id_producto;
        const token = getToken();

        try {
            const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Éxito: Producto #${id} eliminado.`);
                setProductToDelete(null);
                onProductsUpdate();
            } else {
                setMessage(`Error al eliminar producto: ${data.message}`);
            }
        } catch (error) {
            setMessage('Error de conexión al servidor Node.js.');
        }
    };

    const startEdit = (product) => {
        setName(product.nombre);
        setPrice(product.precio_unidad.toString());
        setStock(product.stock_actual.toString());
        setUnit(product.unidad_medida);
        setDescription(product.descripcion || '');
        setImageUrl(product.url_imagen || '');
        setCurrentProductId(product.id_producto);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Sub-componente para la fila de producto
    const ProductRow = ({ product }) => (
        <tr className="border-b hover:bg-blue-50 transition duration-150">
            <td className="p-4 text-sm font-medium text-gray-900">#{product.id_producto}</td>
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
                    product.stock_actual > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                    {product.stock_actual} {product.unidad_medida}
                </span>
            </td>
            <td className="p-4 text-sm text-gray-600 hidden md:table-cell">{new Date(product.fecha_actualizacion).toLocaleDateString('es-PE')}</td>
            <td className="p-4 flex space-x-2">
                <button
                    onClick={() => startEdit(product)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition"
                    title="Editar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button
                    onClick={() => initiateDelete(product)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition"
                    title="Eliminar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/></svg>
                </button>
            </td>
        </tr>
    );

    // Sub-componente Modal de Confirmación
    const DeleteConfirmationModal = () => {
        if (!showDeleteModal || !productToDelete) return null;

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full transform transition-all">
                    <div className="text-center">
                        <div className="text-5xl text-red-500 mb-4">🗑️</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Confirmar Eliminación</h3>
                        <p className="text-base text-gray-600 mb-6">
                            Estás a punto de eliminar permanentemente el producto **{productToDelete.nombre}**. ¿Continuar?
                        </p>
                    </div>
                    <div className="flex justify-between space-x-3">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setProductToDelete(null);
                            }}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDeleteProduct}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Sub-componente Modal de Error Genérico
    const ErrorModal = () => {
        if (!showErrorModal) return null;
        
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full transform transition-all">
                    <div className="text-center">
                        <div className="text-5xl text-yellow-500 mb-4">🛑</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Acceso Denegado</h3>
                        <p className="text-base text-gray-600 mb-6">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowErrorModal(false)}
                        className="w-full px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        );
    };


    return (
        <div className="space-y-12">
            {/* Formulario de Creación/Edición */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-blue-600 mb-6">
                    {isEditing ? `✏️ Editando Producto #${currentProductId}` : '✨ Añadir Nuevo Producto'}
                </h3>
                {message && !showErrorModal && (
                    <div className={`mb-6 p-4 rounded-xl text-center font-semibold ${
                        message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        {/* Precio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Precio por Unidad (S/.) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        {/* Stock */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Actual *</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        {/* Unidad de Medida */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unidad de Medida (Ej: Kg, Litro, Unidad) *</label>
                            <input
                                type="text"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* URL Imagen */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen (Opcional)</label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition duration-200 shadow-md"
                        >
                            {isEditing ? '💾 Guardar Cambios' : '➕ Crear Producto'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="py-3 px-6 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition duration-200"
                            >
                                Cancelar Edición
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Listado de Productos */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Lista de Productos ({products.length})</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
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
                                    <td colSpan="6" className="text-center py-10 text-gray-500">No hay productos en el inventario.</td>
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

// 2. Componente de Vista del Administrador (AdminView)
const AdminView = ({ user, onLogout, setView }) => {
    const AdminCard = ({ title, icon: Icon, description, view }) => (
        <div
            onClick={() => setView(view)}
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        >
            <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                    <Icon className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-200">
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
                        <Settings className="w-8 h-8 mr-3 text-blue-600"/> Panel de Administración
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">Bienvenido/a, Admin</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition duration-200 shadow-md"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Salir
                        </button>
                    </div>
                </div>

                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Módulos Principales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AdminCard
                            title="Gestión de Productos"
                            icon={Box}
                            description="Añadir, editar y eliminar productos del catálogo."
                            view="gestion-productos"
                        />
                        <AdminCard
                            title="Estadísticas y Reportes"
                            icon={BarChart3}
                            description="Visualizar ventas, stock y tendencias."
                            view="estadisticas"
                        />
                        <AdminCard
                            title="Gestión de Usuarios"
                            icon={Users}
                            description="Administrar cuentas de administradores y clientes."
                            view="gestion-usuarios"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. Componente de Diseño Base (Layout)
const Layout = ({ children, user, goToCatalog, setView }) => {
    const navItemClass = "flex items-center px-3 py-2 rounded-xl text-sm font-medium transition duration-150";

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header / Navigation */}
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo/Title */}
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-xl">F</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-800">Tienda Demo</span>
                        </div>

                        {/* Nav Links */}
                        <nav className="flex space-x-4">
                            <button
                                onClick={goToCatalog}
                                className={`${navItemClass} text-blue-600 bg-blue-50 hover:bg-blue-100`}
                            >
                                <LayoutList className="w-5 h-5 mr-2" /> Catálogo
                            </button>

                            {user ? (
                                <>
                                    <button
                                        onClick={() => setView('admin')}
                                        className={`${navItemClass} text-green-600 bg-green-50 hover:bg-green-100`}
                                    >
                                        <Settings className="w-5 h-5 mr-2" /> Admin Panel
                                    </button>
                                    <span className="text-gray-500 flex items-center text-sm font-medium">| {user.email}</span>
                                </>
                            ) : (
                                <button
                                    onClick={() => setView('login')}
                                    className={`${navItemClass} text-purple-600 bg-purple-50 hover:bg-purple-100`}
                                >
                                    <LogOut className="w-5 h-5 mr-2" /> Login Admin
                                </button>
                            )}

                            <button
                                className={`${navItemClass} text-red-600 bg-red-50 hover:bg-red-100`}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" /> Carrito (0)
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm">&copy; {new Date().getFullYear()} Tienda Demo. Desarrollado con React y Node.js/PostgreSQL. | Backend: {API_BASE_URL}</p>
                </div>
            </footer>
        </div>
    );
};


// --- Componentes Reutilizables Originales ---

// 4. Componente de Login y Registro (AuthForm)
const AuthForm = ({ type, onAuthSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLogin, setIsLogin] = useState(type === 'login');

    const endpoint = `${API_BASE_URL}/auth/${isLogin ? 'login' : 'register'}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Procesando...');

        try {
            // Implementación de retraso con backoff para manejo de errores de red
            let response = null;
            let data = null;
            const maxRetries = 3;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    data = await response.json();
                    break; // Salir del bucle si la llamada es exitosa
                } catch (err) {
                    if (i === maxRetries - 1) throw err; // Re-lanzar error en el último intento
                    const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }


            if (response.ok) {
                setMessage(data.message);
                if (isLogin && data.token) {
                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('userEmail', data.user.email);
                    onAuthSuccess(data.user);
                }
            } else {
                setMessage(`Error: ${data.message || 'Credenciales inválidas.'}`);
            }
        } catch (error) {
            setMessage('Error de conexión con el servidor Node.js. Verifique si el backend está corriendo.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {isLogin ? 'Iniciar Sesión' : 'Registrar Admin'}
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {isLogin ? 'Accede al panel de administración' : 'Crea una cuenta de administrador'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition duration-200 shadow-lg transform hover:-translate-y-0.5"
                    >
                        {isLogin ? '🔐 Iniciar Sesión' : '👤 Crear Cuenta'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl text-center ${
                        message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                        {message}
                    </div>
                )}

                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full mt-6 text-center text-blue-600 hover:text-blue-800 font-medium transition duration-200"
                >
                    {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí'}
                </button>
            </div>
        </div>
    );
};

// 5. Vista de Catálogo
const CatalogView = ({ products, loading, error, viewProductDetail }) => {
    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Cargando catálogo...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl text-center">
                <div className="text-6xl mb-4">😞</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar el catálogo</h2>
                <p className="text-gray-600">{error}</p>
                <a href="https://github.com/GoogleCloudPlatform/gemini-canvas-backend-repo" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-blue-600 hover:text-blue-800 transition font-semibold">
                    Instrucciones para iniciar el Backend
                </a>
            </div>
        </div>
    );

    const ProductCard = ({ product }) => (
        <div
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden group"
            onClick={() => viewProductDetail(product)}
        >
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 h-48">
                <img
                    src={product.url_imagen || `https://placehold.co/300x300/2563eb/ffffff?text=${product.nombre.substring(0, 1)}`}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src=`https://placehold.co/300x300/2563eb/ffffff?text=${product.nombre.substring(0, 1)}`
                    }}
                />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                    product.stock_actual > 20 ? 'bg-green-500 text-white' :
                    product.stock_actual > 5 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    {product.stock_actual}u
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition duration-200 h-12">
                    {product.nombre}
                </h3>

                <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-red-600">
                        S/. {parseFloat(product.precio_unidad).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.unidad_medida}
                    </span>
                </div>

                <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition duration-200 transform group-hover:scale-105">
                    Ver Detalles
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Nuestro Catálogo
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Descubre los mejores productos para tu hogar al mejor precio
                    </p>
                    <div className="mt-4 bg-white inline-flex items-center px-4 py-2 rounded-full shadow-lg">
                        <span className="text-sm text-gray-500 mr-2">Total de productos:</span>
                        <span className="font-bold text-blue-600">{products.length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-lg">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-2xl font-semibold text-gray-500">Catálogo Vacío</p>
                            <p className="text-gray-400 mt-2 max-w-md mx-auto">
                                Agregue productos desde el módulo de administración o inicie el backend.
                            </p>
                        </div>
                    ) : (
                        products.map(product => (
                            <ProductCard key={product.id_producto} product={product} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// 6. Vista de Detalle del Producto
const DetailView = ({ product, goToCatalog }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={goToCatalog}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition duration-200 font-semibold group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 transform group-hover:-translate-x-1 transition-transform">
                        <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
                    </svg>
                    Volver al Catálogo
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="lg:flex">
                    <div className="lg:w-1/2 bg-gradient-to-br from-blue-100 to-indigo-100 p-8 flex items-center justify-center">
                        <div className="relative">
                            <img
                                src={product.url_imagen || `https://placehold.co/500x500/2563eb/ffffff?text=${product.nombre.substring(0, 1)}`}
                                alt={product.nombre}
                                className="w-full max-w-md h-auto object-contain rounded-2xl shadow-lg transform hover:scale-105 transition duration-300"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src=`https://placehold.co/500x500/2563eb/ffffff?text=${product.nombre.substring(0, 1)}`
                                }}
                            />
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${
                                product.stock_actual > 20 ? 'bg-green-500 text-white' :
                                product.stock_actual > 5 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                                {product.stock_actual > 5 ? 'En Stock' : 'Últimas unidades'}
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 p-8 lg:p-12">
                        <div className="mb-4">
                            <span className="text-sm text-blue-600 font-semibold uppercase tracking-wide">
                                {product.unidad_medida || 'Producto'}
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-2 leading-tight">
                                {product.nombre}
                            </h1>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline">
                                <span className="text-5xl lg:text-6xl font-extrabold text-red-600">
                                    S/. {parseFloat(product.precio_unidad).toFixed(2)}
                                </span>
                                <span className="ml-3 text-xl text-gray-500">/{product.unidad_medida || 'unidad'}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Precio incluye IGV</p>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Descripción</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {product.descripcion || "Producto de alta calidad disponible en nuestra bodega. Perfecto para uso diario y necesidades del hogar."}
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
                            <h3 className="text-xl font-semibold text-blue-800 mb-3">📦 Información de Inventario</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Stock disponible</p>
                                    <p className={`text-2xl font-bold ${
                                        product.stock_actual > 20 ? 'text-green-600' :
                                        product.stock_actual > 5 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {product.stock_actual} unidades
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Código</p>
                                    <p className="text-lg font-mono font-semibold text-gray-800">#{product.id_producto}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-3">
                                📅 Actualizado: {new Date(product.fecha_actualizacion).toLocaleDateString('es-PE')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-xl hover:from-red-700 hover:to-red-800 transition duration-200 shadow-lg transform hover:-translate-y-1">
                                🛒 Añadir al Carrito
                            </button>

                            <button className="w-full py-3 border-2 border-blue-600 text-blue-600 font-semibold text-lg rounded-xl hover:bg-blue-600 hover:text-white transition duration-200">
                                💖 Agregar a Favoritos
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl mb-2">🚚</div>
                    <h3 className="font-semibold text-gray-800 mb-2">Envío Rápido</h3>
                    <p className="text-gray-600 text-sm">Entrega en 24-48 horas en Lima</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl mb-2">🔄</div>
                    <h3 className="font-semibold text-gray-800 mb-2">Devolución Fácil</h3>
                    <p className="text-gray-600 text-sm">30 días para devoluciones</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <h3 className="font-semibold text-gray-800 mb-2">Pago Seguro</h3>
                    <p className="text-gray-600 text-sm">Transacciones protegidas</p>
                </div>
            </div>
        </div>
    </div>
);


// --- Componente Principal ---
const App = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('catalogo');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Chequea si el usuario ya tiene un token de admin guardado
        const storedToken = localStorage.getItem('userToken');
        const storedEmail = localStorage.getItem('userEmail');
        if (storedToken && storedEmail) {
            setUser({ email: storedEmail, token: storedToken });
            setView('admin');
        }
        fetchProducts();
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Implementación de retraso con backoff para manejo de errores de red
            let response = null;
            let data = null;
            const maxRetries = 3;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    response = await fetch(`${API_BASE_URL}/productos/catalogo`);
                    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                    data = await response.json();
                    setProducts(data);
                    return; // Salir de la función si es exitoso
                } catch (err) {
                    if (i === maxRetries - 1) throw err; // Re-lanzar error en el último intento
                    const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        } catch (err) {
            setError(`No se pudo cargar el catálogo. Verifique: 1) Que el servidor Node.js esté corriendo en ${API_BASE_URL}. 2) Que la tabla 'productos' exista.`);
            setProducts([]); // Asegura que no haya datos viejos si falla
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setView('admin');
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        setUser(null);
        setView('catalogo');
    };

    const viewProductDetail = (product) => {
        setSelectedProduct(product);
        setView('detalle');
    };

    const goToCatalog = () => {
        setSelectedProduct(null);
        setView('catalogo');
        // Asegura que el catálogo esté actualizado al volver
        fetchProducts();
    };

    const renderView = () => {
        switch (view) {
            case 'login':
                return <AuthForm type="login" onAuthSuccess={handleAuthSuccess} />;
            case 'registro':
                return <AuthForm type="register" onAuthSuccess={handleAuthSuccess} />;
            case 'admin':
                if (user) {
                    return <AdminView user={user} onLogout={handleLogout} setView={setView} />;
                }
                return <AuthForm type="login" onAuthSuccess={handleAuthSuccess} />;
            case 'detalle':
                return selectedProduct ? <DetailView product={selectedProduct} goToCatalog={goToCatalog} /> : goToCatalog();

            // --- VISTAS DEL PANEL DE ADMINISTRACIÓN ---
            case 'gestion-productos':
                if (!user) return <AuthForm type="login" onAuthSuccess={handleAuthSuccess} />;
                return (
                    <div className="min-h-screen bg-gray-100 py-8">
                        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gray-800">📦 Gestión de Productos</h2>
                                <button
                                    onClick={() => setView('admin')}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-semibold flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
                                    Volver al Panel
                                </button>
                            </div>

                            <ProductManagement
                                products={products}
                                onProductsUpdate={fetchProducts}
                            />
                        </div>
                    </div>
                );

            case 'estadisticas':
            case 'gestion-usuarios':
                if (!user) return <AuthForm type="login" onAuthSuccess={handleAuthSuccess} />;
                const isStats = view === 'estadisticas';
                return (
                    <div className="min-h-screen bg-gray-100 py-8">
                        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gray-800">{isStats ? '📊 Estadísticas y Reportes' : '👥 Gestión de Usuarios'}</h2>
                                <button
                                    onClick={() => setView('admin')}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-semibold flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
                                    Volver al Panel
                                </button>
                            </div>
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">{isStats ? '📈' : '👨‍💼'}</div>
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4">{isStats ? 'Reportes en Desarrollo' : 'Gestión de Usuarios'}</h3>
                                <p className="text-gray-500">Este módulo estará disponible en futuras actualizaciones.</p>
                            </div>
                        </div>
                    </div>
                );
            // --- FIN VISTAS DEL PANEL ---

            case 'catalogo':
            default:
                return <CatalogView products={products} loading={loading} error={error} viewProductDetail={viewProductDetail} />;
        }
    };

    // Para las vistas de login/registro, no usar Layout
    if (view === 'login' || view === 'registro') {
        return renderView();
    }

    // Para otras vistas, usar Layout
    return (
        <Layout user={user} goToCatalog={goToCatalog} setView={setView}>
            {renderView()}
        </Layout>
    );
};

export default App;
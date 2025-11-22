import React, { useState } from 'react';

// Agregar la URL base de la API
const API_BASE_URL = 'http://localhost:3000/api';

const Layout = ({ children, user, products, goToCatalog, setView }) => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FALANODE Store
            </h1>
          </div>
          
          <nav className="flex items-center space-x-3">
            <button
              onClick={goToCatalog}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition duration-200 font-semibold flex items-center space-x-2"
            >
              <span>🛍️</span>
              <span>Catálogo ({products.length})</span>
            </button>
            
            {!user ? (
              <button
                onClick={() => setView('login')}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition duration-200 font-semibold shadow-lg"
              >
                🔐 Login Admin
              </button>
            ) : (
              <button
                onClick={() => setView('admin')}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition duration-200 font-semibold shadow-lg"
              >
                ⚙️ Panel Admin
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">FALANODE E-commerce</h3>
            <p className="text-gray-300 mb-4">
              Tu bodega virtual de confianza - Los mejores productos al mejor precio
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>📞 +51 999 888 777</span>
              <span>✉️ info@falanode.com</span>
              <span>🕒 24/7 Disponible</span>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Sistema E-commerce Integrador (DAWA Módulo 7: Autenticación)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// 6. Componente de Gestión de Productos (CRUD Completo)
const ProductManagement = ({ products, onProductsUpdate }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_unidad: '',
    stock_actual: '',
    unidad_medida: 'unidad',
    url_imagen: ''
  });

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio_unidad: '',
      stock_actual: '',
      unidad_medida: 'unidad',
      url_imagen: ''
    });
    setEditingProduct(null);
    setShowForm(false);
    setMessage('');
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cargar producto para edición
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      precio_unidad: product.precio_unidad || '',
      stock_actual: product.stock_actual || '',
      unidad_medida: product.unidad_medida || 'unidad',
      url_imagen: product.url_imagen || ''
    });
    setShowForm(true);
  };

  // Crear o actualizar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingProduct 
        ? `${API_BASE_URL}/productos/${editingProduct.id_producto}`
        : `${API_BASE_URL}/productos`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const token = localStorage.getItem('userToken');
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(editingProduct ? '✅ Producto actualizado correctamente' : '✅ Producto creado correctamente');
        resetForm();
        onProductsUpdate(); // Recargar productos
      } else {
        setMessage(`❌ Error: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setMessage('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/productos/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('✅ Producto eliminado correctamente');
        onProductsUpdate(); // Recargar productos
      } else {
        const data = await response.json();
        setMessage(`❌ Error: ${data.error || 'Error al eliminar'}`);
      }
    } catch (error) {
      setMessage('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensajes */}
      {message && (
        <div className={`p-4 rounded-xl text-center font-semibold ${
          message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total Productos</p>
          <p className="text-2xl font-bold text-blue-700">{products.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <p className="text-sm text-green-600 font-medium">En Stock Alto</p>
          <p className="text-2xl font-bold text-green-700">
            {products.filter(p => p.stock_actual > 20).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">Stock Medio</p>
          <p className="text-2xl font-bold text-yellow-700">
            {products.filter(p => p.stock_actual > 5 && p.stock_actual <= 20).length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <p className="text-sm text-red-600 font-medium">Stock Bajo</p>
          <p className="text-2xl font-bold text-red-700">
            {products.filter(p => p.stock_actual <= 5).length}
          </p>
        </div>
      </div>

      {/* Botón para agregar producto */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Lista de Productos</h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg"
        >
          ➕ Agregar Producto
        </button>
      </div>

      {/* Formulario de producto */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio (S/.) *</label>
              <input
                type="number"
                step="0.01"
                name="precio_unidad"
                value={formData.precio_unidad}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
              <input
                type="number"
                name="stock_actual"
                value={formData.stock_actual}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidad de Medida</label>
              <select
                name="unidad_medida"
                value={formData.unidad_medida}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="litro">Litro</option>
                <option value="paquete">Paquete</option>
                <option value="caja">Caja</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del producto..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
              <input
                type="url"
                name="url_imagen"
                value={formData.url_imagen}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? '⏳ Procesando...' : (editingProduct ? '💾 Actualizar' : '✅ Crear')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition font-semibold"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de productos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id_producto} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {product.url_imagen ? (
                          <img 
                            src={product.url_imagen} 
                            alt={product.nombre}
                            className="h-8 w-8 rounded object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://placehold.co/40x40/2563eb/ffffff?text=${product.nombre.substring(0, 1)}`;
                            }}
                          />
                        ) : (
                          <span className="text-blue-600 font-bold text-sm">
                            {product.nombre.substring(0, 1)}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.nombre}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {product.descripcion || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-red-600">
                      S/. {parseFloat(product.precio_unidad).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock_actual > 20 
                        ? 'bg-green-100 text-green-800' 
                        : product.stock_actual > 5 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_actual} u
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.unidad_medida}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3 transition duration-200"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id_producto)}
                      className="text-red-600 hover:text-red-900 transition duration-200"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay productos</h3>
            <p className="text-gray-500">Agrega tu primer producto usando el botón "Agregar Producto"</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Exportar ambos componentes
export { ProductManagement };
export default Layout;
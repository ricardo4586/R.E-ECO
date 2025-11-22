import React, { useState, useEffect, useCallback } from 'react';

// CORRECCIÓN: URL LOCAL para desarrollo (Backend de Node.js)
const API_BASE_URL = 'http://localhost:3000/api'; 

// --- Componentes Reutilizables ---

// 1. Componente de Login y Registro (AuthForm)
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
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        if (isLogin && data.token) {
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userEmail', data.user.email);
          onAuthSuccess(data.user);
        }
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor Node.js.');
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

// 2. Vista de Administración
const AdminView = ({ user, onLogout }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Bienvenido, <span className="font-semibold text-blue-600">{user.email}</span>
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition duration-200 font-semibold shadow-lg"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Gestión de Productos</h3>
            <p className="text-gray-600">Agrega, edita o elimina productos del catálogo</p>
            <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Gestionar Productos
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Estadísticas</h3>
            <p className="text-gray-600">Visualiza reportes y métricas de ventas</p>
            <button className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Ver Reportes
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Usuarios</h3>
            <p className="text-gray-600">Administra usuarios y permisos</p>
            <button className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              Gestionar Usuarios
            </button>
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">🚧 En Desarrollo</h3>
          <p className="text-yellow-700">
            Las funciones de <strong>CRUD</strong> (Crear, Leer, Actualizar, Eliminar) para productos estarán disponibles pronto.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// 3. Vista de Catálogo
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
                Agregue productos desde la consola PSQL o desde el módulo de administración.
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

// 4. Vista de Detalle del Producto
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

// 5. Componente Layout
const Layout = ({ children, user, products, goToCatalog, setView }) => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
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

      <main className="flex-1">
        {children}
      </main>

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

// --- Componente Principal ---
const App = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('catalogo');
  const [user, setUser] = useState(null);

  useEffect(() => {
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
      const response = await fetch(`${API_BASE_URL}/productos/catalogo`);
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(`No se pudo cargar el catálogo. Verifique: 1) Que el servidor Node.js esté corriendo en http://localhost:3000. 2) Que la tabla 'productos' exista.`);
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
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return <AuthForm type="login" onAuthSuccess={handleAuthSuccess} />;
      case 'registro':
        return <AuthForm type="register" onAuthSuccess={handleAuthSuccess} />;
      case 'admin':
        if (user) {
          return <AdminView user={user} onLogout={handleLogout} />;
        }
        return <AuthForm type="login" onAuthSuccess={handleAuthSuccess} />;
      case 'detalle':
        return selectedProduct ? <DetailView product={selectedProduct} goToCatalog={goToCatalog} /> : goToCatalog();
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
    <Layout user={user} products={products} goToCatalog={goToCatalog} setView={setView}>
      {renderView()}
    </Layout>
  );
};

export default App;
import React, { useState, useEffect, useCallback } from 'react';

// ¡¡¡IMPORTANTE!!! REEMPLAZAR ESTA URL con la URL pública de su API de Render
const API_BASE_URL = 'https://[SU-URL-PUBLICA-RENDER].onrender.com/api/productos';

// Componente principal de la aplicación React
const App = () => {
  // Estado para manejar la vista actual: 'catalogo' o 'detalle'
  const [view, setView] = useState('catalogo'); 
  // Estado para almacenar la lista de productos del catálogo
  const [products, setProducts] = useState([]);
  // Estado para almacenar el producto seleccionado en la vista de detalle
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Estado para manejar la carga y los errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. LÓGICA DE OBTENER EL CATÁLOGO COMPLETO ---

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/catalogo`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error al obtener el catálogo:', err);
      setError('No se pudo cargar el catálogo. Verifique si su Backend de Render está activo y la variable DATABASE_URL es correcta.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- 2. LÓGICA DE NAVEGACIÓN Y DETALLE ---
  
  // Función para ver el detalle de un producto
  const viewProductDetail = (product) => {
    setSelectedProduct(product);
    setView('detalle');
  };

  // Función para regresar al catálogo
  const goToCatalog = () => {
    setSelectedProduct(null);
    setView('catalogo');
  };

  // --- 3. COMPONENTE VISUAL DEL PRODUCTO EN LA GRILLA ---
  const ProductCard = ({ product }) => (
    <div 
      className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
      onClick={() => viewProductDetail(product)}
    >
      <div className="flex-shrink-0 w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        {/* Usamos un placeholder si no hay imagen en la DB */}
        <img 
          src={product.url_imagen || `https://placehold.co/150x150/2563eb/ffffff?text=${product.nombre.substring(0, 1)}`} 
          alt={product.nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
             e.target.onerror = null; 
             e.target.src=`https://placehold.co/150x150/2563eb/ffffff?text=${product.nombre.substring(0, 1)}`
          }}
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">{product.nombre}</h3>
      <p className="text-2xl font-bold text-red-600 mb-2">
        S/. {parseFloat(product.precio_unidad).toFixed(2)}
      </p>
      <div className="mt-auto">
        <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${
          product.stock_actual > 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          Stock: {product.stock_actual}
        </span>
      </div>
    </div>
  );

  // --- 4. VISTA DE CATÁLOGO (Principal) ---
  const CatalogView = () => {
    if (loading) return <div className="text-center text-blue-600 text-xl mt-12">Cargando Catálogo...</div>;
    if (error) return <div className="text-center text-red-600 text-xl mt-12 p-4 bg-red-100 rounded-lg">{error}</div>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-2xl font-semibold text-gray-500">Catálogo Vacío</p>
            <p className="text-gray-400 mt-2">Agregue productos desde la consola PSQL (código de barras: 7751234567890)</p>
          </div>
        ) : (
          products.map(product => (
            <ProductCard key={product.id_producto} product={product} />
          ))
        )}
      </div>
    );
  };

  // --- 5. VISTA DE DETALLE DEL PRODUCTO (Tipo Falabella) ---
  const DetailView = ({ product }) => (
    <div className="p-6 max-w-6xl mx-auto">
      <button 
        onClick={goToCatalog}
        className="text-blue-600 hover:text-blue-800 mb-6 flex items-center transition duration-150"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        Volver al Catálogo
      </button>

      <div className="bg-white rounded-xl shadow-2xl p-6 lg:flex lg:space-x-8">
        {/* Columna de Imagen */}
        <div className="lg:w-1/2 flex justify-center items-center bg-gray-50 p-4 rounded-lg">
          <img 
            src={product.url_imagen || `https://placehold.co/400x400/2563eb/ffffff?text=${product.nombre.substring(0, 1)}`}
            alt={product.nombre}
            className="max-h-96 object-contain rounded-lg"
             onError={(e) => {
               e.target.onerror = null; 
               e.target.src=`https://placehold.co/400x400/2563eb/ffffff?text=${product.nombre.substring(0, 1)}`
            }}
          />
        </div>

        {/* Columna de Información */}
        <div className="lg:w-1/2 mt-6 lg:mt-0">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.nombre}</h1>
          <p className="text-xl text-gray-500 mb-4">ID de Producto: {product.id_producto}</p>
          
          <div className="flex items-baseline mb-6 border-b pb-4">
            <span className="text-5xl font-extrabold text-red-600">
              S/. {parseFloat(product.precio_unidad).toFixed(2)}
            </span>
            <span className="ml-3 text-xl text-gray-500">por {product.unidad_medida}</span>
          </div>
          
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">Descripción del Producto</h2>
          <p className="text-gray-600 mb-6 whitespace-pre-line">
            {product.descripcion || "Este producto aún no tiene una descripción detallada. Puede agregarla usando un módulo de administración."}
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg font-medium text-blue-800">
              Inventario y Gestión
            </p>
            <p className="text-gray-700">Stock Actual: 
              <span className={`ml-2 font-bold ${product.stock_actual > 5 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock_actual} unidades
              </span>
            </p>
            <p className="text-gray-700 text-sm mt-1">
              Última actualización: {new Date(product.fecha_actualizacion).toLocaleString()}
            </p>
          </div>
          
          <button
            className="w-full mt-6 py-3 bg-red-600 text-white font-bold text-xl rounded-lg hover:bg-red-700 transition duration-150 shadow-lg"
          >
            Añadir al Carrito (Simulación)
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-blue-600">
            FALANODE E-commerce PE
          </h1>
          <nav>
             <button
              onClick={goToCatalog}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Catálogo ({products.length})
            </button>
          </nav>
        </div>
      </header>

      <main>
        {view === 'catalogo' && <CatalogView />}
        {view === 'detalle' && selectedProduct && <DetailView product={selectedProduct} />}
      </main>

      <footer className="bg-gray-800 text-white text-center py-4 mt-12">
        Sistema E-commerce Integrador | Backend Node.js/Render - Frontend React
      </footer>
    </div>
  );
};

export default App;
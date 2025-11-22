// 2. Vista de Administración - VERSIÓN CORREGIDA
const AdminView = ({ user, onLogout, setView }) => {
  // Función para manejar la navegación
  const handleNavigation = (viewName) => {
    console.log('🟡 Navegando a:', viewName);
    setView(viewName);
  };

  return (
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition duration-200 cursor-pointer group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition duration-200">📦</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Gestión de Productos</h3>
              <p className="text-gray-600">Agrega, edita o elimina productos del catálogo</p>
              <button 
                onClick={() => handleNavigation('gestion-productos')}
                className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold shadow-lg transform group-hover:scale-105"
              >
                Gestionar Productos
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 transition duration-200 cursor-pointer group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition duration-200">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Estadísticas</h3>
              <p className="text-gray-600">Visualiza reportes y métricas de ventas</p>
              <button 
                onClick={() => handleNavigation('estadisticas')}
                className="mt-4 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-semibold shadow-lg transform group-hover:scale-105"
              >
                Ver Reportes
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition duration-200 cursor-pointer group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition duration-200">👥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Usuarios</h3>
              <p className="text-gray-600">Administra usuarios y permisos</p>
              <button 
                onClick={() => handleNavigation('gestion-usuarios')}
                className="mt-4 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-semibold shadow-lg transform group-hover:scale-105"
              >
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
};
import React from 'react';

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

export default Layout;
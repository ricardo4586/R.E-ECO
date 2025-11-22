import React from 'react';

const Dashboard = ({ onNavigate }) => {
  const adminCards = [
    {
      id: 'products',
      title: '📦 Gestión de Productos',
      description: 'Agregar, editar o eliminar productos del catálogo',
      buttonText: 'Gestionar Productos',
      color: 'blue'
    },
    {
      id: 'stats', 
      title: '📈 Estadísticas',
      description: 'Visualizar reportes y métricas de ventas',
      buttonText: 'Ver Reportes',
      color: 'green'
    },
    {
      id: 'users',
      title: '👥 Usuarios', 
      description: 'Administrar usuarios y permisos',
      buttonText: 'Gestionar Usuarios',
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100', 
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
    };
    return colors[color] || colors.blue;
  };

  // VERIFICAR QUE ESTA FUNCIÓN ESTÉ BIEN
  const handleCardClick = (cardId) => {
    console.log('Card clicked:', cardId); // Para debug
    if (onNavigate) {
      onNavigate(cardId);
    } else {
      console.error('onNavigate prop is missing!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Panel de Administración</h2>
      <p className="text-gray-600 mb-6">Bienvenido al centro de control de FALANODE Store</p>
      
      {/* Mensaje de Desarrollo */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">En Desarrollo</h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>Las funciones de CRUD (Crear, Leer, Actualizar, Eliminar) para productos estarán disponibles pronto.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Categorías - VERIFICAR EL onClick */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminCards.map((card) => (
          <div 
            key={card.id}
            className={`border-2 rounded-lg p-6 transition-all duration-200 cursor-pointer ${getColorClasses(card.color)}`}
            onClick={() => handleCardClick(card.id)} // ← ¡ESTA LÍNEA ES CLAVE!
          >
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-sm mb-4 opacity-80">{card.description}</p>
            <button 
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                card.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                card.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                'bg-purple-600 hover:bg-purple-700'
              } text-white`}
              onClick={(e) => {
                e.stopPropagation(); // Prevenir doble clic
                handleCardClick(card.id);
              }}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
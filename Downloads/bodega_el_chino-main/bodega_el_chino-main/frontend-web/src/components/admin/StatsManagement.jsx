import React from 'react';

const StatsManagement = ({ onBack }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📈 Estadísticas y Reportes</h2>
        <button 
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Volver al Dashboard
        </button>
      </div>

      {/* Placeholder para estadísticas */}
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Estadísticas en Desarrollo</h3>
          <p className="mt-2 text-sm text-gray-500">
            Esta sección mostrará reportes detallados, métricas de ventas y análisis de datos.
          </p>
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Próximamente:</strong> Gráficos de ventas, métricas de usuarios, reportes de inventario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsManagement;
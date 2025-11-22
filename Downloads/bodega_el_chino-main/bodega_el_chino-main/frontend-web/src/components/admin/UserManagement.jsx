import React, { useState, useEffect } from 'react';

const UserManagement = ({ onBack }) => {
  // ... (todo el código existente se mantiene igual)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* AGREGAR ESTE BOTÓN ARRIBA */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">👥 Gestión de Usuarios</h2>
        <button 
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Volver al Dashboard
        </button>
      </div>

      {/* El resto de tu código existente... */}
      <div className="overflow-x-auto">
        {/* ... tabla de usuarios ... */}
      </div>
    </div>
  );
};

export default UserManagement;
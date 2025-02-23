import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">?? Music Map</h1>
        <Link to="/map" className="ml-4 hover:text-gray-300">Mappa</Link>
      </div>

      <div className="flex items-center">
        {isAuthenticated ? (
          <>
            {/* ? Mostra l'username */}
            <span className="mr-4">?? {user?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4 hover:text-gray-300">Login</Link>
            <Link to="/signup" className="hover:text-gray-300">Registrati</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AppNavbar = () => {
  // Récupère la route actuelle (ex. "/clients", "/employes", etc.)
  const location = useLocation();

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8 mr-3"
            alt="Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Mon Planning Aidant
          </span>
        </Link>
        
        {/* Menu affiché en ligne */}
        <ul className="font-medium flex flex-row p-4 space-x-8">
          {/* Link PLANNING */}
          <li>
            <Link
              to="/"
              // Compare la route actuelle ; si c'est "/", alors applique la couleur bleue
              className={
                location.pathname === "/"
                  ? "py-2 px-3 text-blue-700"
                  : "py-2 px-3 text-gray-900"
              }
            >
              Planning
            </Link>
          </li>

          {/* Link CLIENTS */}
          <li>
            <Link
              to="/clients"
              className={
                location.pathname === "/clients"
                  ? "py-2 px-3 text-blue-700"
                  : "py-2 px-3 text-gray-900"
              }
            >
              Clients
            </Link>
          </li>

          {/* Link EMPLOYÉES */}
          <li>
            <Link
              to="/employes"
              className={
                location.pathname === "/employes"
                  ? "py-2 px-3 text-blue-700"
                  : "py-2 px-3 text-gray-900"
              }
            >
              Employées
            </Link>
          </li>

          {/* Link RÉCAP */}
          <li>
            <Link
              to="/recap"
              className={
                location.pathname === "/recap"
                  ? "py-2 px-3 text-blue-700"
                  : "py-2 px-3 text-gray-900"
              }
            >
              Récapitulatif
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default AppNavbar;

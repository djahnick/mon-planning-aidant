// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AppNavbar = () => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? 'text-blue-700' : 'text-gray-900';

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 shadow">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
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

        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-controls="navbar-default"
          aria-expanded="false"
          onClick={() => {
            const menu = document.getElementById('navbar-default');
            menu.classList.toggle('hidden');
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col md:flex-row md:space-x-8 p-4 md:p-0 mt-4 md:mt-0 border md:border-0 rounded-lg md:bg-white md:dark:bg-gray-900 dark:bg-gray-800 md:dark:bg-transparent">
            <li>
              <Link to="/" className={`block py-2 px-3 rounded ${isActive('/')}`}>
                Planning
              </Link>
            </li>
            <li>
              <Link to="/clients" className={`block py-2 px-3 rounded ${isActive('/clients')}`}>
                Clients
              </Link>
            </li>
            <li>
              <Link to="/employes" className={`block py-2 px-3 rounded ${isActive('/employes')}`}>
                Employés
              </Link>
            </li>
            <li>
              <Link to="/recap" className={`block py-2 px-3 rounded ${isActive('/recap')}`}>
                Récapitulatif
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navs = [
    { path: '/', label: 'ส่งอีเมล' },
    { path: '/readmail', label: 'อ่านอีเมล' },
  ];
  return (
    <nav className="bg-white shadow mb-6">
      <div className="container mx-auto px-4 py-3 flex gap-4">
        {navs.map((nav) => (
          <Link
            key={nav.path}
            to={nav.path}
            className={`px-3 py-1 rounded font-medium transition-colors duration-150 ${
              location.pathname === nav.path
                ? 'bg-blue-500 text-white'
                : 'text-blue-700 hover:bg-blue-100'
            }`}
          >
            {nav.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;

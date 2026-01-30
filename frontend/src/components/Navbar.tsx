import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navs = [
    { path: '/', label: 'ส่งอีเมล' },
    { path: '/readmail', label: 'อ่านอีเมล' },
    { path: '/manage-accounts', label: 'จัดการบัญชี' },
  ];
  const [dark, setDark] = useDarkMode();
  return (
    <nav
      className={
        `mb-0 sticky top-0 z-50 ` +
        (dark
          ? 'bg-gray-900 border-b border-gray-800 shadow-[0_2px_8px_0_rgba(0,0,0,0.25)]'
          : 'bg-gradient-to-r from-blue-600 to-blue-400 shadow')
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center flex-shrink-0" style={{ minWidth: 120 }}>
          <Link
            to="/"
            className="text-white dark:text-gray-100 font-bold text-lg tracking-wide rounded no-underline hover:no-underline active:no-underline"
            tabIndex={0}
            style={{lineHeight: '32px', display: 'inline-block'}}
          >
            SnapMail
          </Link>
        </div>
        <div className="flex gap-2 flex-shrink-0 items-center">
          {navs.map((nav) => (
            <Link
              key={nav.path}
              to={nav.path}
              className={`px-4 py-1.5 rounded-full font-medium transition-colors duration-150 text-sm ${
                location.pathname === nav.path
                  ? 'bg-white dark:bg-gray-100 text-blue-600 shadow'
                  : 'text-white dark:text-gray-100 hover:bg-blue-500/70 dark:hover:bg-gray-700'
              }`}
            >
              {nav.label}
            </Link>
          ))}
          <button
            onClick={() => setDark((d: boolean) => !d)}
            className="ml-2 px-2 py-1 rounded-full text-xs font-medium border border-white/30 bg-white/10 dark:bg-gray-700 text-white dark:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-600 transition"
            title={dark ? 'ปิดโหมดกลางคืน' : 'เปิดโหมดกลางคืน'}
            aria-label="Toggle dark mode"
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 18, lineHeight: 1 }}
          >
            <span style={{ display: 'inline-block', width: 18, textAlign: 'center' }}>{dark ? '☾' : '☀'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

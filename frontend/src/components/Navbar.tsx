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
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <nav
      className={
        `mb-0 sticky top-0 z-50 transition-colors duration-300 ` +
        (dark
          ? 'bg-gray-900 border-b border-gray-800 shadow-[0_2px_8px_0_rgba(0,0,0,0.25)]'
          : 'bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 shadow-lg')
      }
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 min-w-[120px]">
          <Link
            to="/"
            className="text-white dark:text-gray-100 font-extrabold text-xl sm:text-2xl tracking-wider rounded no-underline hover:no-underline active:no-underline flex items-center gap-2 leading-[32px]"
            tabIndex={0}
          >
            <span className="text-2xl sm:text-3xl">📧</span>
            <span>SnapMail</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-2 items-center">
          {navs.map((nav) => (
            <Link
              key={nav.path}
              to={nav.path}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-150 text-base ${
                location.pathname === nav.path
                  ? 'bg-white dark:bg-gray-100 text-blue-700 shadow-md'
                  : 'text-white dark:text-gray-100 hover:bg-blue-500/80 dark:hover:bg-gray-700/80 hover:scale-105'
              }`}
            >
              {nav.label}
            </Link>
          ))}
          <button
            onClick={() => setDark((d: boolean) => !d)}
            className="ml-2 px-2 py-1 rounded-full text-base font-semibold border border-white/30 bg-white/10 dark:bg-gray-700 text-white dark:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-600 transition flex items-center justify-center w-9 h-9 font-mono text-[22px] leading-none"
            title={dark ? 'ปิดโหมดกลางคืน' : 'เปิดโหมดกลางคืน'}
            aria-label="Toggle dark mode"
          >
            <span className="inline-block w-[22px] text-center">{dark ? '☾' : '☀'}</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center justify-center p-2 rounded-md text-white dark:text-gray-100 hover:bg-blue-500/30 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-label="Open main menu"
          >
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 bg-white/90 dark:bg-gray-900/95 shadow-lg border-t border-blue-100 dark:border-gray-800 ${menuOpen ? 'max-h-96 py-2 opacity-100' : 'max-h-0 py-0 opacity-0 overflow-hidden'} backdrop-blur`}
      >
        <div className="flex flex-col gap-1 px-2 sm:px-4">
          {navs.map((nav) => (
            <Link
              key={nav.path}
              to={nav.path}
              className={`block px-4 py-3 rounded-xl font-bold text-[1.15rem] sm:text-lg transition-all duration-150 tracking-wide shadow-sm border border-transparent
                ${location.pathname === nav.path
                  ? 'bg-white/30 dark:bg-blue-900/80 text-white border-blue-200 dark:border-blue-700 shadow'
                  : 'text-white bg-white/10 dark:bg-gray-800/40 hover:bg-white/20 dark:hover:bg-gray-700/80'}
                drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]`}
              onClick={() => setMenuOpen(false)}
            >
              {nav.label}
            </Link>
          ))}
          <button
            onClick={() => setDark((d: boolean) => !d)}
            className="mt-2 px-4 py-2 rounded-lg text-base font-semibold border border-blue-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800 text-blue-700 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-gray-700 transition flex items-center justify-center font-mono text-[22px] leading-none"
            title={dark ? 'ปิดโหมดกลางคืน' : 'เปิดโหมดกลางคืน'}
            aria-label="Toggle dark mode"
          >
            <span className="inline-block w-[22px] text-center">{dark ? '☾' : '☀'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;

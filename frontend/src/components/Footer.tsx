import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
    <span>© {new Date().getFullYear()} SnapMail | Powered by SnapTranslate</span>
  </footer>
);

export default Footer;

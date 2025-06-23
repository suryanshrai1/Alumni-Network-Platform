import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-300 py-4 mt-12 shadow-inner">
      <div className="max-w-5xl mx-auto px-6 flex justify-center items-center text-gray-500 text-sm font-light select-none">
        &copy; {new Date().getFullYear()} <span className="font-semibold ml-1">Alumni Network</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

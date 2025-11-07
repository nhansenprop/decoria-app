import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200">
      <div className="container mx-auto text-center">
        <div className="inline-flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-gray">
                <span className="font-normal text-brand-orange">@</span>hansen_<span className="text-brand-orange">prop</span>
            </h1>
            <span className="text-lg sm:text-xl font-semibold tracking-widest -mt-1 pl-4">
                <span className="text-brand-orange">DECOR</span>
                <span className="text-brand-gray">IA</span>
            </span>
        </div>

        <p className="text-sm text-gray-500 mt-1">Imagina tu casa con IA</p>
      </div>
    </header>
  );
};

export default Header;

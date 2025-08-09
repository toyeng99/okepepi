
import React from 'react';
import { APP_NAME } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 shadow-md p-4 sticky top-0 z-40">
      <div className="container mx-auto flex items-center">
        <i className="fas fa-film fa-2x text-sky-400 mr-3"></i>
        <h1 className="text-2xl font-bold text-sky-400">{APP_NAME}</h1>
      </div>
    </header>
  );
};

export default Header;
    

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-slate-400 p-4 text-center mt-auto">
      <p>&copy; {new Date().getFullYear()} Personalized Storyboard Generator. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
    

import React from 'react';
import { ArtStyleValue, ArtStyleOption } from '../types';
import { ArtStyleOptions } from '../constants';

interface StyleSelectorProps {
  selectedStyle: ArtStyleValue;
  onStyleChange: (style: ArtStyleValue) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange }) => {
  return (
    <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-sky-300 mb-3">Art Style</h2>
      <select
        value={selectedStyle}
        onChange={(e) => onStyleChange(e.target.value as ArtStyleValue)}
        className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
      >
        {ArtStyleOptions.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-700 text-slate-100">
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-400 mt-2">Selected style: <span className="font-medium text-slate-300">{ArtStyleOptions.find(o => o.value === selectedStyle)?.label}</span></p>
    </div>
  );
};

export default StyleSelector;
    
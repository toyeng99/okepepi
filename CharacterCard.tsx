import React from 'react';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onEdit, onDelete }) => {
  return (
    <div className="bg-slate-700 p-4 rounded-lg shadow hover:shadow-sky-500/30 transition-shadow flex flex-col sm:flex-row sm:space-x-4">
      {character.referenceImageUrl && (
        <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-slate-600 mb-3 sm:mb-0">
          <img 
            src={character.referenceImageUrl} 
            alt={`${character.name} reference`} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-sky-400 mb-1">{character.name}</h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
            {character.description}
          </p>
        </div>
        <div className="mt-3 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(character)}
            className="px-3 py-1 text-xs bg-sky-600 hover:bg-sky-500 rounded text-white transition-colors"
            aria-label={`Edit ${character.name}`}
          >
            <i className="fas fa-edit mr-1"></i> Edit
          </button>
          <button
            onClick={() => onDelete(character.id)}
            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 rounded text-white transition-colors"
            aria-label={`Delete ${character.name}`}
          >
            <i className="fas fa-trash mr-1"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
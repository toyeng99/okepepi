
import React, { useState, useEffect } from 'react';
import { Scene, Character } from '../types';
import Modal from './Modal';

interface SceneEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveScene: (sceneData: { text: string; characterIds: string[] }, sceneId?: string) => void;
  sceneToEdit?: Scene | null;
  characters: Character[];
  title?: string;
}

const SceneEditor: React.FC<SceneEditorProps> = ({
  isOpen,
  onClose,
  onSaveScene,
  sceneToEdit,
  characters,
  title = "Add New Scene Panel"
}) => {
  const [sceneText, setSceneText] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);

  useEffect(() => {
    if (sceneToEdit) {
      setSceneText(sceneToEdit.userText);
      setSelectedCharacterIds(sceneToEdit.characterIds || []);
    } else {
      setSceneText('');
      setSelectedCharacterIds([]);
    }
  }, [sceneToEdit, isOpen]);

  const handleCharacterToggle = (charId: string) => {
    setSelectedCharacterIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]
    );
  };

  const handleSave = () => {
    if (!sceneText.trim()) {
      alert("Scene description cannot be empty.");
      return;
    }
    onSaveScene({ text: sceneText, characterIds: selectedCharacterIds }, sceneToEdit?.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={sceneToEdit ? `Edit Scene Panel ${sceneToEdit.panelNumber}` : title} size="lg">
      <div className="space-y-4">
        <div>
          <label htmlFor="sceneText" className="block text-sm font-medium text-slate-300 mb-1">
            Scene Description / Action
          </label>
          <textarea
            id="sceneText"
            value={sceneText}
            onChange={(e) => setSceneText(e.target.value)}
            rows={6}
            placeholder="e.g., DETECTIVE HARDING enters the dimly lit jazz club, searching for clues. Rain streaks down the window."
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
          />
        </div>
        {characters.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Characters in this scene (select for consistency):
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-slate-700 rounded-md border border-slate-600">
              {characters.map((char) => (
                <label key={char.id} className="flex items-center space-x-2 p-1.5 hover:bg-slate-600 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCharacterIds.includes(char.id)}
                    onChange={() => handleCharacterToggle(char.id)}
                    className="form-checkbox h-4 w-4 text-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-sky-500 focus:ring-offset-slate-700"
                  />
                  <span className="text-sm text-slate-200">{char.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
         {characters.length === 0 && (
             <p className="text-xs text-slate-400">No characters defined. Add characters first for better visual consistency.</p>
         )}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors"
          >
            {sceneToEdit ? 'Save Changes' : 'Add Scene Panel'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SceneEditor;
    
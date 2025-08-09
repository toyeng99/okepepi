
import React, { useState, useEffect } from 'react';
import { Scene } from '../types';
import Modal from './Modal';

interface EditPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene | null;
  onRegenerateWithPrompt: (sceneId: string, newPrompt: string) => void;
}

const EditPromptModal: React.FC<EditPromptModalProps> = ({ isOpen, onClose, scene, onRegenerateWithPrompt }) => {
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    if (scene?.finalPrompt) {
      setPromptText(scene.finalPrompt);
    } else if (scene) {
        // Fallback if finalPrompt somehow wasn't set but we have scene data
        // This would typically be constructed in the App component before first generation
        setPromptText(`Scene: ${scene.userText} (Prompt construction error - edit manually)`);
    }
  }, [scene, isOpen]);

  const handleRegenerate = () => {
    if (scene && promptText.trim()) {
      onRegenerateWithPrompt(scene.id, promptText.trim());
      onClose();
    } else {
        alert("Prompt cannot be empty.");
    }
  };

  if (!scene) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Refine Prompt for Panel ${scene.panelNumber}`} size="xl">
      <div className="space-y-4">
        <div>
          <label htmlFor="promptText" className="block text-sm font-medium text-slate-300 mb-1">
            Edit AI Prompt:
          </label>
          <textarea
            id="promptText"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={10}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 font-mono text-sm"
            placeholder="Enter the detailed prompt for the AI image generator..."
          />
           <p className="text-xs text-slate-400 mt-1">Review and refine the prompt used for generation. More detail can improve results.</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i> Regenerate Image
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditPromptModal;
    

import React from 'react';
import { Scene, Character } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface StoryboardPanelProps {
  scene: Scene;
  characters: Character[]; // All available characters to look up names
  onEditSceneText: (scene: Scene) => void; // For editing userText and character links
  onEditPrompt: (scene: Scene) => void; // For editing the full finalPrompt
  onDeleteScene: (sceneId: string) => void;
  onRegenerateScene: (sceneId: string) => void;
}

const StoryboardPanel: React.FC<StoryboardPanelProps> = ({
  scene,
  characters,
  onEditSceneText,
  onEditPrompt,
  onDeleteScene,
  onRegenerateScene,
}) => {
  const sceneCharacters = scene.characterIds.map(id => characters.find(c => c.id === id)?.name).filter(Boolean);

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform hover:scale-[1.02] transition-transform duration-200 ease-out">
      <div className="aspect-video bg-slate-700 flex items-center justify-center relative">
        {scene.generating ? (
          <LoadingSpinner text="Generating..." />
        ) : scene.imageUrl ? (
          <img src={scene.imageUrl} alt={`Storyboard panel ${scene.panelNumber}`} className="w-full h-full object-cover" />
        ) : scene.error ? (
          <div className="p-3 text-center text-red-400">
            <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
            <p className="text-xs break-words">Error: {scene.error}</p>
          </div>
        ) : (
          <div className="p-3 text-center text-slate-400">
             <i className="fas fa-image fa-2x mb-2"></i>
            <p>Panel {scene.panelNumber} (Not Generated)</p>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          Panel {scene.panelNumber}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
            <p className="text-sm text-slate-300 mb-1 h-20 overflow-y-auto break-words prose-invert prose-sm">
                {scene.userText || "No description."}
            </p>
            {sceneCharacters.length > 0 && (
                <p className="text-xs text-sky-400 mb-2">
                    <i className="fas fa-users mr-1"></i>
                    {sceneCharacters.join(', ')}
                </p>
            )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => onEditSceneText(scene)}
            title="Edit Scene Text & Characters"
            className="flex-1 min-w-[40px] px-2 py-1.5 text-xs bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
          >
            <i className="fas fa-file-alt mr-1 sm:mr-1"></i> <span className="hidden sm:inline">Text</span>
          </button>
          <button
            onClick={() => onEditPrompt(scene)}
            title="Edit AI Prompt"
            disabled={scene.generating || !scene.imageUrl && !scene.error}
            className="flex-1 min-w-[40px] px-2 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-robot mr-1 sm:mr-1"></i> <span className="hidden sm:inline">Prompt</span>
          </button>
          <button
            onClick={() => onRegenerateScene(scene.id)}
            title="Regenerate Image (uses existing prompt)"
            disabled={scene.generating}
            className="flex-1 min-w-[40px] px-2 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-sync-alt mr-1 sm:mr-1"></i> <span className="hidden sm:inline">Gen</span>
          </button>
          <button
            onClick={() => onDeleteScene(scene.id)}
            title="Delete Panel"
            className="flex-1 min-w-[40px] px-2 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
          >
            <i className="fas fa-trash mr-1 sm:mr-1"></i> <span className="hidden sm:inline">Del</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryboardPanel;

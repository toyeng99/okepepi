
import React from 'react';
import { Scene, Character } from '../types';
import StoryboardPanel from './StoryboardPanel';

interface StoryboardGridProps {
  scenes: Scene[];
  characters: Character[];
  onEditSceneText: (scene: Scene) => void;
  onEditPrompt: (scene: Scene) => void;
  onDeleteScene: (sceneId: string) => void;
  onRegenerateScene: (sceneId: string) => void;
}

const StoryboardGrid: React.FC<StoryboardGridProps> = ({
  scenes,
  characters,
  onEditSceneText,
  onEditPrompt,
  onDeleteScene,
  onRegenerateScene,
}) => {
  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
        <i className="fas fa-photo-video fa-3x mb-4 text-slate-600"></i>
        <h3 className="text-xl font-semibold mb-2">Your Storyboard is Empty</h3>
        <p className="text-sm">Add characters and scene panels using the controls to start building your visual narrative.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
      {scenes.map((scene) => (
        <StoryboardPanel
          key={scene.id}
          scene={scene}
          characters={characters}
          onEditSceneText={onEditSceneText}
          onEditPrompt={onEditPrompt}
          onDeleteScene={onDeleteScene}
          onRegenerateScene={onRegenerateScene}
        />
      ))}
    </div>
  );
};

export default StoryboardGrid;
    
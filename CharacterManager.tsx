import React, { useState, useCallback, ChangeEvent } from 'react';
import { Character } from '../types';
import CharacterCard from './CharacterCard';
import Modal from './Modal';

interface CharacterManagerProps {
  characters: Character[];
  onCharactersChange: (characters: Character[]) => void;
}

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const CharacterManager: React.FC<CharacterManagerProps> = ({ characters, onCharactersChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImageUrlPreview, setReferenceImageUrlPreview] = useState<string | null>(null);
  const [referenceImageMimeType, setReferenceImageMimeType] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setReferenceImage(null);
    setReferenceImageUrlPreview(null);
    setReferenceImageMimeType(null);
    setImageError(null);
  }, []);

  const openModalForNew = () => {
    setEditingCharacter(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openModalForEdit = (character: Character) => {
    setEditingCharacter(character);
    setName(character.name);
    setDescription(character.description);
    setReferenceImageUrlPreview(character.referenceImageUrl || null);
    setReferenceImageMimeType(character.referenceImageMimeType || null);
    setReferenceImage(null); // Clear previous file selection
    setImageError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCharacter(null);
    resetForm();
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setImageError(`File is too large. Max size: ${MAX_FILE_SIZE_MB}MB.`);
        setReferenceImage(null);
        setReferenceImageUrlPreview(editingCharacter?.referenceImageUrl || null); // Keep existing if edit
        setReferenceImageMimeType(editingCharacter?.referenceImageMimeType || null);
        return;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setImageError(`Invalid file type. Allowed: JPEG, PNG, WebP.`);
        setReferenceImage(null);
        setReferenceImageUrlPreview(editingCharacter?.referenceImageUrl || null);
        setReferenceImageMimeType(editingCharacter?.referenceImageMimeType || null);
        return;
      }
      
      setImageError(null);
      setReferenceImage(file);
      setReferenceImageMimeType(file.type);
      try {
        const base64 = await fileToBase64(file);
        setReferenceImageUrlPreview(base64);
      } catch (error) {
        console.error("Error converting file to base64", error);
        setImageError("Could not process image file.");
        setReferenceImageUrlPreview(editingCharacter?.referenceImageUrl || null);
        setReferenceImageMimeType(editingCharacter?.referenceImageMimeType || null);
      }
    }
  };
  
  const handleRemoveImage = () => {
    setReferenceImage(null);
    setReferenceImageUrlPreview(null);
    setReferenceImageMimeType(null);
    setImageError(null);
    // If editing, this effectively marks the image for removal on save
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      alert("Character name and description cannot be empty.");
      return;
    }

    let finalReferenceImageUrl: string | null | undefined = editingCharacter?.referenceImageUrl;
    let finalReferenceImageMimeType: string | null | undefined = editingCharacter?.referenceImageMimeType;

    if (referenceImage && referenceImageUrlPreview && referenceImageMimeType) { // New image uploaded
        finalReferenceImageUrl = referenceImageUrlPreview;
        finalReferenceImageMimeType = referenceImageMimeType;
    } else if (!referenceImageUrlPreview && editingCharacter) { // Image was removed
        finalReferenceImageUrl = null;
        finalReferenceImageMimeType = null;
    }


    if (editingCharacter) {
      onCharactersChange(
        characters.map((c) => (c.id === editingCharacter.id ? { 
            ...c, 
            name, 
            description, 
            referenceImageUrl: finalReferenceImageUrl,
            referenceImageMimeType: finalReferenceImageMimeType,
        } : c))
      );
    } else {
      onCharactersChange([
        ...characters, 
        { 
            id: Date.now().toString(), 
            name, 
            description, 
            referenceImageUrl: finalReferenceImageUrl,
            referenceImageMimeType: finalReferenceImageMimeType,
        }
    ]);
    }
    closeModal();
  };

  const handleDelete = (characterId: string) => {
    if (window.confirm("Are you sure you want to delete this character? This might affect scenes using this character.")) {
        onCharactersChange(characters.filter((c) => c.id !== characterId));
    }
  };

  return (
    <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-sky-300">Characters</h2>
        <button
          onClick={openModalForNew}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md shadow transition-colors text-sm"
        >
          <i className="fas fa-plus mr-2"></i> Add Character
        </button>
      </div>
      {characters.length === 0 ? (
        <p className="text-slate-400 text-sm">No characters defined yet. Add characters to maintain visual consistency in your storyboard.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3"> {/* Changed to single column for better card display with image */}
          {characters.map((char) => (
            <CharacterCard key={char.id} character={char} onEdit={openModalForEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCharacter ? 'Edit Character' : 'Add New Character'} size="lg">
        <div className="space-y-4">
          <div>
            <label htmlFor="charName" className="block text-sm font-medium text-slate-300 mb-1">
              Character Name
            </label>
            <input
              type="text"
              id="charName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Detective Harding"
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="charDesc" className="block text-sm font-medium text-slate-300 mb-1">
              Visual Description (Be specific for consistency!)
            </label>
            <textarea
              id="charDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="e.g., A woman in her late 30s, sharp blue eyes, short blonde hair, wears a tailored trench coat and a fedora. Always has a determined expression."
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
            />
            <p className="text-xs text-slate-400 mt-1">This description helps maintain consistency, especially if no reference image is provided.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Reference Image (Optional)
            </label>
            <input
              type="file"
              id="charImage"
              accept={ALLOWED_MIME_TYPES.join(',')}
              onChange={handleImageChange}
              className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500"
            />
             <p className="text-xs text-slate-400 mt-1">Max {MAX_FILE_SIZE_MB}MB. Helps AI maintain visual appearance. (JPEG, PNG, WebP)</p>
            {imageError && <p className="text-xs text-red-400 mt-1">{imageError}</p>}
            {referenceImageUrlPreview && (
              <div className="mt-3">
                <img src={referenceImageUrlPreview} alt="Reference preview" className="max-h-40 rounded-md border border-slate-600" />
                <button 
                    onClick={handleRemoveImage}
                    className="mt-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded text-white transition-colors"
                >
                    Remove Image
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors"
            >
              {editingCharacter ? 'Save Changes' : 'Add Character'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CharacterManager;
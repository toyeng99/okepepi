
import { ArtStyleValue, ArtStyleOption, AspectRatioValue, AspectRatioOption } from './types';

export const APP_NAME = "Storyboard AI Studio";

export const ArtStyleOptions: ArtStyleOption[] = [
  { value: ArtStyleValue.PHOTOREALISTIC, label: "Photorealistic" },
  { value: ArtStyleValue.CARTOON, label: "Cartoon / Animated" },
  { value: ArtStyleValue.PIXAR, label: "3D Pixar Style" },
  { value: ArtStyleValue.SKETCH, label: "Sketch / Pencil Drawing" },
  { value: ArtStyleValue.WATERCOLOR, label: "Watercolor" },
  { value: ArtStyleValue.CYBERPUNK, label: "Cyberpunk" },
  { value: ArtStyleValue.FANTASY, label: "Fantasy" },
  { value: ArtStyleValue.NOIR, label: "Film Noir" },
  { value: ArtStyleValue.PIXELART, label: "Pixel Art" },
  { value: ArtStyleValue.MINIMALIST, label: "Minimalist Vector" },
  { value: ArtStyleValue.VINTAGE_COMIC, label: "Vintage Comic" },
];

export const DEFAULT_ART_STYLE = ArtStyleValue.PHOTOREALISTIC;

export const AspectRatioOptions: AspectRatioOption[] = [
  { value: AspectRatioValue.SIXTEEN_NINE, label: "Landscape (16:9)" },
  { value: AspectRatioValue.ONE_ONE, label: "Square (1:1)" },
  { value: AspectRatioValue.NINE_SIXTEEN, label: "Portrait (9:16)" },
  { value: AspectRatioValue.FOUR_THREE, label: "Classic (4:3)" },
  { value: AspectRatioValue.THREE_TWO, label: "Photo (3:2)" },
];

export const DEFAULT_ASPECT_RATIO = AspectRatioValue.SIXTEEN_NINE;
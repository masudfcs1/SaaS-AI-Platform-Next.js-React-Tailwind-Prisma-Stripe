/** Client-safe choices shared by the media forms and server validation. */
export const IMAGE_SIZES = [
  { value: "1024x1024", label: "Square · 1024 × 1024" },
  { value: "1536x1024", label: "Landscape · 1536 × 1024" },
  { value: "1024x1536", label: "Portrait · 1024 × 1536" },
] as const;

export const IMAGE_QUALITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export const AUDIO_VOICES = [
  { value: "marin", label: "Marin" },
  { value: "cedar", label: "Cedar" },
  { value: "alloy", label: "Alloy" },
  { value: "ash", label: "Ash" },
  { value: "coral", label: "Coral" },
  { value: "nova", label: "Nova" },
] as const;

export const AUDIO_FORMATS = [
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV" },
] as const;

export const AUDIO_SPEEDS = [
  { value: 0.75, label: "0.75×" },
  { value: 1, label: "1×" },
  { value: 1.25, label: "1.25×" },
] as const;

export const IMAGE_PROMPT_MAX_LENGTH = 4_000;
export const AUDIO_INPUT_MAX_LENGTH = 4_096;
export const AUDIO_INSTRUCTIONS_MAX_LENGTH = 500;

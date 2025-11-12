
export interface TranscriptItem {
  speaker: 'user' | 'professor';
  text: string;
}

export interface TranscriptEntryProps {
    item: TranscriptItem;
    studentName: string;
}

export const PREBUILT_VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'] as const;
export type PrebuiltVoice = typeof PREBUILT_VOICES[number];

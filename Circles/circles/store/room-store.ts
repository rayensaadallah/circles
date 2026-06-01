import type { RoomSettingsJSON } from '@/types/database';

export interface SelectedTopic {
  id: string;
  text: string;
}

export const roomStore = {
  // Create-room form state
  selectedTopics: [] as SelectedTopic[],
  settings: {
    time_per_topic: 3,
    hot_seat_enabled: true,
  } as RoomSettingsJSON,

  // Active game state (populated after createRoom / joinRoom / startGame)
  roomId: null as string | null,
  roomCode: null as string | null,
  sessionId: null as string | null,
  isHost: false,

  reset() {
    this.selectedTopics = [];
    this.settings = { time_per_topic: 3, hot_seat_enabled: true };
    this.roomId = null;
    this.roomCode = null;
    this.sessionId = null;
    this.isHost = false;
  },
};

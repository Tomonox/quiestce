export interface BrainrotTraits {
  isAnimal: boolean;
  isFood: boolean;
  hasHat: boolean;
  hasGlasses: boolean;
  hasWeapon: boolean;
  isFlying: boolean;
  hasMultiple: boolean;
  color: string;
  type: string;
  rarity: string;
}

export interface Brainrot {
  id: string;
  name: string;
  rarity: string;
  imageUrl: string;
  localImage: string;
  income: string;
  cost: string;
  quote: string;
  traits: BrainrotTraits;
}

export interface Player {
  id: string;
  socketId: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  secret: Brainrot | null;
  eliminatedCards?: string[];
  eliminatedCount?: number;
  rematchRequested?: boolean;
}

export interface QuestionHistoryItem {
  id: string;
  askerId: string;
  askerName: string;
  category: string;
  text: string;
  answer?: 'OUI' | 'NON';
  timestamp: number;
  answeredAt?: number;
}

export interface RoomState {
  code: string;
  status: 'waiting' | 'ready' | 'playing' | 'game_over';
  boardSize: number;
  board: Brainrot[];
  turnNumber: number;
  currentTurnPlayerId: string | null;
  turnState: 'asking' | 'answering';
  pendingQuestion: QuestionHistoryItem | null;
  history: QuestionHistoryItem[];
  winner: {
    socketId: string;
    nickname: string;
    avatar: string;
  } | null;
  winReason: string | null;
  me: Player | null;
  opponent: Player | null;
}

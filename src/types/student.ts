export interface StudentTopicStat {
  correct: number;
  wrong: number;
  lastPlayed?: string;
}

export interface Student {
  id: string;
  name: string;
  avatar: string; // emoji or icon code e.g. "🦁", "🚀", "🦊"
  avatarBg?: string; // Tailwind gradient or color for the badge
  totalCorrect: number;
  totalWrong: number;
  gamesPlayed: number;
  gamesWon: number;
  topicStats: Record<string, StudentTopicStat>;
  createdAt: string;
}

export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
  bg: string;
  border: string;
}

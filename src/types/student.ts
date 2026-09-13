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
  grade: number; // 1, 2, 3, 4 (which grade level this student belongs to: 1. Sınıf, 2. Sınıf, 3. Sınıf, 4. Sınıf)
  className?: string; // e.g. "2-A", "3-B" or "Şube"
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

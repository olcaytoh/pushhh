export interface StudentHomeworkData {
  studentId: string;
  studentName: string;
  homeworkCount: number; // Toplam yapılan ödev sayısı (balığın büyüme çarpanı)
  lastCompletedDate?: string; // YYYY-MM-DD formatında son onay tarihi
  fishModelIndex: number; // 0-9 arası balık modeli ve renk teması
  createdAt: string;
}

export interface AquariumSettings {
  soundEnabled: boolean;
  bubblesEnabled: boolean;
}

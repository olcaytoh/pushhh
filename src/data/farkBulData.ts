export interface FarkDifference {
  id: number;
  name?: string;
  x: number;
  y: number;
  radius: number;
}

export interface FarkLevel {
  id: string;
  title: string;
  leftSrc: string;
  rightSrc: string;
  src?: string;
  w: number;
  h: number;
  differences: FarkDifference[];
}

export const FARK_BUL_LEVELS: FarkLevel[] = [
  {
    "id": "fark_level_1",
    "title": "Sihirli Orman Kütüphanesi",
    "leftSrc": "/fark/levels/level_1_left.jpg",
    "rightSrc": "/fark/levels/level_1_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 80.2,
        "y": 52.1,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 61.5,
        "y": 58.6,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 81.3,
        "y": 31.4,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 20.4,
        "y": 30.4,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 39.5,
        "y": 56.2,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 20,
        "y": 82.6,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 80.3,
        "y": 72.1,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_2",
    "title": "Sualtı Çay Partisi",
    "leftSrc": "/fark/levels/level_2_left.jpg",
    "rightSrc": "/fark/levels/level_2_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 25.4,
        "y": 78.9,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 77.2,
        "y": 71.5,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 72.1,
        "y": 40.8,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 33,
        "y": 48.9,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 84.5,
        "y": 48.1,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 63.4,
        "y": 91.7,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 61.7,
        "y": 52,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_3",
    "title": "Uzay Macerası Başlıyor",
    "leftSrc": "/fark/levels/level_3_left.jpg",
    "rightSrc": "/fark/levels/level_3_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 71.8,
        "y": 48.7,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 88.5,
        "y": 58.8,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 54.4,
        "y": 49.4,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 44.7,
        "y": 39.9,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 34.6,
        "y": 49.8,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 34.4,
        "y": 22.9,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 49.3,
        "y": 61,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_4",
    "title": "Tarihi Saray Avlusu",
    "leftSrc": "/fark/levels/level_4_left.jpg",
    "rightSrc": "/fark/levels/level_4_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 62.3,
        "y": 58.5,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 90.1,
        "y": 58.9,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 72.2,
        "y": 38.7,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 63.4,
        "y": 90.5,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 20.1,
        "y": 57.7,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 18.6,
        "y": 16,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 76.4,
        "y": 79.8,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_5",
    "title": "Tarihi Osmanlı Çeşmesi",
    "leftSrc": "/fark/levels/level_5_left.jpg",
    "rightSrc": "/fark/levels/level_5_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 12.4,
        "y": 30.5,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 16.3,
        "y": 84.4,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 72.9,
        "y": 82.7,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 90.9,
        "y": 80.9,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 87.3,
        "y": 35.6,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 91.4,
        "y": 61.2,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 45,
        "y": 81.2,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_6",
    "title": "Robot Atölyesi Eğlencesi",
    "leftSrc": "/fark/levels/level_6_left.jpg",
    "rightSrc": "/fark/levels/level_6_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 39,
        "y": 63.6,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 80.4,
        "y": 82,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 18.2,
        "y": 58.6,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 82.8,
        "y": 55.8,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 91.1,
        "y": 74,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 18.5,
        "y": 93.1,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 41.5,
        "y": 46.7,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_7",
    "title": "Tarihi Saat Kulesi Meydanı",
    "leftSrc": "/fark/levels/level_7_left.jpg",
    "rightSrc": "/fark/levels/level_7_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 43.8,
        "y": 15.5,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 7.9,
        "y": 61.8,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 29.5,
        "y": 16.3,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 90.4,
        "y": 90.8,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 45,
        "y": 88.2,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 18.2,
        "y": 50.3,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 85.1,
        "y": 64.1,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_8",
    "title": "Osmanlı Sokak Çeşmesi",
    "leftSrc": "/fark/levels/level_8_left.jpg",
    "rightSrc": "/fark/levels/level_8_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 44.6,
        "y": 79.6,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 38.1,
        "y": 24.6,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 27.9,
        "y": 66.8,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 10,
        "y": 93.6,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 63.5,
        "y": 68,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 94.6,
        "y": 78.5,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 45.2,
        "y": 48,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_9",
    "title": "Doğum Günü Kutlaması",
    "leftSrc": "/fark/levels/level_9_left.jpg",
    "rightSrc": "/fark/levels/level_9_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 5.2,
        "y": 70.2,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 94,
        "y": 66.4,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 74.1,
        "y": 79.4,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 23.3,
        "y": 64.2,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 35.4,
        "y": 36,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 32.5,
        "y": 81.2,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 48.5,
        "y": 60.5,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_10",
    "title": "İstanbul Boğaz Limanı",
    "leftSrc": "/fark/levels/level_10_left.jpg",
    "rightSrc": "/fark/levels/level_10_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 88.5,
        "y": 62.3,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 51.7,
        "y": 62.1,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 33.1,
        "y": 63,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 65.3,
        "y": 62.9,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 95.5,
        "y": 86.9,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 63.7,
        "y": 28.4,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 14.4,
        "y": 70,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_11",
    "title": "Tarihi Şadırvan Meydanı",
    "leftSrc": "/fark/levels/level_11_left.jpg",
    "rightSrc": "/fark/levels/level_11_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 15.2,
        "y": 63.9,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 88.2,
        "y": 86.6,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 94.1,
        "y": 26.2,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 41,
        "y": 47.1,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 84.7,
        "y": 63.7,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 41.9,
        "y": 31.2,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 12.7,
        "y": 93.3,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_12",
    "title": "Çiftlikte Sevimli Dostlar",
    "leftSrc": "/fark/levels/level_12_left.jpg",
    "rightSrc": "/fark/levels/level_12_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 43.8,
        "y": 86,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 8,
        "y": 72.4,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 9.5,
        "y": 44.4,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 15.1,
        "y": 94.2,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 73.5,
        "y": 35.3,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 22,
        "y": 82,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 76,
        "y": 82,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_13",
    "title": "Sihirli Ağaç Ev",
    "leftSrc": "/fark/levels/level_13_left.jpg",
    "rightSrc": "/fark/levels/level_13_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 84.8,
        "y": 28.4,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 25.3,
        "y": 27.1,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 48.1,
        "y": 35.3,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 64.5,
        "y": 65.5,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 8.2,
        "y": 49.9,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 70.2,
        "y": 42.2,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 45.1,
        "y": 86.5,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_14",
    "title": "Dinozorlar Vadisi Keşfi",
    "leftSrc": "/fark/levels/level_14_left.jpg",
    "rightSrc": "/fark/levels/level_14_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 12.3,
        "y": 43,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 86.1,
        "y": 85.5,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 86.9,
        "y": 21.5,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 36.9,
        "y": 54.1,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 59.2,
        "y": 21.4,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 44.5,
        "y": 29,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 25.8,
        "y": 43.9,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_15",
    "title": "Korsan Adası ve Hazine",
    "leftSrc": "/fark/levels/level_15_left.jpg",
    "rightSrc": "/fark/levels/level_15_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 45.9,
        "y": 83.4,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 24.7,
        "y": 52.5,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 10.5,
        "y": 62.3,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 30.2,
        "y": 33.8,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 55.9,
        "y": 56.9,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 45.4,
        "y": 61.3,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 72.8,
        "y": 74.7,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_16",
    "title": "Peri Masalı Masmavi Şato",
    "leftSrc": "/fark/levels/level_16_left.jpg",
    "rightSrc": "/fark/levels/level_16_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 62.5,
        "y": 71.3,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 43.7,
        "y": 45,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 82.3,
        "y": 75.6,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 15.8,
        "y": 59.8,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 39.7,
        "y": 74.1,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 57.3,
        "y": 87.5,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 20.8,
        "y": 82.1,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_17",
    "title": "Kutup Penguenleri Eğlencesi",
    "leftSrc": "/fark/levels/level_17_left.jpg",
    "rightSrc": "/fark/levels/level_17_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 84.9,
        "y": 62.7,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 19.7,
        "y": 76.1,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 58.1,
        "y": 58,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 17.1,
        "y": 59.9,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 72.2,
        "y": 44.1,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 26.7,
        "y": 43.1,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 68.3,
        "y": 64.1,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_18",
    "title": "Orman İzcileri Kampı",
    "leftSrc": "/fark/levels/level_18_left.jpg",
    "rightSrc": "/fark/levels/level_18_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 85.4,
        "y": 62.2,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 59,
        "y": 58.2,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 25.2,
        "y": 44.6,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 20.2,
        "y": 76.7,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 17.3,
        "y": 62.6,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 72.1,
        "y": 48,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 69.1,
        "y": 64.1,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_19",
    "title": "Oyuncak Tren İstasyonu",
    "leftSrc": "/fark/levels/level_19_left.jpg",
    "rightSrc": "/fark/levels/level_19_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 22.4,
        "y": 42.6,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 25.9,
        "y": 64.2,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 77.3,
        "y": 53.9,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 45.9,
        "y": 25.2,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 58.1,
        "y": 25.2,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 89.2,
        "y": 94.1,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 51.8,
        "y": 75.3,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_20",
    "title": "Sevimli Hayvanlar Sirki",
    "leftSrc": "/fark/levels/level_20_left.jpg",
    "rightSrc": "/fark/levels/level_20_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 48,
        "y": 59.2,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 65.4,
        "y": 79.8,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 31.2,
        "y": 44.9,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 12.8,
        "y": 70.8,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 14.5,
        "y": 42.5,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 49.7,
        "y": 89,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 73,
        "y": 48.6,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_21",
    "title": "Sonbahar Park Gezisi",
    "leftSrc": "/fark/levels/level_21_left.jpg",
    "rightSrc": "/fark/levels/level_21_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 52.2,
        "y": 53.1,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 71.6,
        "y": 66.2,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 16.1,
        "y": 64.7,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 88.7,
        "y": 60,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 68.2,
        "y": 80.1,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 40,
        "y": 59.4,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 53.1,
        "y": 70.8,
        "radius": 9
      }
    ]
  },
  {
    "id": "fark_level_22",
    "title": "Gökkuşağı Şeker Dünyası",
    "leftSrc": "/fark/levels/level_22_left.jpg",
    "rightSrc": "/fark/levels/level_22_right.jpg",
    "w": 1172,
    "h": 1175,
    "differences": [
      {
        "id": 1,
        "name": "Fark 1",
        "x": 88.8,
        "y": 54.4,
        "radius": 9
      },
      {
        "id": 2,
        "name": "Fark 2",
        "x": 78.6,
        "y": 20.8,
        "radius": 9
      },
      {
        "id": 3,
        "name": "Fark 3",
        "x": 41.8,
        "y": 86.7,
        "radius": 9
      },
      {
        "id": 4,
        "name": "Fark 4",
        "x": 43.3,
        "y": 57.1,
        "radius": 9
      },
      {
        "id": 5,
        "name": "Fark 5",
        "x": 55.9,
        "y": 79.4,
        "radius": 9
      },
      {
        "id": 6,
        "name": "Fark 6",
        "x": 62.2,
        "y": 55.5,
        "radius": 9
      },
      {
        "id": 7,
        "name": "Fark 7",
        "x": 24.4,
        "y": 93.8,
        "radius": 9
      }
    ]
  }
];

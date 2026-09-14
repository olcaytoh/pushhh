import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, RotateCcw, Play, Pause, Maximize2, Minimize2, 
  HelpCircle, CheckCircle2, ChevronRight, Volume2, VolumeX,
  Layers, Box, Eye, ZoomIn, ZoomOut
} from 'lucide-react';

export interface GeometricNetsActivityProps {
  onClose: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  initialShapeId?: string;
}

interface SolidDefinition {
  id: string;
  name: string;
  emoji: string;
  facesCount: number;
  edgesCount: number;
  verticesCount: number;
  faceDescription: string;
  didacticFact: string;
  curriculumGrade: string;
  colorTheme: string;
}

const SOLIDS: SolidDefinition[] = [
  {
    id: 'cube',
    name: 'Küp',
    emoji: '🎲',
    facesCount: 6,
    edgesCount: 12,
    verticesCount: 8,
    faceDescription: '6 adet birbirine eşit Kare',
    didacticFact: 'Küpün 11 farklı açınımı vardır. Katlandığında karşılıklı yüzler birbirine paralel olur!',
    curriculumGrade: '1, 2, 3 ve 4. Sınıf',
    colorTheme: 'from-amber-500 to-orange-600'
  },
  {
    id: 'rect_prism',
    name: 'Dikdörtgenler Prizması',
    emoji: '📦',
    facesCount: 6,
    edgesCount: 12,
    verticesCount: 8,
    faceDescription: '6 adet Dikdörtgen (Karşılıklı 3 eş çift)',
    didacticFact: 'İlaç kutuları ve kibrit kutuları bu şekildedir. Karşılıklı yüzeyleri birbirine eşittir.',
    curriculumGrade: '2, 3 ve 4. Sınıf',
    colorTheme: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'square_prism',
    name: 'Kare Prizma',
    emoji: '🏢',
    facesCount: 6,
    edgesCount: 12,
    verticesCount: 8,
    faceDescription: '2 Kare Taban + 4 Dikdörtgen Yan Yüz',
    didacticFact: 'Alt ve üst kapağı eş karelerden, yan duvarları ise dikdörtgenlerden oluşur.',
    curriculumGrade: '2, 3 ve 4. Sınıf',
    colorTheme: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'tri_prism',
    name: 'Üçgen Prizma',
    emoji: '⛺',
    facesCount: 5,
    edgesCount: 9,
    verticesCount: 6,
    faceDescription: '2 Üçgen Taban + 3 Dikdörtgen Yüz',
    didacticFact: 'Çadırlar ve çikolata kutuları üçgen prizmadır. 2 üçgen kapağı ve 3 dikdörtgen yüzü vardır.',
    curriculumGrade: '2, 3 ve 4. Sınıf',
    colorTheme: 'from-violet-500 to-purple-600'
  },
  {
    id: 'cylinder',
    name: 'Silindir',
    emoji: '🛢️',
    facesCount: 3,
    edgesCount: 2,
    verticesCount: 0,
    faceDescription: '2 Daire Taban + 1 Dikdörtgen Yan Yüz',
    didacticFact: 'Silindirin yan yüzeyi açıldığında bir DİKDÖRTGEN olur! Sivri köşesi yoktur.',
    curriculumGrade: '1, 2, 3 ve 4. Sınıf',
    colorTheme: 'from-sky-500 to-indigo-600'
  },
  {
    id: 'cone',
    name: 'Koni',
    emoji: '🍦',
    facesCount: 2,
    edgesCount: 1,
    verticesCount: 1,
    faceDescription: '1 Daire Taban + 1 Daire Dilimi (Sektör)',
    didacticFact: 'Dondurma külahı ve trafik konisi birer konidir. Açınımı 1 daire ve 1 dilimdir.',
    curriculumGrade: '2, 3 ve 4. Sınıf',
    colorTheme: 'from-pink-500 to-rose-600'
  },
  {
    id: 'pyramid',
    name: 'Kare Piramit',
    emoji: '🔺',
    facesCount: 5,
    edgesCount: 8,
    verticesCount: 5,
    faceDescription: '1 Kare Taban + 4 Üçgen Yan Yüz',
    didacticFact: 'Mısır piramitleri bu şekildedir. Tabanı kare, yan yüzeyleri tepe noktasında birleşen 4 üçgendir.',
    curriculumGrade: '3 ve 4. Sınıf',
    colorTheme: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'sphere',
    name: 'Küre',
    emoji: '⚽',
    facesCount: 1,
    edgesCount: 0,
    verticesCount: 0,
    faceDescription: '1 Kesintisiz Eğri Yüzey (Dilimli Açılım)',
    didacticFact: 'Kürenin düzlemsel açınımı yoktur! Yırtılmadan düzleşemez, haritalarda portakal dilimleri kullanılır.',
    curriculumGrade: '1, 2, 3 ve 4. Sınıf',
    colorTheme: 'from-blue-500 to-teal-500'
  }
];

// Color palette for faces to make each side distinctly identifiable
const FACE_COLORS = [
  0xf97316, // 0: Orange (Taban)
  0x10b981, // 1: Emerald Green (Ön)
  0x0284c7, // 2: Sky Blue (Arka)
  0xf43f5e, // 3: Rose Pink (Sol)
  0xfbbf24, // 4: Amber Gold (Sağ)
  0x64748b, // 5: Slate Gray (Üst / Tavan)
  0x8b5cf6, // 6: Violet
  0x06b6d4  // 7: Cyan
];

export const GeometricNetsActivity: React.FC<GeometricNetsActivityProps> = ({
  onClose,
  onPrevActivity,
  onNextActivity,
  playMp3,
  initialShapeId = 'cube'
}) => {
  const [selectedSolid, setSelectedSolid] = useState<SolidDefinition>(() => {
    return SOLIDS.find(s => s.id === initialShapeId) || SOLIDS[0];
  });

  // unfoldRatio: 0 = fully closed (3D solid), 1 = fully open (flat 2D net)
  const [unfoldRatio, setUnfoldRatio] = useState<number>(0.65);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 0.5x, 1x, 1.5x
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizQuestion, setQuizQuestion] = useState<{
    q: string;
    options: string[];
    correct: string;
    explanation: string;
  } | null>(null);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  // Viewport refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const playDirectionRef = useRef<number>(1); // 1 = opening, -1 = closing
  const animationFrameIdRef = useRef<number | null>(null);

  const triggerSound = (src: string) => {
    if (isSoundEnabled && playMp3) {
      playMp3(src);
    }
  };

  // Generate a pedagogical quiz question for the active solid
  const generateQuizForSolid = (solid: SolidDefinition) => {
    setQuizSelected(null);
    setQuizAnswered(false);
    const questionsPool = [
      {
        q: `${solid.name} cisminin açınımında toplam kaç adet yüzey (bölge) bulunur?`,
        correct: `${solid.facesCount} Yüzey`,
        options: [
          `${solid.facesCount} Yüzey`,
          `${Math.max(1, solid.facesCount - 2)} Yüzey`,
          `${solid.facesCount + 2} Yüzey`,
          `${solid.facesCount + 1} Yüzey`
        ].sort(() => Math.random() - 0.5),
        explanation: `${solid.name} cisminin yüzey sayısı: ${solid.facesCount}`
      },
      {
        q: `${solid.name} cisminin kaç adet KÖŞESİ vardır?`,
        correct: `${solid.verticesCount} Köşe`,
        options: [
          `${solid.verticesCount} Köşe`,
          `${solid.verticesCount === 0 ? 4 : solid.verticesCount - 2} Köşe`,
          `${solid.verticesCount + 2} Köşe`,
          `${solid.verticesCount + 4} Köşe`
        ].filter((v, idx, arr) => arr.indexOf(v) === idx).sort(() => Math.random() - 0.5),
        explanation: `${solid.name}: ${solid.verticesCount} Köşe, ${solid.edgesCount} Ayrıt, ${solid.facesCount} Yüz`
      },
      {
        q: `${solid.name} cisminin açınımındaki yüzey şekilleri nasıldır?`,
        correct: solid.faceDescription,
        options: [
          solid.faceDescription,
          'Sadece 4 adet eş üçgen',
          '2 Daire ve 1 Kare',
          '3 Dikdörtgen ve 3 Üçgen'
        ].filter((v, idx, arr) => arr.indexOf(v) === idx).slice(0, 4).sort(() => Math.random() - 0.5),
        explanation: `${solid.name}: ${solid.faceDescription}`
      }
    ];

    const chosen = questionsPool[Math.floor(Math.random() * questionsPool.length)];
    setQuizQuestion(chosen);
  };

  useEffect(() => {
    generateQuizForSolid(selectedSolid);
  }, [selectedSolid]);

  // Three.js Scene Setup & Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / Math.max(1, height), 0.1, 1000);
    camera.position.set(0, 4.2, 7.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Subtle Ground Grid & Reflection Plane
    const gridHelper = new THREE.GridHelper(16, 16, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff8ee, 1.2);
    dirLight1.position.set(6, 12, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.7);
    dirLight2.position.set(-6, -4, -6);
    scene.add(dirLight2);

    // Main Group containing the foldable solid
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Build the initial 3D net
    buildSolidNet(selectedSolid.id, modelGroup, unfoldRatio);

    // Animation / Render loop
    const animate = () => {
      if (isDisposed || !renderer) return;
      animationFrameIdRef.current = requestAnimationFrame(animate);

      try {
        renderer.render(scene, camera);
      } catch {
        // ignore render frame errors
      }
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current || isDisposed) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 450;
      if (h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      try {
        renderer.dispose();
      } catch {}
    };
  }, [selectedSolid]);

  // Rebuild / Update the 3D net when unfoldRatio changes
  useEffect(() => {
    if (!modelGroupRef.current) return;
    buildSolidNet(selectedSolid.id, modelGroupRef.current, unfoldRatio);
  }, [selectedSolid, unfoldRatio]);

  // Auto-play Folding / Unfolding Animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setUnfoldRatio(prev => {
        let next = prev + playDirectionRef.current * (0.008 * playSpeed);
        if (next >= 1) {
          next = 1;
          playDirectionRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          playDirectionRef.current = 1;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed]);

  // Mouse & Touch Dragging Orbit Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !modelGroupRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;

    modelGroupRef.current.rotation.y += deltaX * 0.012;
    modelGroupRef.current.rotation.x += deltaY * 0.012;

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Reset Camera View
  const handleResetView = () => {
    triggerSound('/op.mp3');
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 4.2, 7.2);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  // Zoom Controls
  const handleZoom = (delta: number) => {
    triggerSound('/op.mp3');
    if (!cameraRef.current) return;
    const currentDist = cameraRef.current.position.length();
    const newDist = Math.max(3.5, Math.min(14, currentDist + delta));
    cameraRef.current.position.setLength(newDist);
  };

  // Helper to create a styled face mesh with crisp border
  const createStyledFace = (
    geometry: THREE.BufferGeometry,
    colorHex: number,
    opacity: number = 0.95
  ): THREE.Group => {
    const faceGroup = new THREE.Group();

    // Material with double-sided rendering so inside and outside are both colored
    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      roughness: 0.35,
      metalness: 0.1,
      transparent: opacity < 1,
      opacity: opacity
    });
    const mesh = new THREE.Mesh(geometry, material);
    faceGroup.add(mesh);

    // Crisp dark edge outline
    const edgesGeo = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edgesGeo, lineMat);
    faceGroup.add(wireframe);

    return faceGroup;
  };

  // -------------------------------------------------------------
  // BUILD 3D NET FUNCTION FOR ALL GEOMETRIC SOLIDS
  // -------------------------------------------------------------
  const buildSolidNet = (solidId: string, group: THREE.Group, u: number) => {
    // Clear previous children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    // u: 0 = Kapalı (3D solid), 1 = Açık (2D flat net)
    const foldAngle90 = (1 - u) * (Math.PI / 2);

    switch (solidId) {
      case 'cube': {
        const s = 1.6; // side length

        // 0. Base (Taban) - lies flat on XZ plane at y = 0
        const baseGeo = new THREE.PlaneGeometry(s, s);
        baseGeo.rotateX(-Math.PI / 2);
        const baseFace = createStyledFace(baseGeo, FACE_COLORS[0]);
        group.add(baseFace);

        // 1. Front Face (Ön yüz) - hinged at z = +s/2
        const frontPivot = new THREE.Group();
        frontPivot.position.set(0, 0, s / 2);
        frontPivot.rotation.x = foldAngle90;
        const frontGeo = new THREE.PlaneGeometry(s, s);
        frontGeo.rotateX(-Math.PI / 2);
        frontGeo.translate(0, 0, s / 2);
        frontPivot.add(createStyledFace(frontGeo, FACE_COLORS[1]));
        group.add(frontPivot);

        // 2. Back Face (Arka yüz) - hinged at z = -s/2
        const backPivot = new THREE.Group();
        backPivot.position.set(0, 0, -s / 2);
        backPivot.rotation.x = -foldAngle90;
        const backGeo = new THREE.PlaneGeometry(s, s);
        backGeo.rotateX(-Math.PI / 2);
        backGeo.translate(0, 0, -s / 2);
        backPivot.add(createStyledFace(backGeo, FACE_COLORS[2]));
        group.add(backPivot);

        // 3. Left Face (Sol yüz) - hinged at x = -s/2
        const leftPivot = new THREE.Group();
        leftPivot.position.set(-s / 2, 0, 0);
        leftPivot.rotation.z = foldAngle90;
        const leftGeo = new THREE.PlaneGeometry(s, s);
        leftGeo.rotateX(-Math.PI / 2);
        leftGeo.translate(-s / 2, 0, 0);
        leftPivot.add(createStyledFace(leftGeo, FACE_COLORS[3]));
        group.add(leftPivot);

        // 4. Right Face (Sağ yüz) - hinged at x = +s/2
        const rightPivot = new THREE.Group();
        rightPivot.position.set(s / 2, 0, 0);
        rightPivot.rotation.z = -foldAngle90;
        const rightGeo = new THREE.PlaneGeometry(s, s);
        rightGeo.rotateX(-Math.PI / 2);
        rightGeo.translate(s / 2, 0, 0);
        rightPivot.add(createStyledFace(rightGeo, FACE_COLORS[4]));

        // 5. Top Face (Tavan / Üst Kapak) - hinged to the outer edge of Right Face!
        const topPivot = new THREE.Group();
        topPivot.position.set(s, 0, 0);
        topPivot.rotation.z = -foldAngle90;
        const topGeo = new THREE.PlaneGeometry(s, s);
        topGeo.rotateX(-Math.PI / 2);
        topGeo.translate(s / 2, 0, 0);
        topPivot.add(createStyledFace(topGeo, FACE_COLORS[5]));

        rightPivot.add(topPivot);
        group.add(rightPivot);
        break;
      }

      case 'rect_prism': {
        const w = 2.4; // width (x)
        const d = 1.6; // depth (z)
        const h = 1.2; // height (y)

        // Base (w x d)
        const baseGeo = new THREE.PlaneGeometry(w, d);
        baseGeo.rotateX(-Math.PI / 2);
        group.add(createStyledFace(baseGeo, FACE_COLORS[0]));

        // Front (w x h)
        const frontPivot = new THREE.Group();
        frontPivot.position.set(0, 0, d / 2);
        frontPivot.rotation.x = foldAngle90;
        const frontGeo = new THREE.PlaneGeometry(w, h);
        frontGeo.rotateX(-Math.PI / 2);
        frontGeo.translate(0, 0, h / 2);
        frontPivot.add(createStyledFace(frontGeo, FACE_COLORS[1]));
        group.add(frontPivot);

        // Back (w x h)
        const backPivot = new THREE.Group();
        backPivot.position.set(0, 0, -d / 2);
        backPivot.rotation.x = -foldAngle90;
        const backGeo = new THREE.PlaneGeometry(w, h);
        backGeo.rotateX(-Math.PI / 2);
        backGeo.translate(0, 0, -h / 2);
        backPivot.add(createStyledFace(backGeo, FACE_COLORS[2]));
        group.add(backPivot);

        // Left (h x d)
        const leftPivot = new THREE.Group();
        leftPivot.position.set(-w / 2, 0, 0);
        leftPivot.rotation.z = foldAngle90;
        const leftGeo = new THREE.PlaneGeometry(h, d);
        leftGeo.rotateX(-Math.PI / 2);
        leftGeo.translate(-h / 2, 0, 0);
        leftPivot.add(createStyledFace(leftGeo, FACE_COLORS[3]));
        group.add(leftPivot);

        // Right (h x d) + Top (w x d)
        const rightPivot = new THREE.Group();
        rightPivot.position.set(w / 2, 0, 0);
        rightPivot.rotation.z = -foldAngle90;
        const rightGeo = new THREE.PlaneGeometry(h, d);
        rightGeo.rotateX(-Math.PI / 2);
        rightGeo.translate(h / 2, 0, 0);
        rightPivot.add(createStyledFace(rightGeo, FACE_COLORS[4]));

        // Top Face attached to Right face
        const topPivot = new THREE.Group();
        topPivot.position.set(h, 0, 0);
        topPivot.rotation.z = -foldAngle90;
        const topGeo = new THREE.PlaneGeometry(w, d);
        topGeo.rotateX(-Math.PI / 2);
        topGeo.translate(w / 2, 0, 0);
        topPivot.add(createStyledFace(topGeo, FACE_COLORS[5]));

        rightPivot.add(topPivot);
        group.add(rightPivot);
        break;
      }

      case 'square_prism': {
        const s = 1.5; // square base side
        const h = 2.5; // rectangular side height

        // Bottom Square Base (s x s)
        const baseGeo = new THREE.PlaneGeometry(s, s);
        baseGeo.rotateX(-Math.PI / 2);
        group.add(createStyledFace(baseGeo, FACE_COLORS[0]));

        // Front Rectangle (s x h)
        const frontPivot = new THREE.Group();
        frontPivot.position.set(0, 0, s / 2);
        frontPivot.rotation.x = foldAngle90;
        const frontGeo = new THREE.PlaneGeometry(s, h);
        frontGeo.rotateX(-Math.PI / 2);
        frontGeo.translate(0, 0, h / 2);
        frontPivot.add(createStyledFace(frontGeo, FACE_COLORS[1]));
        group.add(frontPivot);

        // Back Rectangle (s x h)
        const backPivot = new THREE.Group();
        backPivot.position.set(0, 0, -s / 2);
        backPivot.rotation.x = -foldAngle90;
        const backGeo = new THREE.PlaneGeometry(s, h);
        backGeo.rotateX(-Math.PI / 2);
        backGeo.translate(0, 0, -h / 2);
        backPivot.add(createStyledFace(backGeo, FACE_COLORS[2]));
        group.add(backPivot);

        // Left Rectangle (s x h)
        const leftPivot = new THREE.Group();
        leftPivot.position.set(-s / 2, 0, 0);
        leftPivot.rotation.z = foldAngle90;
        const leftGeo = new THREE.PlaneGeometry(h, s);
        leftGeo.rotateX(-Math.PI / 2);
        leftGeo.translate(-h / 2, 0, 0);
        leftPivot.add(createStyledFace(leftGeo, FACE_COLORS[3]));
        group.add(leftPivot);

        // Right Rectangle (s x h) + Top Square Base (s x s)
        const rightPivot = new THREE.Group();
        rightPivot.position.set(s / 2, 0, 0);
        rightPivot.rotation.z = -foldAngle90;
        const rightGeo = new THREE.PlaneGeometry(h, s);
        rightGeo.rotateX(-Math.PI / 2);
        rightGeo.translate(h / 2, 0, 0);
        rightPivot.add(createStyledFace(rightGeo, FACE_COLORS[4]));

        // Top Square
        const topPivot = new THREE.Group();
        topPivot.position.set(h, 0, 0);
        topPivot.rotation.z = -foldAngle90;
        const topGeo = new THREE.PlaneGeometry(s, s);
        topGeo.rotateX(-Math.PI / 2);
        topGeo.translate(s / 2, 0, 0);
        topPivot.add(createStyledFace(topGeo, FACE_COLORS[0]));

        rightPivot.add(topPivot);
        group.add(rightPivot);
        break;
      }

      case 'tri_prism': {
        const w = 1.8; // side of triangle
        const l = 2.4; // prism length
        const triH = (Math.sqrt(3) / 2) * w; // equilateral triangle height ≈ 1.56
        const fold60 = (1 - u) * (Math.PI / 3); // 60 degrees

        // Base rectangle (w x l)
        const baseGeo = new THREE.PlaneGeometry(w, l);
        baseGeo.rotateX(-Math.PI / 2);
        group.add(createStyledFace(baseGeo, FACE_COLORS[0]));

        // Left Side Rectangle (w x l)
        const leftPivot = new THREE.Group();
        leftPivot.position.set(-w / 2, 0, 0);
        leftPivot.rotation.z = fold60;
        const leftGeo = new THREE.PlaneGeometry(w, l);
        leftGeo.rotateX(-Math.PI / 2);
        leftGeo.translate(-w / 2, 0, 0);
        leftPivot.add(createStyledFace(leftGeo, FACE_COLORS[3]));
        group.add(leftPivot);

        // Right Side Rectangle (w x l)
        const rightPivot = new THREE.Group();
        rightPivot.position.set(w / 2, 0, 0);
        rightPivot.rotation.z = -fold60;
        const rightGeo = new THREE.PlaneGeometry(w, l);
        rightGeo.rotateX(-Math.PI / 2);
        rightGeo.translate(w / 2, 0, 0);
        rightPivot.add(createStyledFace(rightGeo, FACE_COLORS[4]));
        group.add(rightPivot);

        // Front Triangle Base
        const frontPivot = new THREE.Group();
        frontPivot.position.set(0, 0, l / 2);
        frontPivot.rotation.x = foldAngle90;
        const frontTriShape = new THREE.Shape();
        frontTriShape.moveTo(-w / 2, 0);
        frontTriShape.lineTo(w / 2, 0);
        frontTriShape.lineTo(0, triH);
        frontTriShape.closePath();
        const frontTriGeo = new THREE.ShapeGeometry(frontTriShape);
        frontTriGeo.rotateX(-Math.PI / 2);
        frontPivot.add(createStyledFace(frontTriGeo, FACE_COLORS[1]));
        group.add(frontPivot);

        // Back Triangle Base
        const backPivot = new THREE.Group();
        backPivot.position.set(0, 0, -l / 2);
        backPivot.rotation.x = -foldAngle90;
        const backTriShape = new THREE.Shape();
        backTriShape.moveTo(-w / 2, 0);
        backTriShape.lineTo(w / 2, 0);
        backTriShape.lineTo(0, -triH);
        backTriShape.closePath();
        const backTriGeo = new THREE.ShapeGeometry(backTriShape);
        backTriGeo.rotateX(-Math.PI / 2);
        backPivot.add(createStyledFace(backTriGeo, FACE_COLORS[2]));
        group.add(backPivot);
        break;
      }

      case 'pyramid': {
        const s = 2.0;
        const apexH = 1.6;
        const slantH = Math.sqrt((s / 2) * (s / 2) + apexH * apexH);
        const foldAnglePyramid = (1 - u) * Math.acos((s / 2) / slantH);

        // Square Base
        const baseGeo = new THREE.PlaneGeometry(s, s);
        baseGeo.rotateX(-Math.PI / 2);
        group.add(createStyledFace(baseGeo, FACE_COLORS[4]));

        // Front Triangle
        const frontPivot = new THREE.Group();
        frontPivot.position.set(0, 0, s / 2);
        frontPivot.rotation.x = foldAnglePyramid;
        const fTriShape = new THREE.Shape();
        fTriShape.moveTo(-s / 2, 0);
        fTriShape.lineTo(s / 2, 0);
        fTriShape.lineTo(0, slantH);
        fTriShape.closePath();
        const fTriGeo = new THREE.ShapeGeometry(fTriShape);
        fTriGeo.rotateX(-Math.PI / 2);
        frontPivot.add(createStyledFace(fTriGeo, FACE_COLORS[1]));
        group.add(frontPivot);

        // Back Triangle
        const backPivot = new THREE.Group();
        backPivot.position.set(0, 0, -s / 2);
        backPivot.rotation.x = -foldAnglePyramid;
        const bTriShape = new THREE.Shape();
        bTriShape.moveTo(-s / 2, 0);
        bTriShape.lineTo(s / 2, 0);
        bTriShape.lineTo(0, -slantH);
        bTriShape.closePath();
        const bTriGeo = new THREE.ShapeGeometry(bTriShape);
        bTriGeo.rotateX(-Math.PI / 2);
        backPivot.add(createStyledFace(bTriGeo, FACE_COLORS[2]));
        group.add(backPivot);

        // Left Triangle
        const leftPivot = new THREE.Group();
        leftPivot.position.set(-s / 2, 0, 0);
        leftPivot.rotation.z = foldAnglePyramid;
        const lTriShape = new THREE.Shape();
        lTriShape.moveTo(0, -s / 2);
        lTriShape.lineTo(0, s / 2);
        lTriShape.lineTo(-slantH, 0);
        lTriShape.closePath();
        const lTriGeo = new THREE.ShapeGeometry(lTriShape);
        lTriGeo.rotateX(-Math.PI / 2);
        leftPivot.add(createStyledFace(lTriGeo, FACE_COLORS[3]));
        group.add(leftPivot);

        // Right Triangle
        const rightPivot = new THREE.Group();
        rightPivot.position.set(s / 2, 0, 0);
        rightPivot.rotation.z = -foldAnglePyramid;
        const rTriShape = new THREE.Shape();
        rTriShape.moveTo(0, -s / 2);
        rTriShape.lineTo(0, s / 2);
        rTriShape.lineTo(slantH, 0);
        rTriShape.closePath();
        const rTriGeo = new THREE.ShapeGeometry(rTriShape);
        rTriGeo.rotateX(-Math.PI / 2);
        rightPivot.add(createStyledFace(rTriGeo, FACE_COLORS[0]));
        group.add(rightPivot);
        break;
      }

      case 'cylinder': {
        const r = 0.9;
        const h = 2.0;
        const circum = 2 * Math.PI * r;
        const segments = 36;

        // Curved lateral sheet unrolling from cylinder into flat rectangle
        const geo = new THREE.PlaneGeometry(circum, h, segments, 1);
        const pos = geo.attributes.position;

        for (let i = 0; i < pos.count; i++) {
          const origX = pos.getX(i);
          const origY = pos.getY(i);

          // Flat coordinate (u = 1):
          const flatX = origX;
          const flatY = 0;
          const flatZ = -origY; // lying in horizontal plane

          // Rolled coordinate (u = 0):
          const angle = (origX / circum) * 2 * Math.PI;
          const rollX = r * Math.sin(angle);
          const rollY = origY + h / 2;
          const rollZ = r * Math.cos(angle);

          // Blend based on unfoldRatio
          pos.setXYZ(
            i,
            (1 - u) * rollX + u * flatX,
            (1 - u) * rollY + u * flatY,
            (1 - u) * rollZ + u * flatZ
          );
        }
        geo.computeVertexNormals();
        const sheetMesh = createStyledFace(geo, FACE_COLORS[0]);
        group.add(sheetMesh);

        // Top Circular Cap (Üst Daire)
        const topCircleGeo = new THREE.CircleGeometry(r, 32);
        topCircleGeo.rotateX(-Math.PI / 2);
        const topCap = createStyledFace(topCircleGeo, FACE_COLORS[1]);
        // When closed: at (0, h, 0). When open: lays flat at (0, 0, h/2 + r)
        topCap.position.set(
          0,
          (1 - u) * h + u * 0,
          (1 - u) * 0 + u * (h / 2 + r + 0.05)
        );
        group.add(topCap);

        // Bottom Circular Cap (Alt Daire)
        const botCircleGeo = new THREE.CircleGeometry(r, 32);
        botCircleGeo.rotateX(-Math.PI / 2);
        const botCap = createStyledFace(botCircleGeo, FACE_COLORS[2]);
        // When closed: at (0, 0, 0). When open: lays flat at (0, 0, -(h/2 + r))
        botCap.position.set(
          0,
          0,
          (1 - u) * 0 + u * (-(h / 2 + r + 0.05))
        );
        group.add(botCap);
        break;
      }

      case 'cone': {
        const r = 1.0;
        const h = 2.0;
        const slant = Math.sqrt(r * r + h * h);
        const sectorAngle = (2 * Math.PI * r) / slant;
        const segments = 36;

        // Unrolling conical lateral surface into circular sector
        const geo = new THREE.PlaneGeometry(1, 1, segments, 1);
        const pos = geo.attributes.position;

        for (let i = 0; i < pos.count; i++) {
          const fx = (pos.getX(i) + 0.5); // 0 to 1
          const fy = (pos.getY(i) + 0.5); // 0 to 1

          // 3D Cone (u = 0)
          const coneAngle = fx * 2 * Math.PI;
          const coneRadius = fy * r;
          const coneX = coneRadius * Math.sin(coneAngle);
          const coneY = (1 - fy) * h;
          const coneZ = coneRadius * Math.cos(coneAngle);

          // 2D Flat Sector (u = 1)
          const sectorA = fx * sectorAngle - sectorAngle / 2;
          const sectorR = fy * slant;
          const flatX = sectorR * Math.sin(sectorA);
          const flatY = 0;
          const flatZ = sectorR * Math.cos(sectorA);

          pos.setXYZ(
            i,
            (1 - u) * coneX + u * flatX,
            (1 - u) * coneY + u * flatY,
            (1 - u) * coneZ + u * flatZ
          );
        }
        geo.computeVertexNormals();
        group.add(createStyledFace(geo, FACE_COLORS[3]));

        // Base Circle
        const baseCircleGeo = new THREE.CircleGeometry(r, 32);
        baseCircleGeo.rotateX(-Math.PI / 2);
        const baseCircle = createStyledFace(baseCircleGeo, FACE_COLORS[4]);
        baseCircle.position.set(
          0,
          0,
          (1 - u) * 0 + u * (slant + r + 0.1)
        );
        group.add(baseCircle);
        break;
      }

      case 'sphere': {
        const r = 1.2;
        // The sphere separates into 8 gore (orange slice) segments or 2 hemispheres
        const numSlices = 8;
        for (let i = 0; i < numSlices; i++) {
          const phiStart = (i / numSlices) * Math.PI * 2;
          const phiLength = (Math.PI * 2) / numSlices;
          const sliceGeo = new THREE.SphereGeometry(r, 16, 16, phiStart, phiLength);
          const sliceMesh = createStyledFace(sliceGeo, FACE_COLORS[i % FACE_COLORS.length]);

          // When opening: peel out radial distance
          const peelAngle = phiStart + phiLength / 2;
          const peelDist = u * 1.5;
          sliceMesh.position.set(
            Math.sin(peelAngle) * peelDist,
            0,
            Math.cos(peelAngle) * peelDist
          );
          sliceMesh.rotation.y = u * (Math.PI / 4) * (i % 2 === 0 ? 1 : -1);
          group.add(sliceMesh);
        }
        break;
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[220] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white">
      {/* 1. BACKGROUND GRADIENT & DYNAMIC PARTICLES */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080d1a] via-[#0d162d] to-[#060a14]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* 2. TOP APP BAR */}
      <header className="relative z-30 bg-[#0a1124]/95 backdrop-blur-md border-b border-slate-700/80 px-2 sm:px-4 py-2 flex items-center justify-between shadow-xl shrink-0">
        {/* Left: Home Button (Using /butt.png) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerSound('/op.mp3');
              onClose();
            }}
            title="Ana Menüye Dön"
            className="group relative w-[88px] h-[30px] sm:w-[110px] sm:h-[38px] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] shrink-0"
          >
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url('/butt.png')` }}
            />
            <span className="relative z-10 text-white font-black text-[9px] sm:text-xs tracking-wider [text-shadow:0_2px_0_#000,0_3px_6px_rgba(0,0,0,0.8)] uppercase select-none -translate-y-[1px]">
              ANA MENÜ
            </span>
          </button>

          {/* Sequential Prev Activity Button */}
          {onPrevActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onPrevActivity();
              }}
              title="Önceki Etkinlik"
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 flex items-center gap-1 transition-all"
            >
              ◀ Önceki
            </button>
          )}
        </div>

        {/* Center Title Badge */}
        <div className="flex items-center justify-center text-center">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1 rounded-xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.25)] border-l-4 border-l-amber-400">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs sm:text-sm shadow-md border border-white/40 shrink-0">
              🧊
            </div>
            <div>
              <h1 className="text-xs sm:text-sm md:text-base font-black text-amber-300 tracking-wide uppercase">
                Geometrik Cisimler Açılım Etkinliği
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">
                3D Katlama & Yüzey Açınım Simülasyonu
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Sound, Quiz Mode & Next Activity */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsSoundEnabled(!isSoundEnabled);
            }}
            title={isSoundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-amber-400 transition-all cursor-pointer"
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-slate-400" />}
          </button>

          <button
            onClick={() => {
              triggerSound('/farklilvl.mp3');
              setShowQuiz(!showQuiz);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              showQuiz 
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50' 
                : 'bg-slate-800/90 text-amber-300 border-amber-400/50 hover:bg-slate-800'
            }`}
          >
            <HelpCircle size={14} />
            <span className="hidden xs:inline">Açınım Testi</span>
          </button>

          {/* Sequential Next Activity Button */}
          {onNextActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onNextActivity();
              }}
              title="Sonraki Etkinlik"
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-400 text-xs font-bold text-white flex items-center gap-1 transition-all"
            >
              Sonraki ▶
            </button>
          )}
        </div>
      </header>

      {/* 3. MAIN WORKSPACE - 3-COLUMN INTERFACE (SOLIDS LIST, 3D STAGE, FOLDING SLIDER) */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden">
        
        {/* LEFT COLUMN: SOLID SELECTOR BUTTONS (MATCHING SCREENSHOT LAYOUT) */}
        <div className="w-full md:w-56 lg:w-64 bg-[#090f20]/95 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-800 p-2 sm:p-3 flex flex-row md:flex-col gap-1.5 sm:gap-2 shrink-0 overflow-x-auto md:overflow-y-auto z-20 shadow-lg">
          <div className="hidden md:block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1 px-1">
            Cisim Seçimi
          </div>

          {SOLIDS.map(solid => {
            const isSelected = selectedSolid.id === solid.id;
            return (
              <button
                key={solid.id}
                onClick={() => {
                  triggerSound('/op.mp3');
                  setSelectedSolid(solid);
                }}
                className={`flex-shrink-0 md:w-full flex items-center justify-between gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-left border-2 transition-all cursor-pointer font-bold ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.45)] scale-[1.02]'
                    : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/90'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base sm:text-lg">{solid.emoji}</span>
                  <span className="text-xs sm:text-sm truncate">{solid.name}</span>
                </div>
                {isSelected && (
                  <ChevronRight size={16} className="text-white hidden md:block shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}

          {/* Quick Actions at bottom of solid menu */}
          <div className="hidden md:flex flex-col gap-1.5 mt-auto pt-3 border-t border-slate-800/80">
            <button
              onClick={handleResetView}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} className="text-amber-400" />
              Bakış Açısını Sıfırla
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleZoom(-1.2)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ZoomIn size={12} className="text-cyan-400" /> Yakın
              </button>
              <button
                onClick={() => handleZoom(1.2)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ZoomOut size={12} className="text-cyan-400" /> Uzak
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: 3D INTERACTIVE THREE.JS STAGE */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          
          {/* Top Stage Indicator / Hint */}
          <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/80 shadow-md text-xs font-semibold text-slate-200 pointer-events-auto flex items-center gap-2">
              <span className="text-base">{selectedSolid.emoji}</span>
              <span className="font-extrabold text-amber-300">{selectedSolid.name}</span>
              <span className="text-slate-400 text-[11px]">| {selectedSolid.curriculumGrade}</span>
            </div>

            <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-1.5 pointer-events-auto">
              <Eye size={12} className="text-cyan-400" />
              <span className="hidden sm:inline">Döndürmek için sürükleyin</span>
              <span className="sm:hidden">Dokunup çevirin</span>
            </div>
          </div>

          {/* Three.js Canvas Container */}
          <div
            ref={mountRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="flex-1 w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
          />

          {/* Floating Pedagogical Quiz Overlay (When enabled) */}
          {showQuiz && quizQuestion && (
            <div className="absolute bottom-20 left-2 right-2 md:left-6 md:right-6 max-w-xl mx-auto z-30 bg-slate-900/95 backdrop-blur-md border-2 border-amber-400/90 rounded-2xl p-3 sm:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                  <HelpCircle size={14} /> Açınım Kavrama Sorusu
                </div>
                <button
                  onClick={() => generateQuizForSolid(selectedSolid)}
                  className="text-[11px] text-slate-400 hover:text-white font-bold underline"
                >
                  Yeni Soru
                </button>
              </div>

              <p className="text-xs sm:text-sm font-extrabold text-white mb-3">
                {quizQuestion.q}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {quizQuestion.options.map((opt, i) => {
                  const isChosen = quizSelected === opt;
                  const isCorrect = opt === quizQuestion.correct;
                  let btnStyle = 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-500';

                  if (quizAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600 border-emerald-300 text-white font-black shadow-[0_0_12px_rgba(16,185,129,0.5)]';
                    } else if (isChosen && !isCorrect) {
                      btnStyle = 'bg-rose-700 border-rose-400 text-white font-black';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={quizAnswered}
                      onClick={() => {
                        setQuizSelected(opt);
                        setQuizAnswered(true);
                        if (opt === quizQuestion.correct) {
                          triggerSound('/para.mp3');
                        } else {
                          triggerSound('/op.mp3');
                        }
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizAnswered && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className={quizSelected === quizQuestion.correct ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                    {quizSelected === quizQuestion.correct ? 'Harika! Doğru cevap.' : `Bilgi: ${quizQuestion.explanation}`}
                  </span>
                  <button
                    onClick={() => generateQuizForSolid(selectedSolid)}
                    className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] hover:bg-amber-300 cursor-pointer"
                  >
                    Sonraki Soru ▶
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BOTTOM PEDAGOGICAL INFO BAR */}
          <div className="bg-[#090f20]/95 backdrop-blur-md border-t border-slate-800 p-2 sm:p-2.5 z-20 shrink-0">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
              {/* Properties Badges */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-orange-950/70 border border-orange-500/50 text-orange-300 font-bold flex items-center gap-1">
                  <Layers size={13} className="text-orange-400" />
                  Yüz: <strong className="text-white font-black">{selectedSolid.facesCount}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-500/50 text-blue-300 font-bold flex items-center gap-1">
                  Ayrıt: <strong className="text-white font-black">{selectedSolid.edgesCount}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1">
                  Köşe: <strong className="text-white font-black">{selectedSolid.verticesCount}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-500/50 text-purple-200 font-semibold hidden md:inline">
                  {selectedSolid.faceDescription}
                </span>
              </div>

              {/* Didactic Fact Note */}
              <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium italic truncate max-w-md">
                💡 {selectedSolid.didacticFact}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FOLDING / UNFOLDING SLIDER (EXACTLY MATCHING USER SCREENSHOT) */}
        <div className="w-full md:w-36 lg:w-44 bg-[#090f20]/95 backdrop-blur-md border-t md:border-t-0 md:border-l border-slate-800 p-2.5 sm:p-4 flex flex-row md:flex-col items-center justify-between shrink-0 z-20 shadow-lg">
          
          {/* Top Label: "Kapalı" */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                setUnfoldRatio(0);
              }}
              title="Tamamen Kapat (3D Cisim)"
              className="text-xs sm:text-sm font-black text-slate-200 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Box size={14} className="text-amber-400" />
              Kapalı
            </button>
            <span className="text-[10px] text-slate-400 font-semibold hidden md:block">
              (3B Cisim)
            </span>
          </div>

          {/* Interactive Slider */}
          <div className="flex-1 flex flex-col md:flex-col items-center justify-center py-2 px-3 w-full max-w-xs md:max-w-none">
            {/* Range input oriented vertically on desktop, horizontally on mobile */}
            <div className="relative w-full flex items-center justify-center my-1 md:my-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={unfoldRatio}
                onChange={(e) => {
                  setUnfoldRatio(parseFloat(e.target.value));
                }}
                className="w-full h-3 md:h-48 md:[writing-mode:vertical-lr] md:[direction:rtl] accent-amber-400 bg-slate-800 rounded-lg cursor-pointer transition-all"
              />
            </div>

            {/* Percentage Indicator Badge */}
            <div className="mt-1 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono font-bold text-[11px]">
              %{Math.round(unfoldRatio * 100)} Açık
            </div>
          </div>

          {/* Bottom Label: "Açık" */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                setUnfoldRatio(1);
              }}
              title="Tamamen Aç (2D Düzlem Açınımı)"
              className="text-xs sm:text-sm font-black text-slate-200 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Layers size={14} className="text-emerald-400" />
              Açık
            </button>
            <span className="text-[10px] text-slate-400 font-semibold hidden md:block">
              (Düz Açınım)
            </span>
          </div>

          {/* Animation Auto-Play & Speed Toggle Controls */}
          <div className="w-full flex flex-col gap-1.5 pt-2 md:pt-3 border-t border-slate-800/80 mt-1 md:mt-2">
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                setIsPlaying(!isPlaying);
              }}
              className={`w-full py-1.5 px-2 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isPlaying
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Durdur' : 'Oynat'}</span>
            </button>

            {/* Speed Selector */}
            <div className="grid grid-cols-3 gap-1">
              {[0.5, 1, 1.5].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaySpeed(spd)}
                  className={`py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    playSpeed === spd
                      ? 'bg-slate-700 text-amber-300 border border-amber-400/50'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

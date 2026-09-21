import React from 'react';
import { GeometricSolidType } from '../data/geometricShapesGameData';

interface Solid3DIconProps {
  solidType: GeometricSolidType;
  className?: string;
  size?: number;
}

export const Solid3DIcon: React.FC<Solid3DIconProps> = ({ solidType, className = "w-12 h-12", size = 48 }) => {
  switch (solidType) {
    case 'kup':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <defs>
            <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>
          {/* Top Face */}
          <polygon points="50,14 85,32 50,50 15,32" fill="url(#cubeTop)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Left Face */}
          <polygon points="15,32 50,50 50,86 15,68" fill="url(#cubeLeft)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Right Face */}
          <polygon points="50,50 85,32 85,68 50,86" fill="url(#cubeRight)" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      );

    case 'silindir':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <defs>
            <linearGradient id="cylBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="35%" stopColor="#67e8f9" />
              <stop offset="70%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
            <linearGradient id="cylTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          {/* Body */}
          <path d="M22,30 L22,70 A28,14 0 0 0 78,70 L78,30 Z" fill="url(#cylBody)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Bottom Ellipse Rim */}
          <ellipse cx="50" cy="70" rx="28" ry="14" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="3,3" />
          {/* Top Face */}
          <ellipse cx="50" cy="30" rx="28" ry="14" fill="url(#cylTop)" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      );

    case 'kure':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <defs>
            <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#86efac" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#sphereGrad)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Equator and meridian subtle arcs */}
          <ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4,4" />
          <ellipse cx="50" cy="50" rx="14" ry="38" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4,4" />
        </svg>
      );

    case 'koni':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <defs>
            <linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="40%" stopColor="#d8b4fe" />
              <stop offset="80%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <linearGradient id="coneBase" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          {/* Base bottom curve */}
          <ellipse cx="50" cy="74" rx="30" ry="13" fill="url(#coneBase)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Cone body */}
          <path d="M50,15 L20,74 A30,13 0 0 0 80,74 Z" fill="url(#coneGrad)" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      );

    case 'dikdortgen_prizma':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <defs>
            <linearGradient id="rectTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="rectLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="rectRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          {/* Top Face */}
          <polygon points="38,18 84,28 62,44 16,34" fill="url(#rectTop)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Front Face (longer) */}
          <polygon points="16,34 62,44 62,78 16,68" fill="url(#rectLeft)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Side Face */}
          <polygon points="62,44 84,28 84,62 62,78" fill="url(#rectRight)" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      );

    case 'ucgen_prizma':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <defs>
            <linearGradient id="triFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id="triSide" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>
          {/* Roof side slope */}
          <polygon points="32,22 78,34 64,74 18,62" fill="url(#triSide)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Front Triangular Face */}
          <polygon points="18,62 32,22 46,72" fill="url(#triFront)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Right side slope */}
          <polygon points="32,22 78,34 90,82 46,72" fill="url(#triSide)" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      );

    case 'kare_prizma':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <defs>
            <linearGradient id="sqTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
            <linearGradient id="sqLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="sqRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
          </defs>
          {/* Top Square Face */}
          <polygon points="50,14 78,28 50,42 22,28" fill="url(#sqTop)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Left Tall Face */}
          <polygon points="22,28 50,42 50,86 22,72" fill="url(#sqLeft)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Right Tall Face */}
          <polygon points="50,42 78,28 78,72 50,86" fill="url(#sqRight)" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      );

    default:
      return null;
  }
};

interface EverydayObjectGraphicProps {
  itemId: string;
  className?: string;
  size?: number;
}

export const EverydayObjectGraphic: React.FC<EverydayObjectGraphicProps> = ({ itemId, className = "w-14 h-14", size = 56 }) => {
  switch (itemId) {
    // KÜP
    case 'kup_zar':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,14 85,32 50,50 15,32" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
          <polygon points="15,32 50,50 50,86 15,68" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="50,50 85,32 85,68 50,86" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
          {/* Dots */}
          <circle cx="50" cy="32" r="4.5" fill="#ef4444" />
          <circle cx="28" cy="46" r="3.5" fill="#0f172a" />
          <circle cx="37" cy="68" r="3.5" fill="#0f172a" />
          <circle cx="63" cy="46" r="3.5" fill="#0f172a" />
          <circle cx="68" cy="60" r="3.5" fill="#0f172a" />
          <circle cx="73" cy="74" r="3.5" fill="#0f172a" />
        </svg>
      );

    case 'kup_rubik':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* 3D Rubik Cube */}
          <polygon points="50,14 85,32 50,50 15,32" fill="#0f172a" stroke="#000" strokeWidth="3" />
          <polygon points="15,32 50,50 50,86 15,68" fill="#0f172a" stroke="#000" strokeWidth="3" />
          <polygon points="50,50 85,32 85,68 50,86" fill="#0f172a" stroke="#000" strokeWidth="3" />
          {/* Top colored stickers */}
          <polygon points="50,16 61,22 50,28 38,22" fill="#eab308" />
          <polygon points="62,23 73,28 62,34 51,29" fill="#ef4444" />
          <polygon points="74,29 84,33 74,39 63,35" fill="#3b82f6" />
          <polygon points="38,23 49,29 38,35 27,29" fill="#22c55e" />
          <polygon points="50,30 61,35 50,41 39,35" fill="#eab308" />
          <polygon points="62,36 73,41 62,47 51,42" fill="#f97316" />
          <polygon points="26,30 37,36 26,42 16,34" fill="#ffffff" />
          <polygon points="38,37 49,42 38,48 27,43" fill="#3b82f6" />
          <polygon points="50,43 61,48 50,49 39,44" fill="#ef4444" />
          {/* Front stickers */}
          <polygon points="17,35 27,40 27,51 17,46" fill="#3b82f6" />
          <polygon points="28,41 38,46 38,57 28,52" fill="#ef4444" />
          <polygon points="39,47 49,52 49,63 39,58" fill="#22c55e" />
          <polygon points="17,48 27,53 27,64 17,59" fill="#eab308" />
          <polygon points="28,54 38,59 38,70 28,65" fill="#3b82f6" />
          <polygon points="39,60 49,65 49,76 39,71" fill="#f97316" />
          <polygon points="17,61 27,66 27,77 17,72" fill="#ef4444" />
          <polygon points="28,67 38,72 38,83 28,78" fill="#ffffff" />
          <polygon points="39,73 49,78 49,85 39,80" fill="#22c55e" />
          {/* Right stickers */}
          <polygon points="51,52 61,47 61,58 51,63" fill="#f97316" />
          <polygon points="62,46 72,41 72,52 62,57" fill="#eab308" />
          <polygon points="73,40 83,35 83,46 73,51" fill="#ffffff" />
          <polygon points="51,65 61,60 61,71 51,76" fill="#3b82f6" />
          <polygon points="62,59 72,54 72,65 62,70" fill="#ef4444" />
          <polygon points="73,53 83,48 83,59 73,64" fill="#22c55e" />
          <polygon points="51,78 61,73 61,84 51,85" fill="#ffffff" />
          <polygon points="62,72 72,67 72,78 62,83" fill="#f97316" />
          <polygon points="73,66 83,61 83,72 73,77" fill="#eab308" />
        </svg>
      );

    case 'kup_hediye':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,16 85,34 50,52 15,34" fill="#ec4899" stroke="#db2777" strokeWidth="2" />
          <polygon points="15,34 50,52 50,86 15,68" fill="#be185d" stroke="#9d174d" strokeWidth="2" />
          <polygon points="50,52 85,34 85,68 50,86" fill="#9d174d" stroke="#831843" strokeWidth="2" />
          {/* Ribbon */}
          <polygon points="46,18 54,22 54,50 46,46" fill="#facc15" />
          <polygon points="28,27 34,24 67,41 61,44" fill="#facc15" />
          <polygon points="46,50 54,46 54,84 46,84" fill="#facc15" />
          <polygon points="64,41 71,37 71,75 64,79" fill="#eab308" />
          {/* Bow on top */}
          <circle cx="50" cy="22" r="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
          <path d="M48,20 C38,10 40,24 48,22 Z" fill="#facc15" />
          <path d="M52,20 C62,10 60,24 52,22 Z" fill="#facc15" />
        </svg>
      );

    case 'kup_buz':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,18 82,34 50,50 18,34" fill="#bae6fd" stroke="#38bdf8" strokeWidth="2.5" fillOpacity="0.85" />
          <polygon points="18,34 50,50 50,82 18,66" fill="#7dd3fc" stroke="#0284c7" strokeWidth="2.5" fillOpacity="0.85" />
          <polygon points="50,50 82,34 82,66 50,82" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.5" fillOpacity="0.85" />
          {/* Ice reflections */}
          <polygon points="48,24 74,36 50,47 26,35" fill="#ffffff" fillOpacity="0.6" />
          <line x1="26" y1="42" x2="44" y2="52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="52" x2="38" y2="58" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'kup_seker':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,22 80,36 50,50 20,36" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="20,36 50,50 50,78 20,64" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          <polygon points="50,50 80,36 80,64 50,78" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
          {/* Sugar grains */}
          <circle cx="45" cy="32" r="1.5" fill="#cbd5e1" />
          <circle cx="55" cy="36" r="1.5" fill="#cbd5e1" />
          <circle cx="35" cy="52" r="1.5" fill="#94a3b8" />
          <circle cx="42" cy="62" r="1.5" fill="#94a3b8" />
          <circle cx="65" cy="52" r="1.5" fill="#64748b" />
        </svg>
      );

    case 'kup_ahsap':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,16 85,34 50,52 15,34" fill="#fef08a" stroke="#d97706" strokeWidth="2.5" />
          <polygon points="15,34 50,52 50,86 15,68" fill="#f59e0b" stroke="#b45309" strokeWidth="2.5" />
          <polygon points="50,52 85,34 85,68 50,86" fill="#d97706" stroke="#92400e" strokeWidth="2.5" />
          {/* Letter A on front */}
          <text x="32" y="66" fontSize="24" fontWeight="900" fill="#dc2626" transform="skewY(18)">A</text>
        </svg>
      );

    case 'kup_koli':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,16 85,34 50,52 15,34" fill="#d97706" stroke="#b45309" strokeWidth="2.5" />
          <polygon points="15,34 50,52 50,86 15,68" fill="#b45309" stroke="#92400e" strokeWidth="2.5" />
          <polygon points="50,52 85,34 85,68 50,86" fill="#92400e" stroke="#78350f" strokeWidth="2.5" />
          {/* Tape */}
          <polygon points="46,18 54,22 54,84 46,84" fill="#fed7aa" fillOpacity="0.8" />
        </svg>
      );

    // SİLİNDİR
    case 'sil_konserve':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Body */}
          <path d="M24,32 L24,70 A26,12 0 0 0 76,70 L76,32 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2.5" />
          {/* Label */}
          <path d="M24,42 L24,62 A26,12 0 0 0 76,62 L76,42 A26,12 0 0 1 24,42 Z" fill="#ef4444" />
          <text x="50" y="56" fontSize="10" fontWeight="900" fill="#ffffff" textAnchor="middle">SALÇA</text>
          {/* Top Ellipse */}
          <ellipse cx="50" cy="32" rx="26" ry="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2.5" />
          <ellipse cx="50" cy="32" rx="20" ry="9" fill="none" stroke="#64748b" strokeWidth="1.5" />
        </svg>
      );

    case 'sil_salca':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <path d="M22,30 L22,72 A28,13 0 0 0 78,72 L78,30 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2.5" />
          <ellipse cx="50" cy="30" rx="28" ry="13" fill="#fca5a5" stroke="#ef4444" strokeWidth="2.5" />
          <circle cx="50" cy="52" r="12" fill="#ffffff" />
          <text x="50" y="56" fontSize="11" fontWeight="900" fill="#dc2626" textAnchor="middle">🍅</text>
        </svg>
      );

    case 'sil_pil':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Positive nipple */}
          <ellipse cx="50" cy="18" rx="8" ry="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
          <path d="M42,18 L42,22 A8,4 0 0 0 58,22 L58,18 Z" fill="#94a3b8" />
          {/* Body */}
          <path d="M26,24 L26,76 A24,10 0 0 0 74,76 L74,24 Z" fill="#0f172a" stroke="#334155" strokeWidth="2.5" />
          {/* Gold top band */}
          <path d="M26,24 L26,42 A24,10 0 0 0 74,42 L74,24 A24,10 0 0 1 26,24 Z" fill="#f59e0b" />
          <ellipse cx="50" cy="24" rx="24" ry="10" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <text x="50" y="64" fontSize="12" fontWeight="900" fill="#f8fafc" textAnchor="middle">AA +</text>
        </svg>
      );

    case 'sil_rulo':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <path d="M28,26 L28,76 A22,11 0 0 0 72,76 L72,26 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Top roll face */}
          <ellipse cx="50" cy="26" rx="22" ry="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Inner tube */}
          <ellipse cx="50" cy="26" rx="8" ry="4" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
        </svg>
      );

    case 'sil_davul':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <path d="M20,32 L20,68 A30,14 0 0 0 80,68 L80,32 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2.5" />
          {/* Zig-zag rope pattern */}
          <polyline points="22,34 35,68 48,34 62,68 76,34" fill="none" stroke="#facc15" strokeWidth="2.5" />
          <ellipse cx="50" cy="32" rx="30" ry="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="2.5" />
          {/* Drumsticks */}
          <line x1="20" y1="16" x2="48" y2="34" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="16" x2="52" y2="34" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'sil_teneke':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <path d="M26,26 L26,76 A24,10 0 0 0 74,76 L74,26 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2.5" />
          <ellipse cx="50" cy="26" rx="24" ry="10" fill="#93c5fd" stroke="#60a5fa" strokeWidth="2" />
          <circle cx="50" cy="26" r="4" fill="#1e3a8a" />
          <path d="M30,42 Q50,34 70,42 L70,58 Q50,50 30,58 Z" fill="#ffffff" fillOpacity="0.8" />
          <text x="50" y="53" fontSize="10" fontWeight="900" fill="#1d4ed8" textAnchor="middle">KOLA</text>
        </svg>
      );

    case 'sil_mum':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Flame */}
          <path d="M50,10 C46,18 44,24 50,30 C56,24 54,18 50,10 Z" fill="#f59e0b" />
          <circle cx="50" cy="24" r="3" fill="#fef08a" />
          {/* Wick */}
          <line x1="50" y1="28" x2="50" y2="36" stroke="#000" strokeWidth="2" />
          {/* Body */}
          <path d="M28,38 L28,80 A22,10 0 0 0 72,80 L72,38 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="2.5" />
          <ellipse cx="50" cy="38" rx="22" ry="10" fill="#fda4af" stroke="#f43f5e" strokeWidth="2" />
        </svg>
      );

    case 'sil_termos':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Cap */}
          <path d="M36,20 L36,30 A14,6 0 0 0 64,30 L64,20 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <ellipse cx="50" cy="20" rx="14" ry="6" fill="#475569" />
          {/* Body */}
          <path d="M30,30 L30,82 A20,9 0 0 0 70,82 L70,30 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2.5" />
          <ellipse cx="50" cy="30" rx="20" ry="9" fill="#38bdf8" />
          {/* Band */}
          <line x1="30" y1="52" x2="70" y2="52" stroke="#facc15" strokeWidth="3" />
        </svg>
      );

    // KÜRE
    case 'kur_futbol':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <circle cx="50" cy="50" r="38" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
          {/* Center pentagon */}
          <polygon points="50,38 60,46 56,58 44,58 40,46" fill="#0f172a" />
          {/* Neighbor lines */}
          <line x1="50" y1="38" x2="50" y2="20" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="60" y1="46" x2="78" y2="40" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="56" y1="58" x2="70" y2="76" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="44" y1="58" x2="30" y2="76" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="40" y1="46" x2="22" y2="40" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
      );

    case 'kur_portakal':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Leaf */}
          <path d="M50,16 C58,8 70,12 66,22 C58,24 54,20 50,16 Z" fill="#16a34a" stroke="#15803d" strokeWidth="1.5" />
          <circle cx="50" cy="54" r="36" fill="#f97316" stroke="#ea580c" strokeWidth="3" />
          {/* Dots on orange */}
          <circle cx="40" cy="45" r="1.5" fill="#ea580c" />
          <circle cx="58" cy="48" r="1.5" fill="#ea580c" />
          <circle cx="50" cy="62" r="1.5" fill="#ea580c" />
        </svg>
      );

    case 'kur_basket':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <circle cx="50" cy="50" r="38" fill="#ea580c" stroke="#000000" strokeWidth="3" />
          {/* Basketball lines */}
          <line x1="12" y1="50" x2="88" y2="50" stroke="#000000" strokeWidth="2.5" />
          <line x1="50" y1="12" x2="50" y2="88" stroke="#000000" strokeWidth="2.5" />
          <path d="M22,22 Q50,42 78,22" fill="none" stroke="#000000" strokeWidth="2.5" />
          <path d="M22,78 Q50,58 78,78" fill="none" stroke="#000000" strokeWidth="2.5" />
        </svg>
      );

    case 'kur_dunya':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Stand */}
          <path d="M50,86 L50,78 M36,86 L64,86" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <path d="M20,50 A34,34 0 0 0 74,74" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          {/* Earth sphere */}
          <circle cx="48" cy="46" r="28" fill="#38bdf8" stroke="#0284c7" strokeWidth="2.5" />
          {/* Continents */}
          <path d="M38,32 Q46,38 42,46 Q32,48 38,32 Z" fill="#22c55e" />
          <path d="M52,40 Q62,42 60,54 Q50,58 52,40 Z" fill="#22c55e" />
        </svg>
      );

    case 'kur_misket':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <circle cx="50" cy="50" r="36" fill="#a5f3fc" stroke="#0891b2" strokeWidth="3" />
          {/* Swirl */}
          <path d="M30,30 Q50,50 40,74" fill="none" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
          <path d="M66,32 Q46,50 56,72" fill="none" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
          {/* Glass reflection */}
          <ellipse cx="38" cy="34" rx="8" ry="4" fill="#ffffff" fillOpacity="0.8" transform="rotate(-30 38 34)" />
        </svg>
      );

    case 'kur_karpuz':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <circle cx="50" cy="50" r="38" fill="#15803d" stroke="#14532d" strokeWidth="3" />
          {/* Dark green stripes */}
          <path d="M20,30 Q50,50 20,70" fill="none" stroke="#14532d" strokeWidth="4" />
          <path d="M36,18 Q50,50 36,82" fill="none" stroke="#14532d" strokeWidth="4" />
          <path d="M50,12 Q50,50 50,88" fill="none" stroke="#14532d" strokeWidth="4" />
          <path d="M64,18 Q50,50 64,82" fill="none" stroke="#14532d" strokeWidth="4" />
          <path d="M80,30 Q50,50 80,70" fill="none" stroke="#14532d" strokeWidth="4" />
        </svg>
      );

    case 'kur_yun':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <circle cx="50" cy="50" r="36" fill="#ec4899" stroke="#be185d" strokeWidth="3" />
          {/* Yarn threads */}
          <path d="M22,38 Q50,20 78,38" fill="none" stroke="#db2777" strokeWidth="3" />
          <path d="M18,52 Q50,70 82,52" fill="none" stroke="#db2777" strokeWidth="3" />
          <path d="M34,22 Q50,50 34,78" fill="none" stroke="#f472b6" strokeWidth="3" />
          <path d="M66,22 Q50,50 66,78" fill="none" stroke="#f472b6" strokeWidth="3" />
        </svg>
      );

    // KONİ
    case 'kon_kulah':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Cone waffle */}
          <polygon points="50,88 28,44 72,44" fill="#d97706" stroke="#b45309" strokeWidth="2.5" />
          {/* Grid on waffle */}
          <line x1="36" y1="44" x2="44" y2="74" stroke="#92400e" strokeWidth="1.5" />
          <line x1="64" y1="44" x2="56" y2="74" stroke="#92400e" strokeWidth="1.5" />
          {/* Ice cream scoops */}
          <circle cx="50" cy="38" r="18" fill="#f43f5e" />
          <circle cx="50" cy="22" r="14" fill="#fde047" />
          <circle cx="50" cy="10" r="4" fill="#ef4444" />
        </svg>
      );

    case 'kon_trafik':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Base */}
          <polygon points="16,84 84,84 76,76 24,76" fill="#0f172a" stroke="#000" strokeWidth="2" />
          {/* Cone body */}
          <polygon points="50,14 26,76 74,76" fill="#f97316" stroke="#ea580c" strokeWidth="2.5" />
          {/* White stripes */}
          <polygon points="42,35 58,35 62,48 38,48" fill="#ffffff" />
          <polygon points="34,58 66,58 70,68 30,68" fill="#ffffff" />
        </svg>
      );

    case 'kon_sapka':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Pom pom */}
          <circle cx="50" cy="14" r="6" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
          {/* Hat body */}
          <polygon points="50,18 22,82 78,82" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2.5" />
          {/* Dots */}
          <circle cx="44" cy="42" r="3.5" fill="#f43f5e" />
          <circle cx="56" cy="54" r="4" fill="#22c55e" />
          <circle cx="38" cy="68" r="4.5" fill="#38bdf8" />
          <circle cx="62" cy="72" r="3.5" fill="#facc15" />
        </svg>
      );

    case 'kon_huni':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Spout */}
          <rect x="46" y="66" width="8" height="22" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
          {/* Cone top */}
          <polygon points="50,66 18,24 82,24" fill="#38bdf8" stroke="#0284c7" strokeWidth="2.5" />
          <ellipse cx="50" cy="24" rx="32" ry="8" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
        </svg>
      );

    case 'kon_cam':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Trunk */}
          <rect x="45" y="76" width="10" height="14" fill="#78350f" />
          {/* 3 Tier Pine cone tree */}
          <polygon points="50,14 32,40 68,40" fill="#15803d" stroke="#166534" strokeWidth="2" />
          <polygon points="50,32 26,58 74,58" fill="#16a34a" stroke="#15803d" strokeWidth="2" />
          <polygon points="50,50 20,78 80,78" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />
        </svg>
      );

    case 'kon_havuc':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Greens */}
          <path d="M50,12 Q42,22 48,30 M50,10 Q58,22 52,30 M50,8 Q50,22 50,30" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
          {/* Carrot cone */}
          <polygon points="50,90 32,30 68,30" fill="#f97316" stroke="#ea580c" strokeWidth="2.5" />
          <ellipse cx="50" cy="30" rx="18" ry="6" fill="#fb923c" stroke="#ea580c" strokeWidth="2" />
          <line x1="38" y1="46" x2="48" y2="46" stroke="#c2410c" strokeWidth="1.5" />
          <line x1="52" y1="62" x2="60" y2="62" stroke="#c2410c" strokeWidth="1.5" />
        </svg>
      );

    // DİKDÖRTGENLER PRİZMASI
    case 'dik_sut':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Gable top */}
          <polygon points="34,22 66,22 50,14" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
          <polygon points="66,22 80,32 64,24 50,14" fill="#1d4ed8" />
          {/* Box front */}
          <polygon points="34,22 66,22 66,84 34,84" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          {/* Box side */}
          <polygon points="66,22 80,32 80,76 66,84" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          {/* Milk label */}
          <rect x="38" y="38" width="22" height="26" fill="#3b82f6" rx="3" />
          <text x="49" y="54" fontSize="9" fontWeight="900" fill="#ffffff" textAnchor="middle">SÜT</text>
        </svg>
      );

    case 'dik_kitap':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="26,24 74,32 60,42 16,34" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <polygon points="16,34 60,42 60,78 16,70" fill="#f87171" stroke="#dc2626" strokeWidth="2" />
          <polygon points="60,42 74,32 74,68 60,78" fill="#fef2f2" stroke="#cbd5e1" strokeWidth="2" />
          {/* Book spine & gold star */}
          <line x1="20" y1="35" x2="20" y2="71" stroke="#facc15" strokeWidth="3" />
        </svg>
      );

    case 'dik_kibrit':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="30,28 76,34 58,46 16,40" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
          <polygon points="16,40 58,46 58,74 16,68" fill="#fef08a" stroke="#eab308" strokeWidth="2" />
          <polygon points="58,46 76,34 76,62 58,74" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          {/* Striker strip */}
          <text x="36" y="60" fontSize="8" fontWeight="900" fill="#854d0e" textAnchor="middle">KİBRİT</text>
        </svg>
      );

    case 'dik_ayakkabi':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="34,26 84,34 66,48 18,40" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
          <polygon points="18,40 66,48 66,76 18,68" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
          <polygon points="66,48 84,34 84,62 66,76" fill="#c2410c" stroke="#9a3412" strokeWidth="2" />
          <text x="42" y="62" fontSize="9" fontWeight="900" fill="#ffffff" textAnchor="middle">SHOES</text>
        </svg>
      );

    case 'dik_tugla':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="32,24 82,32 64,46 16,38" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" />
          <polygon points="16,38 64,46 64,74 16,66" fill="#b91c1c" stroke="#991b1b" strokeWidth="2" />
          <polygon points="64,46 82,32 82,60 64,74" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
          {/* Holes in brick */}
          <ellipse cx="32" cy="34" rx="4" ry="2" fill="#7f1d1d" />
          <ellipse cx="48" cy="36" rx="4" ry="2" fill="#7f1d1d" />
          <ellipse cx="64" cy="38" rx="4" ry="2" fill="#7f1d1d" />
        </svg>
      );

    case 'dik_telefon':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="30,18 72,24 58,34 18,28" fill="#334155" stroke="#1e293b" strokeWidth="2" />
          <polygon points="18,28 58,34 58,82 18,76" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
          <polygon points="58,34 72,24 72,72 58,82" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          {/* Screen glow */}
          <polygon points="22,33 54,38 54,77 22,72" fill="#0284c7" />
        </svg>
      );

    case 'dik_biskuvi':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="30,26 78,32 60,44 16,38" fill="#ca8a04" stroke="#a16207" strokeWidth="2" />
          <polygon points="16,38 60,44 60,72 16,66" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
          <polygon points="60,44 78,32 78,60 60,72" fill="#a16207" stroke="#854d0e" strokeWidth="2" />
          <text x="38" y="58" fontSize="8" fontWeight="900" fill="#713f12" textAnchor="middle">BİSKÜVİ</text>
        </svg>
      );

    // ÜÇGEN PRİZMA
    case 'ucg_cadir':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="32,24 78,34 64,74 18,64" fill="#059669" stroke="#047857" strokeWidth="2.5" />
          <polygon points="18,64 32,24 46,72" fill="#10b981" stroke="#059669" strokeWidth="2.5" />
          {/* Tent opening */}
          <polygon points="24,66 32,32 40,70" fill="#0f172a" />
        </svg>
      );

    case 'ucg_peynir':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="32,24 78,34 64,72 18,62" fill="#facc15" stroke="#eab308" strokeWidth="2.5" />
          <polygon points="18,62 32,24 46,70" fill="#fde047" stroke="#facc15" strokeWidth="2.5" />
          {/* Cheese holes */}
          <ellipse cx="44" cy="44" rx="4" ry="2.5" fill="#ca8a04" />
          <ellipse cx="58" cy="52" rx="5" ry="3" fill="#ca8a04" />
          <ellipse cx="32" cy="52" rx="3" ry="2" fill="#ca8a04" />
        </svg>
      );

    case 'ucg_cati':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Roof tiles */}
          <polygon points="30,22 80,32 64,72 16,62" fill="#dc2626" stroke="#b91c1c" strokeWidth="2.5" />
          <polygon points="16,62 30,22 44,70" fill="#ef4444" stroke="#dc2626" strokeWidth="2.5" />
          {/* Chimney */}
          <polygon points="56,22 64,24 64,36 56,34" fill="#991b1b" />
        </svg>
      );

    case 'ucg_takvim':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="32,24 78,34 64,74 18,64" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2.5" />
          <polygon points="18,64 32,24 46,72" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Spiral binder on top */}
          <circle cx="38" cy="26" r="2" fill="#dc2626" />
          <circle cx="48" cy="28" r="2" fill="#dc2626" />
          <circle cx="58" cy="30" r="2" fill="#dc2626" />
          <text x="44" y="54" fontSize="12" fontWeight="900" fill="#dc2626" textAnchor="middle">20</text>
        </svg>
      );

    case 'ucg_cikolata':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="30,24 82,34 66,74 16,64" fill="#eab308" stroke="#ca8a04" strokeWidth="2.5" />
          <polygon points="16,64 30,24 44,72" fill="#fde047" stroke="#eab308" strokeWidth="2.5" />
          {/* Triangular chocolate mountains */}
          <text x="48" y="54" fontSize="8" fontWeight="900" fill="#78350f" transform="rotate(12 48 54)">CHOCO</text>
        </svg>
      );

    case 'ucg_takoz':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="30,24 78,34 64,74 16,64" fill="#f59e0b" stroke="#d97706" strokeWidth="2.5" />
          <polygon points="16,64 30,24 44,72" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="26" y1="46" x2="38" y2="70" stroke="#000" strokeWidth="2" strokeDasharray="3,3" />
        </svg>
      );

    // KARE PRİZMA
    case 'kar_ilac':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,14 74,26 50,38 26,26" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="26,26 50,38 50,86 26,74" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="50,38 74,26 74,74 50,86" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
          {/* Red Cross */}
          <rect x="35" y="48" width="6" height="16" fill="#ef4444" rx="1" />
          <rect x="30" y="53" width="16" height="6" fill="#ef4444" rx="1" />
        </svg>
      );

    case 'kar_parfum':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          {/* Gold Sprayer Cap */}
          <polygon points="50,14 62,20 50,26 38,20" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <polygon points="38,20 50,26 50,34 38,28" fill="#eab308" />
          <polygon points="50,26 62,20 62,28 50,34" fill="#ca8a04" />
          {/* Tall Square Bottle */}
          <polygon points="50,32 74,42 50,52 26,42" fill="#c084fc" stroke="#a855f7" strokeWidth="2" />
          <polygon points="26,42 50,52 50,88 26,78" fill="#e9d5ff" stroke="#a855f7" strokeWidth="2" fillOpacity="0.8" />
          <polygon points="50,52 74,42 74,78 50,88" fill="#d8b4fe" stroke="#9333ea" strokeWidth="2" fillOpacity="0.8" />
        </svg>
      );

    case 'kar_gokdelen':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,12 76,24 50,36 24,24" fill="#64748b" stroke="#475569" strokeWidth="2" />
          <polygon points="24,24 50,36 50,88 24,76" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
          <polygon points="50,36 76,24 76,76 50,88" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
          {/* Window grids */}
          <line x1="32" y1="36" x2="32" y2="78" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1="42" y1="40" x2="42" y2="82" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1="58" y1="40" x2="58" y2="82" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1="68" y1="36" x2="68" y2="78" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,3" />
        </svg>
      );

    case 'kar_cay':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,16 74,28 50,40 26,28" fill="#ca8a04" stroke="#a16207" strokeWidth="2" />
          <polygon points="26,28 50,40 50,86 26,74" fill="#15803d" stroke="#14532d" strokeWidth="2" />
          <polygon points="50,40 74,28 74,74 50,86" fill="#166534" stroke="#14532d" strokeWidth="2" />
          <text x="38" y="60" fontSize="9" fontWeight="900" fill="#facc15" textAnchor="middle">ÇAY</text>
        </svg>
      );

    case 'kar_kucuksut':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size}>
          <polygon points="50,18 72,28 50,38 28,28" fill="#60a5fa" stroke="#3b82f6" strokeWidth="2" />
          <polygon points="28,28 50,38 50,84 28,74" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="50,38 72,28 72,74 50,84" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          <text x="40" y="58" fontSize="8" fontWeight="900" fill="#2563eb" textAnchor="middle">SÜT</text>
        </svg>
      );

    default:
      return (
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-xl">
          📦
        </div>
      );
  }
};

import React, { StrictMode, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Critical UI assets preloader to warm the browser image cache immediately
const CRITICAL_BUTTON_IMAGES = [
  '/ana.webp',
  '/geri.webp',
  '/ileri.webp',
  '/ses.webp',
  '/ist.webp',
  '/1oy.webp',
  '/2oy.webp',
  '/3oy.webp',
  '/icon_1.webp',
  '/icon_2.webp',
  '/icon_3.webp',
  '/icon_4.webp',
  '/icon_5.webp',
  '/icon_6.webp',
  '/kap.webp',
  '/ejd.webp',
  '/balta.webp',
  '/kap1.webp',
  '/ejd1.webp',
  '/balta1.webp',
  '/p1.webp',
  '/p2.webp',
  '/p3.webp',
];

if (typeof window !== 'undefined') {
  const isInitialPdfUrl =
    window.location.search.toLowerCase().includes('page=pdf') ||
    window.location.hash.toLowerCase().includes('pdf-editor') ||
    window.location.pathname.toLowerCase().endsWith('/pdf');

  // Arayüz görsellerini açılışı yavaşlatmadan, tarayıcı boşta kalınca ön belleğe al (PDF modunda gereksiz yükleme yapma)
  if (!isInitialPdfUrl) {
    const warmImages = () => {
      CRITICAL_BUTTON_IMAGES.forEach((src) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      });
    };
    const startWarm = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(warmImages, { timeout: 3000 });
      } else {
        setTimeout(warmImages, 1500);
      }
    };
    if (document.readyState === 'complete') startWarm();
    else window.addEventListener('load', startWarm, { once: true });
  }

  // Sekme arka plandayken tüm CSS animasyonlarını durdur (CPU/GPU ve fan tasarrufu)
  const syncTabVisibility = () =>
    document.documentElement.classList.toggle('tab-hidden', document.hidden);
  document.addEventListener('visibilitychange', syncTabVisibility);
  syncTabVisibility();

  // Akıllı tahtalarda 2 veya 3 çocuk aynı anda dokunduğunda browser'ın sağ tık menüsünü açmasını tamamen engelle
  const blockContextMenu = (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return; // Metin giriş kutularında izin ver
    }
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  window.addEventListener('contextmenu', blockContextMenu, { capture: true, passive: false });
  document.addEventListener('contextmenu', blockContextMenu, { capture: true, passive: false });

  // Dokunmatik ekranda basılı tutma / çoklu parmakla sağ tık emülasyonunu engelle
  window.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.pointerType === 'touch' && e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true, passive: false });

  // İkincil tıklama (auxclick: sağ tık / orta tuş) engelleme
  window.addEventListener('auxclick', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true, passive: false });
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('openedTopics_v1');
    } catch {}
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="text-4xl">🦁</div>
            <h2 className="text-xl font-black text-amber-300">Bir Hata Oluştu</h2>
            <p className="text-xs text-slate-300">
              Oyun yüklenirken beklenmeyen bir durum meydana geldi. Yeniden başlatarak devam edebilirsiniz.
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/50 text-left text-xs font-mono text-rose-300 max-h-40 overflow-y-auto whitespace-pre-wrap select-text">
                <div className="font-bold text-rose-400 mb-1">{this.state.error.name}: {this.state.error.message}</div>
                <div className="text-[10px] text-slate-400 opacity-80">{this.state.error.stack}</div>
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg cursor-pointer transition-transform active:scale-95"
            >
              🔄 Yeniden Başlat
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { HizmetSartlariPage } from './pages/HizmetSartlariPage';

// PDF Editörü yalnızca kullanıcı PDF butonuna tıkladığında tembel yüklenir; açıkken ana site tamamen unmount edilir
const LazyPdfEditorApp = React.lazy(() => import('./pdfEditor/PdfEditorApp'));

function checkIsPdfLocation(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path.endsWith('/pdf') ||
    path.endsWith('/pdf-editor') ||
    search.includes('page=pdf') ||
    hash === '#pdf' ||
    hash.includes('pdf-editor')
  );
}

function RootComponent() {
  const [currentPath, setCurrentPath] = React.useState(() => {
    return typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
  });
  const [isPdfMode, setIsPdfMode] = React.useState<boolean>(() => checkIsPdfLocation());

  React.useEffect(() => {
    const handleNavChange = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
      setIsPdfMode(checkIsPdfLocation());
    };
    window.addEventListener('popstate', handleNavChange);
    window.addEventListener('hashchange', handleNavChange);
    return () => {
      window.removeEventListener('popstate', handleNavChange);
      window.removeEventListener('hashchange', handleNavChange);
    };
  }, []);

  const openPdfMode = React.useCallback(() => {
    try {
      document.querySelectorAll('audio, video').forEach((media) => {
        const el = media as HTMLMediaElement;
        if (!el.paused) el.pause();
      });
    } catch {
      // Yoksay
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'pdf');
      window.history.pushState({ pdfMode: true }, '', url.toString());
    } catch {
      // Kısıtlı ortamda state üzerinden açılmaya devam et
    }
    setIsPdfMode(true);
  }, []);

  const closePdfMode = React.useCallback(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('page');
      if (url.hash.toLowerCase().includes('pdf')) {
        url.hash = '';
      }
      window.history.pushState({}, '', url.toString());
    } catch {
      // Yoksay
    }
    setIsPdfMode(false);
  }, []);

  if (isPdfMode) {
    return (
      <React.Suspense
        fallback={
          <div className="h-screen w-screen bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-base">
            PDF Editörü yükleniyor...
          </div>
        }
      >
        <LazyPdfEditorApp onExit={closePdfMode} />
      </React.Suspense>
    );
  }

  const search = typeof window !== 'undefined' ? window.location.search.toLowerCase() : '';
  const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';

  const isHizmetSartlari = 
    currentPath.includes('/hizmet-sartlari') ||
    currentPath.endsWith('hizmet-sartlari.html') ||
    currentPath.endsWith('hizmet-sartlari') ||
    search.includes('page=hizmet-sartlari') ||
    hash.includes('hizmet-sartlari');

  if (isHizmetSartlari) {
    return <HizmetSartlariPage />;
  }

  return <App onOpenPdfEditor={openPdfMode} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RootComponent />
    </ErrorBoundary>
  </StrictMode>,
);
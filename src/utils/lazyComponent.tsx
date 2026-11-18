import React, { lazy, Suspense } from 'react';

/** Oyun/modal yüklenirken görünen küçük, hafif yükleme göstergesi. */
function LoadingSpinner() {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
      role="status"
      aria-label="Yükleniyor"
    >
      <div className="h-12 w-12 rounded-full border-4 border-white/30 border-t-amber-400 animate-spin" />
    </div>
  );
}

/**
 * Bir bileşeni ilk kullanıldığında yükler (code splitting).
 * Kullanım: const SudokuGame = lazyComponent(() => import('./components/SudokuGame'), 'SudokuGame');
 * JSX tarafında hiçbir değişiklik gerekmez; Suspense otomatik sarılır.
 */
export function lazyComponent<M extends Record<string, any>, K extends keyof M>(
  loader: () => Promise<M>,
  name: K
): M[K] {
  const LazyInner = lazy(() =>
    loader().then((m) => ({ default: m[name] as React.ComponentType<any> }))
  );
  const Wrapped = (props: any) => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyInner {...props} />
    </Suspense>
  );
  return Wrapped as unknown as M[K];
}

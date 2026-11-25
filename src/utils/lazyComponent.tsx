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
 * İstenen named export yoksa default export'u dener; ikisi de yoksa
 * React'in belirsiz "lazy element type is invalid" hatası yerine export adlarını bildirir.
 */
export function lazyComponent<M extends Record<string, any>, K extends keyof M>(
  loader: () => Promise<M>,
  name: K
): M[K] {
  const LazyInner = lazy(() =>
    loader().then((module) => {
      const component = module[name] ?? module.default;
      if (!component) {
        const availableExports = Object.keys(module).join(', ') || '(hiçbiri)';
        throw new Error(
          `lazyComponent: "${String(name)}" export'u bulunamadı. Modüldeki export'lar: ${availableExports}`
        );
      }
      return { default: component as React.ComponentType<any> };
    })
  );

  const Wrapped = (props: any) => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyInner {...props} />
    </Suspense>
  );
  return Wrapped as unknown as M[K];
}

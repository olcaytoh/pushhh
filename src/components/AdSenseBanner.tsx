import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>> & {
      requestNonPersonalizedAds?: number;
    };
  }
}

export interface AdSenseBannerProps {
  /** Google AdSense Yayıncı Kimliği (ör. ca-pub-1234567890123456). Boş bırakılırsa VITE_ADSENSE_CLIENT_ID kullanılır. */
  clientId?: string;
  /** Google AdSense Reklam Birimi (Slot) Kimliği. Boş bırakılırsa VITE_ADSENSE_BANNER_SLOT kullanılır. */
  slotId?: string;
  /** Çocuklara yönelik eğitim sitesi olduğu için kişiselleştirilmemiş reklam (NPA) varsayılan olarak açıktır. */
  nonPersonalized?: boolean;
  className?: string;
}

const ADSENSE_SCRIPT_ID = 'google-adsense-script';

function ensureAdSenseScriptLoaded(clientId: string): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(ADSENSE_SCRIPT_ID) ||
    document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
  if (existing) return;

  const script = document.createElement('script');
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  document.head.appendChild(script);
}

/**
 * Web için Google AdSense banner bileşeni (AdMob yalnızca Android/iOS mobil uygulamalarda çalışır;
 * web sitelerinde Google AdSense kullanılır).
 * VITE_ADSENSE_CLIENT_ID ve VITE_ADSENSE_BANNER_SLOT tanımlanmadan ekranda boş alan bırakmaz.
 */
const DEFAULT_ADSENSE_CLIENT_ID = 'ca-pub-5323804686023453';

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  clientId,
  slotId,
  nonPersonalized = true,
  className = '',
}) => {
  const resolvedClient = (
    clientId ||
    import.meta.env.VITE_ADSENSE_CLIENT_ID ||
    DEFAULT_ADSENSE_CLIENT_ID
  ).trim();
  const resolvedSlot = (slotId || import.meta.env.VITE_ADSENSE_BANNER_SLOT || '').trim();
  const pushedRef = useRef(false);

  const isConfigured =
    /^ca-pub-\d{10,20}$/.test(resolvedClient) && /^\d{6,20}$/.test(resolvedSlot);

  useEffect(() => {
    if (!isConfigured || pushedRef.current || typeof window === 'undefined') return;
    ensureAdSenseScriptLoaded(resolvedClient);
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      if (nonPersonalized) {
        window.adsbygoogle.requestNonPersonalizedAds = 1;
      }
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      // AdSense script engelleyici veya erken yükleme durumunda uygulamayı etkileme
    }
  }, [isConfigured, resolvedClient, nonPersonalized]);

  if (!isConfigured) {
    return null;
  }

  return (
    <aside
      aria-label="Sponsorlu İçerik"
      className={`w-full max-w-4xl mx-auto px-3 py-2 flex items-center justify-center ${className}`}
    >
      <ins
        className="adsbygoogle block w-full min-h-[50px] max-h-[100px] overflow-hidden"
        data-ad-client={resolvedClient}
        data-ad-slot={resolvedSlot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </aside>
  );
};

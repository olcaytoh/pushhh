import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Smartphone, Download, Star, 
  Sparkles, CheckCircle2, QrCode, Edit2, Check, ArrowRight
} from 'lucide-react';

interface AndroidAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playMp3?: (src: string) => void;
}

interface AndroidAppItem {
  id: string;
  title: string;
  category: string;
  description: string;
  rating: string;
  downloads: string;
  iconBg: string;
  iconEmoji: string;
  image?: string;
  badge: string;
  playStoreUrl: string;
}

const DEFAULT_PLAY_STORE_DEV_URL = 'https://play.google.com/store/apps/details?id=co.median.android.mbajmzn';

const FEATURED_APPS: AndroidAppItem[] = [
  {
    id: 'matematik_2',
    title: '2. Sınıf Matematik Oyunu',
    category: 'Eğitici • Matematik',
    description: '2. sınıf öğrencileri için müfredat ve kazanım odaklı, çok oyunculu ve yarışmalı interaktif matematik oyunu.',
    rating: '5.0',
    downloads: '1.000+',
    iconBg: 'from-blue-600 via-indigo-600 to-cyan-500',
    iconEmoji: '📐',
    image: '/2snf.webp',
    badge: '1. Uygulama',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=co.median.android.mbajmzn'
  },
  {
    id: 'kronometre',
    title: 'Kronometre & Zamanlayıcı',
    category: 'Araçlar • Sınıf Yönetimi',
    description: 'Sınıf etkinlikleri, ders süreleri, soru çözümleri ve yarışmalar için özel tasarlanmış akıllı kronometre.',
    rating: '5.0',
    downloads: '1.000+',
    iconBg: 'from-amber-500 via-orange-600 to-rose-600',
    iconEmoji: '⏱️',
    image: '/kro.webp',
    badge: '2. Uygulama',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.aistudio.kronometre.zqvxkp'
  },
  {
    id: 'matematik_1',
    title: '1. Sınıf Matematik Oyunu',
    category: 'Eğitici • Matematik',
    description: '1. sınıf öğrencileri için eğlenceli sayma, temel toplama, çıkarma ve interaktif mini matematik oyunları.',
    rating: '5.0',
    downloads: 'Yakında',
    iconBg: 'from-emerald-600 via-green-600 to-teal-500',
    iconEmoji: '🎲',
    image: '/1sbf.webp?v=3',
    badge: '3. Uygulama',
    playStoreUrl: ''
  },
  {
    id: 'ekran_takibi',
    title: 'Ekran Takibi',
    category: 'Araçlar • Zaman & Odak',
    description: 'Öğrenciler ve çocuklar için sağlıklı ekran süresi takibi, dijital denge ve günlük alışkanlık yönetimi uygulaması.',
    rating: '5.0',
    downloads: 'Yakında',
    iconBg: 'from-lime-500 via-teal-600 to-cyan-600',
    iconEmoji: '📱',
    image: '/ekranlogo.jpeg?v=3',
    badge: '4. Uygulama',
    playStoreUrl: ''
  }
];

export const AndroidAppsModal: React.FC<AndroidAppsModalProps> = ({
  isOpen,
  onClose,
  playMp3
}) => {
  const [customStoreUrl, setCustomStoreUrl] = useState<string>(() => {
    return localStorage.getItem('android_playstore_url') || DEFAULT_PLAY_STORE_DEV_URL;
  });
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [tempUrl, setTempUrl] = useState<string>(customStoreUrl);
  const [activeTab, setActiveTab] = useState<'apps' | 'qr'>('apps');
  const [selectedQrAppId, setSelectedQrAppId] = useState<string>('matematik_2');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('android_playstore_url') || DEFAULT_PLAY_STORE_DEV_URL;
      setCustomStoreUrl(saved);
      setTempUrl(saved);
    }
  }, [isOpen]);

  const handleSaveUrl = () => {
    let finalUrl = tempUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    setCustomStoreUrl(finalUrl);
    localStorage.setItem('android_playstore_url', finalUrl);
    setIsEditingUrl(false);
    playMp3?.('/coin.mp3');
  };

  const handleOpenStore = (targetUrl?: string, appTitle?: string) => {
    if (!targetUrl || targetUrl.trim() === '') {
      playMp3?.('/dtt.mp3');
      setToastMessage(`"${appTitle || 'Bu uygulama'}" çok yakında Google Play Store'da!`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    playMp3?.('/op.mp3');
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShowQrForApp = (appId: string) => {
    playMp3?.('/op.mp3');
    setSelectedQrAppId(appId);
    setActiveTab('qr');
  };

  const activeQrApp = FEATURED_APPS.find(a => a.id === selectedQrAppId) || FEATURED_APPS[0];
  const qrTargetUrl = activeQrApp ? activeQrApp.playStoreUrl : customStoreUrl;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#0c182b] via-[#091322] to-[#050b14] rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-emerald-400/90 shadow-[0_0_50px_rgba(16,185,129,0.35)] flex flex-col overflow-hidden my-auto max-h-[92vh]">
        
        {/* ÜST BAŞLIK & HEADER */}
        <div className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-teal-950/90 border-b-2 border-emerald-500/40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-400 border border-emerald-300 flex items-center justify-center text-xl sm:text-2xl shadow-lg shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 fill-current" viewBox="0 0 24 24">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5842 8.3542 13.8437 8 12 8s-3.5842.3542-5.1368.9507L4.841 5.4477a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-lg md:text-xl text-emerald-300 tracking-wide drop-shadow uppercase">
                  Android Uygulamalarım
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shrink-0">
                  Google Play
                </span>
              </div>
              <p className="text-[10.5px] sm:text-xs text-slate-300/90 font-medium">
                Telefon ve tabletler için optimize edilmiş eğitici ilkokul uygulamaları
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                playMp3?.('/op.mp3');
                setActiveTab(activeTab === 'apps' ? 'qr' : 'apps');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
              title="QR Kod İle İndir"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">{activeTab === 'apps' ? 'QR Kod Göster' : 'Uygulamalar'}</span>
            </button>

            <button
              onClick={() => {
                playMp3?.('/op.mp3');
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-600/90 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ANA İÇERİK ALANI */}
        <div className="relative flex-1 p-3 sm:p-5 overflow-y-auto min-h-0 space-y-3 sm:space-y-4">
          
          {/* GOOGLE PLAY BANNER & HIZLI ERİŞİM */}
          <div className="relative w-full rounded-2xl bg-gradient-to-r from-emerald-900/60 via-slate-900/90 to-teal-900/60 p-3 sm:p-4 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 overflow-hidden">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-emerald-400/50 flex items-center justify-center p-2 shadow-inner shrink-0">
                <svg className="w-full h-full" viewBox="0 0 512 512">
                  <path fill="#4285F4" d="M32.5 13.5C21.6 25 15 42.4 15 63.8v384.4c0 21.4 6.6 38.8 17.5 50.3l2.8 2.6L257.6 278.8v-5.6L35.3 10.9l-2.8 2.6z"/>
                  <path fill="#FBBC04" d="M331.4 352.6l-73.8-73.8v-5.6l73.8-73.8 3.5 2 87.3 49.6c24.9 14.2 24.9 37.4 0 51.6l-87.3 49.6-3.5 2.4z"/>
                  <path fill="#EA4335" d="M334.9 350.2L257.6 273 32.5 498.1c8.2 8.7 21.8 9.7 37.1 1.1l265.3-149z"/>
                  <path fill="#34A853" d="M334.9 161.8L69.6 12.8c-15.3-8.6-28.9-7.6-37.1 1.1L257.6 239l77.3-77.2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                  <span>Google Play Geliştirici Mağazası</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                  Tüm oyunlarımızı tek tıkla Android akıllı telefon veya tabletinize yükleyebilirsiniz.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenStore()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Mağazayı Aç</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {toastMessage && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] border-2 border-amber-200 animate-bounce flex items-center gap-2 max-w-[90%] text-center">
              <span className="text-base">⏳</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {activeTab === 'qr' ? (
            /* QR KOD MODU - AKILLI TAHTADAN TELEFONA TARATMA */
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950/70 rounded-2xl border border-emerald-500/30 text-center gap-3.5">
              {/* App Selector Pills - ALL 4 APPS */}
              <div className="flex items-center gap-2 flex-wrap justify-center max-w-full">
                {FEATURED_APPS.map((app, idx) => {
                  const isSelected = selectedQrAppId === app.id;
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        playMp3?.('/op.mp3');
                        setSelectedQrAppId(app.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border ${
                        isSelected 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-105' 
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-500/50'
                      }`}
                    >
                      {app.image ? (
                        <img src={app.image} alt="" className="w-4 h-4 rounded object-cover" />
                      ) : (
                        <span>{app.iconEmoji}</span>
                      )}
                      <span>{idx + 1}. {app.title}</span>
                      {!app.playStoreUrl && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold">Yakında</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {qrTargetUrl ? (
                <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  {/* Dinamik SVG QR Code Görseli */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrTargetUrl)}`}
                    alt="Google Play QR Kodu"
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-slate-900/90 border-2 border-dashed border-amber-500/50 flex flex-col items-center justify-center p-4 text-center gap-2 shadow-inner">
                  {activeQrApp?.image ? (
                    <img src={activeQrApp.image} alt="" className="w-16 h-16 rounded-xl object-cover shadow border border-amber-400/40" />
                  ) : (
                    <span className="text-4xl">{activeQrApp?.iconEmoji}</span>
                  )}
                  <div className="text-xs font-black text-amber-300">Google Play Linki Yakında</div>
                  <div className="text-[10px] text-slate-400">Bu uygulamanın mağaza bağlantısı eklendiğinde QR kod burada aktif olacaktır.</div>
                </div>
              )}

              <div>
                <h4 className="font-black text-sm sm:text-base md:text-lg text-emerald-300 flex items-center justify-center gap-2">
                  {activeQrApp?.image ? (
                    <img src={activeQrApp.image} alt="" className="w-6 h-6 rounded-lg object-cover shadow border border-emerald-400/40" />
                  ) : (
                    <span>{activeQrApp?.iconEmoji}</span>
                  )}
                  <span>{activeQrApp?.title}</span>
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 max-w-md mt-1">
                  {qrTargetUrl 
                    ? 'Telefon veya tablet kameranızla QR kodu taratarak Google Play üzerinden doğrudan cihazınıza yükleyin.'
                    : 'Uygulama Google Play mağazasında hazırlandığında buradan doğrudan taratıp indirebileceksiniz.'}
                </p>
                {qrTargetUrl && (
                  <div className="mt-2 text-[10px] text-emerald-400 font-mono break-all max-w-md mx-auto px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
                    {qrTargetUrl}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                {qrTargetUrl ? (
                  <button
                    onClick={() => handleOpenStore(qrTargetUrl, activeQrApp?.title)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mağazada Aç</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenStore('', activeQrApp?.title)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Çok Yakında</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('apps')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  ← Uygulama Listesine Dön
                </button>
              </div>
            </div>
          ) : (
            /* UYGULAMA LİSTESİ */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
              {FEATURED_APPS.map((app) => (
                <div 
                  key={app.id}
                  className="group relative bg-[#101c2e]/90 hover:bg-[#14233a] border-2 border-slate-700/80 hover:border-emerald-400/80 rounded-2xl p-3 sm:p-3.5 transition-all shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start gap-3">
                    {/* APP GÖRSEL BUTONU (TIKLANINCA GOOGLE PLAY AÇILIR VEYA BİLGİ VERİR) */}
                    <button
                      onClick={() => handleOpenStore(app.playStoreUrl, app.title)}
                      className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl overflow-hidden border-2 border-emerald-400/60 shadow-lg shrink-0 group-hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center bg-slate-900 group/imgbtn hover:border-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      title={`${app.title} - ${app.playStoreUrl ? "Google Play'de Yükle" : 'Çok Yakında'}`}
                    >
                      {app.image ? (
                        <img 
                          src={app.image} 
                          alt={app.title} 
                          className="w-full h-full object-cover rounded-xl transition-transform group-hover/imgbtn:scale-110" 
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${app.iconBg} flex items-center justify-center text-2xl sm:text-3xl`}>
                          {app.iconEmoji}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/imgbtn:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-emerald-300 drop-shadow" />
                      </div>
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                          {app.category}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded-md border text-[9px] font-black uppercase ${
                          app.playStoreUrl 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {app.badge}
                        </span>
                      </div>
                      
                      <h4 className="font-black text-xs sm:text-sm text-slate-100 group-hover:text-emerald-300 transition-colors leading-tight">
                        {app.title}
                      </h4>
                      
                      <p className="text-[10.5px] sm:text-xs text-slate-400 line-clamp-2 mt-1 leading-snug">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-semibold">
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{app.rating}</span>
                      </span>
                      <span>•</span>
                      <span>{app.downloads === 'Yakında' ? 'Çok Yakında' : `${app.downloads} İndirme`}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleShowQrForApp(app.id)}
                        className="px-2 py-1 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white font-bold text-[11px] sm:text-xs border border-emerald-500/30 flex items-center gap-1 transition-all cursor-pointer"
                        title="QR Kod İle Gör"
                      >
                        <QrCode className="w-3 h-3" />
                        <span className="hidden xs:inline">QR</span>
                      </button>

                      {app.playStoreUrl ? (
                        <button
                          onClick={() => handleOpenStore(app.playStoreUrl, app.title)}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] sm:text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          {app.image && (
                            <img src={app.image} alt="" className="w-3.5 h-3.5 rounded object-cover border border-slate-950/30" />
                          )}
                          <span>Google Play</span>
                          <Download className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenStore('', app.title)}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black text-[11px] sm:text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          {app.image && (
                            <img src={app.image} alt="" className="w-3.5 h-3.5 rounded object-cover border border-amber-400/40" />
                          )}
                          <span>Çok Yakında</span>
                          <Sparkles className="w-3 h-3 text-amber-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ÖĞRETMEN / GELİŞTİRİCİ ÖZEL PLAY STORE LİNK AYARI */}
          <div className="p-2.5 sm:p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400 min-w-0">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                {isEditingUrl ? 'Google Play / Mağaza Linkini Girin:' : `Mağaza Linki: ${customStoreUrl}`}
              </span>
            </div>

            {isEditingUrl ? (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://play.google.com/store/apps/..."
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-500/60 text-white text-xs w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  onClick={handleSaveUrl}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  title="Kaydet"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingUrl(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="İptal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempUrl(customStoreUrl);
                  setIsEditingUrl(true);
                }}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer shrink-0"
              >
                <Edit2 className="w-3 h-3" />
                <span>Linki Düzenle</span>
              </button>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-3 sm:px-6 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[10.5px] sm:text-xs text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tüm Android cihazlarla (Telefon, Tablet, Akıllı Tahta) uyumludur</span>
          </div>

          <button
            onClick={() => {
              playMp3?.('/op.mp3');
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudUpload, 
  CloudDownload, 
  LogOut, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Users, 
  BarChart3,
  Sparkles
} from 'lucide-react';
import { User } from '../firebase';
import { 
  signInWithGoogle, 
  signOutUser, 
  formatFriendlyDate 
} from '../services/cloudSyncService';
import { Student } from '../types/student';
import { ClassCountersData } from '../utils/counterStorage';

export interface GoogleAuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  students: Student[];
  counters?: ClassCountersData;
  countersData?: ClassCountersData;
  lastSyncedAt: string | null;
  onManualSyncUp: () => Promise<void>;
  onManualSyncDown: () => Promise<void>;
  onSignIn?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  isSyncing?: boolean;
  playMp3?: (src: string) => void;
}

export const GoogleAuthSyncModal: React.FC<GoogleAuthSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  students,
  counters,
  countersData,
  lastSyncedAt,
  onManualSyncUp,
  onManualSyncDown,
  onSignIn,
  onSignOut,
  isSyncing,
  playMp3
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!isOpen) return null;

  const currentCounters = countersData || counters || {
    visits: { total: 0, today: 0, lastDate: '' },
    clicks: {},
    questions: {
      grade1: { correct: 0, wrong: 0 },
      grade2: { correct: 0, wrong: 0 },
      grade3: { correct: 0, wrong: 0 },
      grade4: { correct: 0, wrong: 0 },
      otherGames: { correct: 0, wrong: 0 },
      englishGames: { correct: 0, wrong: 0 }
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setActionMessage(null);
    playMp3?.('/op.mp3');
    try {
      if (onSignIn) {
        await onSignIn();
      } else {
        await signInWithGoogle();
      }
      playMp3?.('/coin.mp3');
      setActionMessage({
        text: 'Google ile başarıyla giriş yapıldı! Verileriniz buluta eşitlendi.',
        type: 'success'
      });
    } catch (err: any) {
      setActionMessage({
        text: err.message || 'Giriş yapılamadı. Lütfen tekrar deneyin.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!confirmSignOut) {
      setConfirmSignOut(true);
      return;
    }
    setIsLoading(true);
    setActionMessage(null);
    setConfirmSignOut(false);
    playMp3?.('/op.mp3');
    try {
      if (onSignOut) {
        await onSignOut();
      } else {
        await signOutUser();
      }
      setActionMessage({
        text: 'Başarıyla çıkış yapıldı. Verileriniz bu cihazın hafızasında saklanmaya devam ediyor.',
        type: 'info'
      });
    } catch (err: any) {
      setActionMessage({
        text: 'Çıkış yapılırken bir hata oluştu.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    setIsLoading(true);
    setActionMessage(null);
    playMp3?.('/op.mp3');
    try {
      await onManualSyncUp();
      playMp3?.('/coin.mp3');
      setActionMessage({
        text: 'Öğrenci listeniz ve istatistikleriniz başarıyla buluta yedeklendi!',
        type: 'success'
      });
    } catch (err: any) {
      setActionMessage({
        text: 'Buluta yedekleme başarısız oldu: ' + (err?.message || 'Bilinmeyen hata'),
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    setActionMessage(null);
    playMp3?.('/op.mp3');
    try {
      await onManualSyncDown();
      playMp3?.('/coin.mp3');
      setActionMessage({
        text: 'Buluttaki veriler başarıyla bu cihaza aktarıldı!',
        type: 'success'
      });
    } catch (err: any) {
      setActionMessage({
        text: 'Buluttan veri çekilemedi: ' + (err?.message || 'Bilinmeyen hata'),
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const q = currentCounters?.questions;
  const totalQuestionsSolved = q
    ? (q.grade1?.correct || 0) + (q.grade1?.wrong || 0) +
      (q.grade2?.correct || 0) + (q.grade2?.wrong || 0) +
      (q.grade3?.correct || 0) + (q.grade3?.wrong || 0) +
      (q.grade4?.correct || 0) + (q.grade4?.wrong || 0) +
      (q.otherGames?.correct || 0) + (q.otherGames?.wrong || 0) +
      (q.englishGames?.correct || 0) + (q.englishGames?.wrong || 0)
    : 0;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0d1627] border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/40 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              Google Bulut Senkronizasyonu
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                İsteğe Bağlı
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Öğrenci listeniz ve istatistiklerinize her cihazdan ulaşın
            </p>
          </div>
        </div>

        {/* Status Notification Alert */}
        {actionMessage && (
          <div className={`mb-4 p-3 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm border ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200' 
              : actionMessage.type === 'error'
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              : 'bg-blue-950/50 border-blue-500/40 text-blue-200'
          }`}>
            {actionMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />}
            {actionMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />}
            {actionMessage.type === 'info' && <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {currentUser ? (
          /* LOGGED IN USER VIEW */
          <div className="space-y-4">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-3.5">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'Kullanıcı'} 
                  className="w-13 h-13 rounded-full border-2 border-emerald-400/80 object-cover shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-black text-white border-2 border-emerald-400/80">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'Ö'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {currentUser.displayName || 'Öğretmen'}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Bağlı
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {currentUser.email}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <CloudCheck className="w-3 h-3 text-cyan-400" />
                  Son Senkron: {formatFriendlyDate(lastSyncedAt)}
                </p>
              </div>
            </div>

            {/* Current Sync Stats Bento */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#131f38] border border-slate-700/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-amber-300">
                    {students.length}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                    Kayıtlı Öğrenci
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#131f38] border border-slate-700/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-blue-300">
                    {totalQuestionsSolved}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                    Çözülen Soru
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-cyan-500/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <CloudUpload className="w-4 h-4" />
                  Şimdi Buluta Yedekle
                </button>

                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs sm:text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <CloudDownload className="w-4 h-4" />
                  Buluttan Verileri Çek
                </button>
              </div>

              {confirmSignOut ? (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200">
                  <span className="text-[11px] font-semibold">Çıkış yapmak istediğinize emin misiniz?</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Evet, Çık
                    </button>
                    <button
                      onClick={() => setConfirmSignOut(false)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-transparent hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 text-rose-300/80 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Google Hesabından Çıkış Yap
                </button>
              )}
            </div>
          </div>
        ) : (
          /* LOGGED OUT VIEW */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#101b33] to-slate-900 border border-blue-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                Neden Google ile Giriş Yapmalıyım?
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Her Yerden Erişim:</strong> Akıllı tahtada, evdeki bilgisayarda veya telefonunuzda aynı öğrenci listesini kullanın.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Kayıp Riski Yok:</strong> Tarayıcı çerezleri silinse bile verileriniz güvenle bulutta saklanır.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>İsteğe Bağlı:</strong> Giriş yapmadan da tüm oyunları ve özellikleri tarayıcınızda kullanabilirsiniz.</span>
                </li>
              </ul>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
              ) : (
                /* Google G Icon SVG */
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isLoading ? 'Giriş Yapılıyor...' : 'Google ile Giriş Yap'}</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Kişisel verileriniz ve öğrenci listeleriniz sadece sizin Google hesabınıza özel olarak şifreli saklanır.
          </p>
        </div>
      </div>
    </div>
  );
};

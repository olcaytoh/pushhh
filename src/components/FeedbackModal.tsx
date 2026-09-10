import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGrade: number | null;
  currentTopicTitle: string;
  playerCount?: 1 | 2 | 3;
  playMp3?: (src: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentGrade,
  currentTopicTitle,
  playerCount = 1,
  playMp3,
}) => {
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const targetEmail = 'olcaytoh@gmail.com';
  const gradeLabel = currentGrade ? `${currentGrade}. Sınıf` : 'Genel / Menü';
  const topicLabel = currentTopicTitle || 'Menü Ekranı';
  const playerCountLabel = `${playerCount} Kişilik Mod`;
  const emailSubject = `[İlkokul Matematik Geri Bildirim] ${gradeLabel} - ${topicLabel} (${playerCountLabel})`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Lütfen hata veya geri bildirim açıklamasını yazınız.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          'Gönderen Adı': senderName.trim() || 'İsimsiz',
          'Sınıf': gradeLabel,
          'Etkinlik Başlığı': topicLabel,
          'Kişi Sayısı / Mod': playerCountLabel,
          'Geri Bildirim Açıklaması': message.trim(),
          _subject: emailSubject,
          _template: 'table',
        }),
      });

      const data = await response.json();
      if (response.ok || data.success === 'true' || data.success === true) {
        if (playMp3) playMp3('/correct.mp3');
        setStatus('success');
      } else {
        throw new Error(data.message || 'Gönderim sırasında bir sorun oluştu.');
      }
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      setStatus('error');
      setErrorMessage(
        'İletim sırasında internet bağlantısı kaynaklı bir sorun oluştu. Lütfen tekrar deneyiniz.'
      );
    }
  };

  const handleClose = () => {
    if (playMp3) playMp3('/op.mp3');
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#0d1526] border-2 border-amber-400/90 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* MODAL HEADER - GOLD FRAME */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-b-2 border-amber-400/80">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/60 flex items-center justify-center text-amber-400 shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider drop-shadow-xs">
                Hata ve Geri Bildirim
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-300/90 font-medium">
                Alıcı: <span className="underline font-bold">{targetEmail}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Kapat"
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4">
          {status === 'success' ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Geri Bildiriminiz İletildi!</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Hata / öneri mesajınız doğrudan <span className="text-amber-300 font-semibold">{targetEmail}</span> adresine ulaştırıldı. Uygulamayı geliştirmemize yardımcı olduğunuz için teşekkür ederiz!
              </p>
              <button
                onClick={handleClose}
                className="mt-2 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Tamam
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* OTOMATİK KONU & SINIF BİLGİ KUTUSU */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#131f38] border border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  <span>📌 Otomatik Eklenen Etkinlik Bilgisi</span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                      {gradeLabel}
                    </span>
                    <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400/40">
                      {playerCountLabel}
                    </span>
                  </div>
                </div>
                <div className="text-white font-semibold flex items-center gap-1.5 truncate">
                  <span className="text-slate-400 text-xs">Etkinlik:</span>
                  <span className="truncate text-amber-100">{topicLabel}</span>
                </div>
              </div>

              {/* İSİM ALANI */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Adınız / Rumuzunuz <span className="text-slate-400 font-normal">(İsteğe Bağlı)</span>
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  placeholder="Örn: Ahmet Öğretmen, Ali, Zeynep..."
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0f1d] border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-hidden transition-all"
                />
              </div>

              {/* MESAJ / HATA AÇIKLAMASI */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Hata Açıklaması veya Öneriniz <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => {
                    setMessage(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Karşılaştığınız hatayı, soruyu veya önerinizi kısaca buraya yazınız..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0f1d] border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-hidden transition-all resize-none"
                />
              </div>

              {/* HATA UYARISI */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-600/70 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* GÖNDER BUTONU */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>İletiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Direkt Gönder (Mail At)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

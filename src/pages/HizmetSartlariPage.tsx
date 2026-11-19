import React from 'react';
import { ArrowLeft, Shield, FileText, Mail, Calendar, Sparkles } from 'lucide-react';

export const HizmetSartlariPage: React.FC = () => {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#0d1527]/90 backdrop-blur-md border-b border-indigo-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white text-xs font-bold border border-indigo-500/30 transition cursor-pointer active:scale-95"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft size={16} />
            <span>Ana Sayfaya Dön</span>
          </button>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span className="font-black text-sm sm:text-base text-white tracking-wide">
              Olcico Eğitim Platformu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Shield size={14} className="text-emerald-400" />
          <span className="hidden sm:inline">Resmi Kullanım Koşulları</span>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-b from-[#121c36] to-[#0a0f1d] border-b border-indigo-500/15 py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider mb-2">
              <FileText size={13} />
              <span>Yasal Bilgilendirme</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Hizmet Şartları / Kullanım Koşulları
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Olcico İlkokul Matematik ve Türkçe İnteraktif Eğitim Platformu kullanımına ilişkin hak, yükümlülük ve kurallar.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 px-3.5 py-2 rounded-2xl text-xs text-slate-300 shrink-0 self-start sm:self-auto">
            <Calendar size={15} className="text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Son Güncelleme</span>
              <span className="font-bold text-white">5 Kasım 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN DOCUMENT BODY */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="bg-[#0f172a]/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 text-sm sm:text-base leading-relaxed text-slate-300">
          
          {/* INTRO CALLOUT */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <Sparkles size={20} className="text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Lütfen uygulamamızı kullanmadan önce işbu Hizmet Şartları&apos;nı dikkatlice okuyunuz. Uygulamamızı indirerek veya web tarayıcısı üzerinden kullanarak, bu şartların tümüyle ve çekincesiz olarak kabul etmiş olursunuz. Şartları kabul etmiyorsanız, lütfen uygulamayı kullanmayınız.
            </p>
          </div>

          {/* SECTION 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center text-xs font-black">1</span>
              <span>Taraflar ve Kapsam</span>
            </h2>
            <p>
              İşbu Hizmet Şartları, uygulamayı geliştiren bağımsız geliştirici (<strong className="text-white">&quot;Biz&quot;, &quot;Geliştirici&quot;</strong>) ile uygulamayı mobil cihazına indirerek veya web platformu üzerinden kullanan son kullanıcı (<strong className="text-white">&quot;Kullanıcı&quot;, &quot;Siz&quot;</strong>) arasındaki hukuki koşulları düzenler. Bu şartlar, uygulamanın kullanımıyla ilgili hak ve yükümlülüklerinizi belirler.
            </p>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center text-xs font-black">2</span>
              <span>Lisans ve Kullanım Hakları</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                Geliştirici, kullanıcılara uygulamayı kişisel, ticari olmayan veya sunulan kapsam dahilindeki amaçlarla (ilkokul düzeyinde sınıf içi eğitim, akıllı tahta etkinlikleri, eğlenceli matematik ve Türkçe alıştırmaları vb.) kullanmaları için münhasır olmayan, devredilemez ve sınırlı bir lisans verir.
              </li>
              <li>
                Uygulamanın kaynak kodlarını tersine mühendislik (<em className="text-slate-200">reverse engineering</em>) yapmamayı, kopyalamamayı, değiştirmemeyi veya izinsiz dağıtmamayı kabul edersiniz.
              </li>
            </ul>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center text-xs font-black">3</span>
              <span>Gizlilik ve Veri Koruma</span>
            </h2>
            <p>
              Uygulama üzerinden toplanan kişisel verileriniz (varsa hesap bilgileri, sınıf listeleri, kullanım ve başarı istatistikleri vb.), yürürlükteki yasalara ve Gizlilik Politikamıza uygun olarak işlenir ve saklanır. Sınıf verileri öğretmenlerin ve öğrencilerin eğitimini kolaylaştırmak amacıyla güvenli şekilde tutulmaktadır.
            </p>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center text-xs font-black">4</span>
              <span>Uygulama İçi Satın Alma ve Ödemeler</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                Uygulama içerisinde ilerleyen süreçte sunulabilecek olan dijital ürünler, abonelikler veya reklam kaldırma gibi uygulama içi satın almalar Google Play Ödeme Sistemi altyapısı üzerinden gerçekleştirilir.
              </li>
              <li>
                Fiyatlandırma, iade ve iptal koşulları Google Play&apos;in güncel politika ve kurallarına tabidir.
              </li>
            </ul>
          </section>

          {/* SECTION 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center text-xs font-black">5</span>
              <span>Sorumluluk Sınırlaması</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                Uygulama &quot;olduğu gibi&quot; ve &quot;mevcut olduğu sürece&quot; sunulur. Geliştirici, uygulamanın kesintisiz, hatasız veya tamamen güvenli olacağını garanti etmez.
              </li>
              <li>
                Uygulamanın kullanımından doğabilecek doğrudan veya dolaylı veri kaybı, cihaz arızası veya benzeri zararlardan geliştirici sorumlu tutulamaz.
              </li>
            </ul>
          </section>

          {/* SECTION 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center text-xs font-black">6</span>
              <span>Şartlarda Değişiklikler</span>
            </h2>
            <p>
              Geliştirici, işbu Hizmet Şartları&apos;nı dilediği zaman değiştirme hakkını saklı tutar. Yapılan güncellemeler uygulama içinde veya web sitemizde yayınlandığı tarihte yürürlüğe girer. Güncellemelerden haberdar olmak için şartları periyodik olarak incelemeniz tavsiye edilir.
            </p>
          </section>

          {/* SECTION 7 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center text-xs font-black">7</span>
              <span>İletişim</span>
            </h2>
            <p>
              İşbu sözleşme ile ilgili her türlü soru, öneri ve geri bildiriminiz için bizimle aşağıdaki e-posta adresinden iletişime geçebilirsiniz:
            </p>
            <div className="mt-3 p-4 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold">Resmi İletişim E-Postası</span>
                <a
                  href="mailto:olcaytoh@gmail.com"
                  className="font-black text-amber-400 hover:text-amber-300 transition text-sm sm:text-base underline underline-offset-2"
                >
                  olcaytoh@gmail.com
                </a>
              </div>
            </div>
          </section>

        </div>

        {/* BOTTOM BACK BUTTON */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm shadow-lg border border-indigo-300 flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Ana Uygulamaya / Oyuna Dön</span>
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070b16] py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Olcico Eğitim Platformu. Tüm hakları saklıdır.</p>
        <p className="mt-1">
          <a href="/hizmet-sartlari" className="text-slate-400 hover:text-indigo-400 underline">
            olcico.com.tr/hizmet-sartlari
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HizmetSartlariPage;

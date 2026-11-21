# Doğal Türkçe & İngilizce Statik Ses Paketi (public/sesler)

Bu klasördeki tüm MP3 dosyaları Microsoft Edge Neural (Kadın Öğretmen: Emel, Erkek Öğretmen: Ahmet; İngilizce: Jenny & Guy) sesleriyle önceden üretilmiştir.
Bu sayede proje GitHub Pages, Netlify, Vercel gibi sunucusuz (statik) web sitelerinde yayınlandığında dahi `/api/tts` sunucusuna ihtiyaç duymadan tüm harf, hece, kelime ve cümleler doğal Türkçe öğretmen sesiyle anında çalar.

## Klasör Yapısı
- `public/sesler/manifest.json` -> Tüm ses eşleştirme haritası (UTF-8 anahtar -> ASCII güvenli MP3 yolu)
- `public/sesler/tr/kadin/*.mp3` -> Türkçe Kadın Öğretmen (Emel) sesleri
- `public/sesler/tr/erkek/*.mp3` -> Türkçe Erkek Öğretmen (Ahmet) sesleri
- `public/sesler/en/kadin/*.mp3` & `en/erkek/*.mp3` -> İngilizce etkinlik sesleri

## Özel Öğretmen Kaydı Eklemek İsterseniz
Herhangi bir hece/kelimeyi kendi sesinizle değiştirmek için örneğin `public/sesler/tr/kalem.mp3` dosyasını koyup `manifest.json` içine `"tr/kalem": "/sesler/tr/kalem.mp3"` eklemeniz yeterlidir (özel kayıt her zaman önceliklidir).

## Yeni Kelimeler Ekledikten Sonra Paketi Güncelleme
Proje klasöründe şu komutu çalıştırmanız yeterlidir (sadece eksik olan yeni sesleri üretir, mevcutları atlar):

    npx tsx scripts/generate-static-tts.ts

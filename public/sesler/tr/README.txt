Özel Öğretmen Ses Kayıtları Klasörü (Hibrit MP3/WAV Desteği)
==============================================================
Bu klasöre herhangi bir hece, harf veya kelimenin kendi kaydettiğiniz
.mp3 veya .wav dosyasını küçük harfle ekleyebilirsiniz.

Örnekler:
  public/sesler/tr/el.mp3
  public/sesler/tr/on.mp3
  public/sesler/tr/lale.mp3
  public/sesler/tr/anne.mp3

Sunucu çalışırken bu klasördeki dosyalar otomatik olarak yapay zeka sesinin
önüne geçer ve 0 gecikme ile çalar. Statik yayın (GitHub Pages vb.) için
dosya adını public/sesler/manifest.json içine şu biçimde ekleyebilirsiniz:
  { "tr/el": "/sesler/tr/el.mp3", "tr/on": "/sesler/tr/on.mp3" }

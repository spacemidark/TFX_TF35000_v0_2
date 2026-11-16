# TFX — TF35000 | V0.2.0 — Content Studio

**Uygulama adı: TFX** · **Created by Emine Yasan** · **Motor: TF35000**

Yeni sürümde uygulama içinden komponent, teknik makale ve görsel düzenlenebilir.

**Başlamak için önce `docs/TFX_V0_2_KULLANIM_REHBERI_TR.md` dosyasını oku.**

# TFX — TF35000 | Interactive Engineering Encyclopedia

**Sürüm:** 0.1.0 (konsept / geliştirme taslağı)

React + TypeScript + Three.js + Electron ile hazırlanmış, TF35000 için özelleştirilebilir bir masaüstü mühendislik ansiklopedisi prototipidir.

> **Önemli:** Bu paket, erişilebilir **Inside the Jet Engine V1.4 kaynak kodu** temel alınarak yeniden düzenlenmiştir. V5 kaynak kodunun tamamı erişilebilir olmadığı için **V5'in birebir dönüştürülmüş hali değildir**. V5 dokümanındaki LPC gizleme yaklaşımı uygulanmıştır. Motor kesitleri, 3D geometri, katalog yapısı ve mevcut genel mühendislik metinleri TF35000'e ait doğrulanmış üretici verileri değildir.

## Yapılanlar

- Uygulama markası **TFX**, motor adı **TF35000**.
- Koyu siyah / turkuaz arayüz; düzenlenebilir renk dosyası: `src/styles/tfx-theme.css`.
- Eski prototip görselleri **aynen korundu**; kolay değiştirme: `src/data/assetMap.json`.
- 140 düğümlü genel turbofan katalog yapısı korunarak **TF35000 içerik taslağı** olarak sunuldu; V5'teki gibi LPC görünümden gizlendi.
- Ana motor tanıtım sayfası TF35000 için kaynak eklemeye uygun boş taslak haline getirildi.
- Kompresör 3D görünümünde eski temsili Three.js modeli korunuyor; `.glb` eklemek için isteğe bağlı ayar hazırlandı.
- Windows Electron EXE paketleme dosyaları ve Türkçe düzenleme rehberi eklendi.

## Windows'ta başlatma

1. ZIP dosyasını bir klasöre çıkart.
2. VS Code ile `package.json` dosyasının olduğu klasörü aç.
3. Node.js LTS kurulu olduğundan emin ol.
4. Terminalde `npm.cmd install` çalıştır (ilk kez internet erişimi gerekebilir).
5. Tarayıcıda geliştirme: `npm.cmd run dev`.
6. Electron masaüstü geliştirme: `npm.cmd run desktop:dev`.
7. EXE hazırlama: `CREATE_EXE_WINDOWS.bat` (Windows'ta). Başarılıysa `release/` klasörünü kontrol et.

**Bu ZIP hazır bir EXE içermez.** Burada Windows EXE oluşturma işlemi çalıştırılıp doğrulanmadı.

## Kendin düzenlemek için

| İstediğin değişiklik | Dosya |
| --- | --- |
| TFX veya TF35000 adını değiştirmek | `src/data/projectConfig.json` |
| Renkleri değiştirmek | `src/styles/tfx-theme.css` |
| Motor/komponent görsellerini değiştirmek | `public/images/` + `src/data/assetMap.json` |
| Teknik makaleleri düzenlemek | `content/<komponent-id>/<bolum-id>.tr.mdx` |
| Sistem/komponent eklemek | `src/data/catalog.json` |
| 3D kompresör modelini değiştirmek | `public/models/` + `src/data/projectConfig.json` |
| Uygulama ikonu | `desktop-assets/icon.ico` ve `public/images/app-icon.png` |
| Menü ve ekranlar | `src/App.tsx`, `src/components/` |

**Adım adım ayrıntılı rehber:** [`docs/TFX_GELISTIRME_REHBERI_TR.md`](docs/TFX_GELISTIRME_REHBERI_TR.md)

## Güvenlik ve kaynak notu

Bu proje bir öğrenme ve arayüz prototipidir. Gerçek motorun tasarımına ilişkin gizli, kısıtlı veya doğrulanmamış verileri uygulamaya eklemeyin. Görsel ve teknik kaynakların yayın haklarını kontrol edin. `docs/GORSEL_KAYNAKLARI.csv` kaydını güncel tutun.

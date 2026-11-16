# TFX — TF35000 | V0.2.0 İçerik Yönetimi Rehberi

**Uygulama adı:** TFX  
**Uygulama alt yazısı:** Created by Emine Yasan  
**Motor:** TF35000  
**Arayüz:** siyah + turkuaz  
**Sürüm:** 0.2.0

Bu sürüm, önceki TFX v0.1.0 projesinden geliştirilmiştir. Eski temsili motor ve komponent görselleri paket içinde aynen bırakılmıştır. Bunlar TF35000'e ait doğrulanmış OEM görselleri veya tasarım verileri değildir.

## 1. Uygulamayı açmak

1. ZIP dosyasını klasöre tamamen çıkar.
2. VS Code'da `package.json` dosyasının bulunduğu klasörü aç.
3. VS Code > Terminal > New Terminal.
4. İlk kurulumda:

```cmd
npm.cmd install
```

5. Tarayıcıda test için:

```cmd
npm.cmd run dev
```

6. Electron masaüstü penceresinde test için:

```cmd
npm.cmd run desktop:dev
```

> İlk bağımlılık kurulumu internet gerektirebilir. Kurumsal bilgisayarda BT izinlerine uy. Kurulu EXE'nin yerel içerikleri çevrimdışı çalışabilir.

## 2. Yeni içerik düzenleme ekranı nerede?

Üst menüde **⌘ İçerik Yönetimi** butonuna tıkla. Dört sekme açılır:

- **Komponentler:** Komponent adını, kodunu, açıklamasını ve durumunu değiştir; yeni komponent oluştur.
- **Teknik içerik:** Genel bakış, malzemeler, üretim, mekanik yükler vb. başlıklara teknik metin ekle.
- **Görseller:** Motor kesiti, HPC, fan, diğer mevcut görseller veya seçilen komponent için yeni görsel yükle.
- **Yedekleme:** Eklediğin bilgileri JSON dosyasına aktar veya yedekten geri yükle.

## 3. Yeni komponent nasıl eklenir?

1. **İçerik Yönetimi → Komponentler → + Yeni komponent**.
2. Türkçe ve İngilizce komponent adını yaz.
3. **Bağlanacağı üst sistem** listesinden uygun sistemi seç (örneğin HPC).
4. **Komponenti oluştur** butonuna bas.
5. Yeni komponent sol taraftaki hiyerarşiye ve aramaya eklenir.
6. Teknik içerik sekmesine geçerek bölüm metinlerini yaz.

Yeni komponent için varsayılan olarak 9 mühendislik bölümü oluşturulur (genel bakış, çalışma prensibi, geometri, malzemeler, mekanik, üretim, montaj, hasar, muayene). Bunlar başlangıç şablonlarıdır.

## 4. Stator vane malzeme bilgisi nasıl değiştirilir?

1. Sol menüden **Stator Vane** komponentini aç.
2. Üstteki **İçerik Yönetimi** butonuna bas.
3. **Teknik içerik** sekmesine gir.
4. Bölüm olarak **Malzemeler ve kaplamalar** seç.
5. Türkçe veya İngilizce dilini seç.
6. Teknik açıklamanı yaz. Örnek biçim:

```markdown
# Malzemeler ve kaplamalar

## Malzeme seçimi

Buraya doğrulanmış teknik bilgilerini yaz.

- Malzeme özelliği 1
- Malzeme özelliği 2

**Kaynak:** Kaynak bilgisi buraya.
```

7. **Değişiklikleri kaydet** butonuna bas.
8. Editörü kapatıp teknik bölüm sayfasını aç; metnin hemen görünür.

Bu metinler Markdown olarak güvenli biçimde gösterilir. Kullanıcının yazdığı HTML veya MDX kodu çalıştırılmaz. Boş bırakılan bölümde eski paket MDX metni gösterilir.

## 5. Motor görseli nasıl değiştirilir?

1. **İçerik Yönetimi → Görseller**.
2. Görsel alanından **Motor kesit görseli** seç.
3. **Görsel seç** butonuyla bilgisayarından PNG, JPG veya WebP yükle.
4. **Değişiklikleri kaydet** butonuna bas.
5. Ana sayfada yeni motor görselin görünür.

**Seçili komponentin teknik görseli** alanına eklediğin resim, o komponentin teknik bilgi sayfasında görünür. Mevcut eski görsel dosyaları silinmez. Dosya başına en fazla **5 MB** kabul edilir. SVG desteklenmez. Görsellerin kullanım hakkını kontrol et.

> Windows uygulama ikonu (EXE ikonu) bu panelden değişmez; bunun için `desktop-assets/icon.ico` ve yeniden EXE paketleme gerekir.

## 6. Değişiklikleri kaydettikten sonra EXE'yi yeniden oluşturmalı mıyım?

**Hayır.** Bu sürümde İçerik Yönetimi ekranından kaydedilen yeni komponentler, teknik metinler ve görseller **IndexedDB** adlı yerel uygulama veritabanında tutulur. Uygulamayı kapatıp yeniden açınca içerik aynı bilgisayarda kalır. İnternet gerekmez.

Ancak şu durumlarda yeniden EXE üretmelisin:

- React/TypeScript kodunu değiştirirsen;
- CSS renklerini veya uygulama düzenini değiştirirsen;
- Windows uygulama adını veya ikonunu paketleme ayarlarından değiştirirsen;
- Kaynak dosyalardaki `content/*.mdx`, `src/data/*.json` veya `public/images/` içeriklerini **doğrudan VS Code ile** değiştirirsen.

**İçerik Yönetimi ile yaptığın değişiklikler proje kaynak dosyalarını değiştirmez.** Yerel kullanıcı verisi olarak saklanır. Bu ayrım özellikle GitHub'a kaynak kod yüklerken önemlidir: kendi eklediğin içerikler GitHub'a otomatik gitmez.

## 7. Başka bilgisayara nasıl taşıyacağım?

1. Eski bilgisayarda **İçerik Yönetimi → Yedekleme → TFX içerik yedeğini indir**.
2. Oluşan `TFX-content-backup-YYYY-MM-DD.json` dosyasını güvenli bir yere koy.
3. Yeni bilgisayarda TFX'i kur/aç.
4. **İçerik Yönetimi → Yedekleme → JSON yedeğini yükle**.
5. Bilgilerin ve görsellerin yeni bilgisayara aktarılır.

**Önemli:** Tarayıcıdaki `npm run dev` sürümü ile Electron masaüstü EXE'si farklı veri depoları kullanır. Aralarında taşımak için de aynı yedekleme adımlarını uygula. Windows'ta uygulama verilerini veya tarayıcı site verilerini silmek yerel içeriği silebilir. Düzenli yedek al.

## 8. Kod değişiklikleri için yeni EXE nasıl oluşturulur?

VS Code terminalinde:

```cmd
npm.cmd run build
npm.cmd run desktop:dist
```

İkinci komut da derleme yapar. Alternatif olarak `CREATE_EXE_WINDOWS.bat` dosyasına çift tıklayabilirsin. Windows ortamında başarılı paketleme sonrası `release/` klasöründe kurulum/portable dosyaları oluşabilir. **Bu ZIP dosyasında hazır Windows EXE bulunmuyor.**

## 9. Uygulama adı ve yazı nerede?

- Sol üst marka: `src/App.tsx` içindeki `Sidebar` bileşeni.
- Marka değeri: `src/data/projectConfig.json` → `appName: "TFX"`.
- Alt yazı: `Created by Emine Yasan` (Sidebar içinde).
- Motor adı: `projectConfig.json` → `engineName: "TF35000"`.
- Windows EXE ürün adı: `package.json` → `productName: "TFX"` ve `build.productName`.
- Electron pencere başlığı: `electron/main.cjs` → `title: 'TFX'`.
- Renkler: `src/styles/tfx-theme.css` ve yeni `src/styles/content-studio.css`.

## 10. Teknik sınırlar

- Uygulama hâlâ genel turbofan mühendislik taslağıdır. TF35000'e özgü detaylar ayrıca doğrulanmalıdır.
- Üreticiye ait CAD/görsel/telifli teknik dokümanları izin ve şirket politikalarını kontrol etmeden paylaşma.
- İçerik düzenleme paneli, bireysel ve yerel kullanım içindir; kullanıcı hesabı, sunucu, eşzamanlama veya merkezi yayın sistemi yoktur.
- Mevcut sistem kataloğunda V5 yaklaşımına uygun şekilde LPC gizlidir; kaynak JSON dosyaları silinmemiştir.
- İçerik editörünün kaydetme mekanizması tarayıcı/Electron IndexedDB'sini kullanır; farklı Windows kullanıcı hesapları arasında otomatik eşzamanlanmaz.

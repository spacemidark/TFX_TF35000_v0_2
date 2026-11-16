# TFX — TF35000 | VS Code ile Düzenleme ve Geliştirme Rehberi

Bu rehber, yazılım konusunda başlangıç seviyesinde olan bir kullanıcının uygulamanın içeriğini ve görsellerini kendi başına güncellemesine yardımcı olur.

## 1. Hangi klasör ne işe yarıyor?

- **`src/App.tsx`** — Ana pencere, soldaki komponent ağacı, arama, sayfa seçimi ve teknik makale görüntüleme.
- **`src/components/Dashboard.tsx`** — İlk açılan ana ekran, motor görseli, sistem kartları, HPC öne çıkarma alanı.
- **`src/components/EngineSchematic.tsx`** — Tıklanabilir **temsili** motor şeması.
- **`src/components/EngineViewer.tsx`** — Three.js kompresör görüntüleyicisi (varsayılan model örnektir).
- **`src/components/ChapterNavigator.tsx`** — Komponent içindeki teknik konu menüsü.
- **`src/components/EngineeringWidgets.tsx`** — Öğretici mühendislik çizimleri ve etkileşimli bileşenler.
- **`src/data/catalog.json`** — Sistemler, komponentler, ebeveyn-alt parça ilişkileri, konu başlıkları, kaynak listeleri.
- **`src/data/index.ts`** — Katalog ve MDX içerik dosyalarını uygulamaya bağlar; gizlenen LPC burada belirlenir.
- **`src/data/projectConfig.json`** — TFX/TF35000 adı ve isteğe bağlı kompresör GLB modeli.
- **`src/data/assetMap.json`** — Ana ekran görsellerinin dosya yolları.
- **`content/`** — TR/EN teknik makaleler (MDX dosyaları).
- **`public/images/`** — Görseller. Buradaki dosyalar mevcut prototipten aynen alınmıştır.
- **`public/models/`** — Eklemek isteyeceğin GLB modelleri.
- **`src/styles/main.css`** — Önceki uygulamanın temel stilleri ve yerleşimi.
- **`src/styles/tfx-theme.css`** — **Yeni siyah/turkuaz renkleri değiştireceğin dosya**.
- **`electron/main.cjs`** — Electron penceresi, yerel dosyaların güvenli sunulması.
- **`desktop-assets/icon.ico`** — Windows EXE ikonu.
- **`package.json`** — Npm komutları, uygulama adı, EXE ayarları.
- **`CREATE_EXE_WINDOWS.bat`** — Windows EXE paketleme işlemini başlatır.

## 2. İlk kez çalıştırma

1. ZIP'i tamamen çıkar; ZIP içinden tek dosya açma.
2. VS Code'da **File → Open Folder** ile `package.json` bulunan TFX klasörünü aç.
3. Terminal → New Terminal menüsünü aç.
4. Komut İstemi (CMD) kullanıyorsan veya PowerShell'de `npm` engelleniyorsa `npm.cmd` yaz.

```cmd
npm.cmd install
npm.cmd run dev
```

Terminalin verdiği `localhost` adresini tarayıcıda aç. Kod değişiklikleri genellikle otomatik yenilenir.

Masaüstü Electron penceresini geliştirme sırasında açmak için:

```cmd
npm.cmd run desktop:dev
```

### İnternet gereksinimi

İlk bağımlılık kurulumu internet veya şirketin izin verdiği dahili paket deposunu gerektirebilir. **Hazır paketlenmiş EXE**, yalnızca yerel dosyaları kullanıyorsa çevrimdışı çalışabilir. Kurumsal bilgisayarlarda BT güvenlik politikalarına uy.

## 3. Uygulama ve motor adını değiştirmek

`src/data/projectConfig.json` dosyasını aç:

```json
{
  "appName": "TFX",
  "engineName": "TF35000",
  "subtitleTr": "Etkileşimli motor mühendisliği ansiklopedisi",
  "subtitleEn": "Interactive engine engineering encyclopedia",
  "buildLabel": "CONCEPT BUILD · 0.1",
  "compressorModelPath": "",
  "compressorModelScale": 1
}
```

`appName` ve `engineName` değişiklikleri arayüzde görünür. **Windows EXE ürün adını** ayrıca `package.json` içindeki `productName` alanından değiştirmen gerekir. `index.html` ve `electron/main.cjs` içindeki pencere başlıklarını da uyumlu tut.

## 4. Renkleri nasıl değiştireceksin?

`src/styles/tfx-theme.css` dosyasını aç. İlk satırlarda:

```css
:root {
  --bg: #040b10;
  --panel: #091921;
  --aqua: #45dbe4;
  --text: #e9f9fc;
}
```

- `--bg`: ana arka plan tonu
- `--panel`: kart/panel tabanı
- `--aqua`: turkuaz vurgu
- `--text`: ana yazı rengi

Daha belirgin bir değişiklik için aynı dosyadaki `.main-area`, `.sidebar`, `.dashboard-panel`, `.dash-primary` kurallarını düzenle. **`main.css` yerine öncelikle `tfx-theme.css` dosyasını düzenle.**

## 5. Eski görseli kendi TF35000 görselinle değiştirme

Örnek: ana ekrandaki temsili motor kesitini değiştirmek.

**A.** Kullanma hakkın bulunan `tf35000-kesit.png` dosyasını `public/images/` içine kopyala.

**B.** `src/data/assetMap.json` dosyasını aç:

```json
{
  "engineCutaway": "./images/tf35000-kesit.png",
  "hpcAssembly": "./images/hpc-assembly.webp"
}
```

Burada sadece `engineCutaway` değerini değiştir; diğer satırları silme. Kaydet. Vite açıksa ekran yenilenir.

**C.** `docs/GORSEL_KAYNAKLARI.csv` dosyasına görselin kaynağını, tarihini, lisansını ve doğruluk durumunu ekle.

**Diğer görseller için anahtarlar:** `fanThumbnail`, `hpcThumbnail`, `combustorThumbnail`, `hpcAssembly`, `statorVane`, `aerodynamics`, `partsAssembly`, `appIcon`.

**Önemli:** `assetMap.json` sadece **ana ekran ve ikon** için kullanılıyor. Teknik makalelere ayrı görseller eklemek için aşağıdaki MDX yöntemini kullan.

## 6. Teknik bilgileri nasıl değiştireceksin?

Örnek: TF35000 motor genel bakış metnini düzenlemek.

1. `content/turbofan-engine/overview.tr.mdx` dosyasını aç.
2. Başlıkların altındaki italik taslak cümlelerini kendi **doğrulanmış** metinlerinle değiştir.
3. İngilizce metin için `content/turbofan-engine/overview.en.mdx` dosyasını düzenle.
4. Dosyayı kaydet; ana ekranda **Motor Bilgisi** sekmesine tıklayarak güncel metni kontrol et.

MDX örneği:

```mdx
# Komponent Genel Bakış

## Görev

Buraya doğrulanmış açıklamanı yaz.

## Malzeme

Malzeme verisi ve referansını buraya yaz.

![Komponentin kesiti](/images/komponent-kesiti.png)

## Kaynaklar

- Kaynak adı, yıl, sayfa/bağlantı
```

**Görsel eklemek için** `public/images/komponent-kesiti.png` dosyasını oluşturup yukarıdaki `![...](...)` satırını MDX'e yaz.

Uyarı: `content/` içindeki eski MDX dosyalarının önemli bölümü genel turbofan örnek metnidir; **TF35000'e özel olarak doğrulanmamıştır**.

## 7. Yeni komponent ekleme — örnek

Örnek olarak, katalogda henüz bulunmayan ve senin doğruladığın bir alt parçayı eklemek istediğini varsayalım.

**A.** `src/data/catalog.json` dosyasını aç. `components` dizisine uygun yere aşağıdaki şemaya benzer bir kayıt ekle (JSON virgüllerine dikkat et):

```json
{
  "id": "ornek-yeni-parca",
  "parentId": "hpc-overview",
  "code": "TFX-EX-01",
  "status": "planned",
  "category": "component",
  "title": { "tr": "Örnek Yeni Parça", "en": "Example New Part" },
  "subtitle": { "tr": "Doğrulanmış açıklama eklenecek.", "en": "Awaiting verified description." },
  "chapters": [
    { "id": "overview", "tr": "Genel bakış", "en": "Overview", "tag": "INTRODUCTION", "refs": [] },
    { "id": "materials", "tr": "Malzemeler", "en": "Materials", "tag": "MATERIALS", "refs": [] }
  ],
  "references": []
}
```

**B.** `content/ornek-yeni-parca/` klasörü oluştur.

**C.** `overview.tr.mdx` ve `materials.tr.mdx` dosyalarını oluştur. İstersen `.en.mdx` karşılıklarını da yaz.

**D.** Uygulamada `HPC → Örnek Yeni Parça` yolunu aç. Görünmüyorsa JSON söz dizimini, `parentId` değerini ve `src/data/index.ts` içindeki gizleme filtresini kontrol et.

> Bu örnek gerçek TF35000 parça listesi değildir; sadece yazılımın veri formatını gösterir.

## 8. Teknik başlık ekleme

Var olan bir komponentin `chapters` listesine yeni bir kayıt ekle; örneğin `id: "coatings"`. Ardından `content/<komponent-id>/coatings.tr.mdx` dosyasını oluştur. Bölüm otomatik olarak gezinme menüsünde **Diğer konular** grubuna düşebilir. Belirli bir gruba yerleştirmek için `src/data/chapterGroups.ts` dosyasını güncelle.

## 9. 3D model nasıl değiştirilir?

Varsayılan 3D kompresör, `src/components/EngineViewer.tsx` içinde Three.js ile çizilmiş **temsili bir modeldir**. Gerçek TF35000 CAD verisi değildir.

Kendi izinli `.glb` kompresör modelin varsa:

1. Dosyayı `public/models/tf35000-kompresor.glb` konumuna kopyala.
2. `src/data/projectConfig.json` içindeki `compressorModelPath` alanını `"./models/tf35000-kompresor.glb"` yap.
3. Gerekirse `compressorModelScale` değerini değiştir (ör. `0.01` veya `2`).
4. Uygulamadaki HPC 3D sekmesini aç ve kontrol et.

Bu mekanizma yalnızca kompresör görüntüleyicisi içindir. Komple motorun 3D sahnesini, tıklanabilir alt parça seçimini ve CAD model etkileşimlerini ayrı geliştirmek gerekir.

## 10. LPC'yi neden göremiyorum?

V5 yaklaşımına uygun olarak LPC ve alt öğeleri görünümden **gizlenmiştir**, ancak katalogdan silinmemiştir. `src/data/index.ts` dosyasındaki:

```ts
const excludedIds = new Set(['lpc']);
```

satırından `'lpc'` değerini kaldırırsan katalogdaki LPC öğeleri yeniden görünür. Ayrıca `src/components/Dashboard.tsx` ve `src/components/EngineSchematic.tsx` içine tıklanabilir LPC görsel alanını yeniden eklemen gerekir.

**Bu gizleme TF35000 mimarisi hakkında bir iddia değildir.** Motorun gerçek mimarisini doğruladığında menüyü yeniden düzenle.

## 11. Windows EXE nasıl oluşturulur?

Windows'ta `CREATE_EXE_WINDOWS.bat` dosyasına çift tıkla. Bu işlem `npm install`, `npm run build` ve Electron Builder paketlemesini çalıştırır. Başarılı olursa `release/` içinde Setup/Portable EXE dosyaları oluşabilir. Windows üzerinde bu ortamda paketleme doğrulanmadı.

Hazır EXE dosyasını başka bir bilgisayara taşırken şirket/kurum BT politikalarına ve yazılım imzalama gerekliliklerine uy. EXE kullanan kişinin Node.js kurması gerekmez.

## 12. Kaynak doğrulama ve sürümleme

- Teknik içeriklerin **genel mühendislik bilgisi mi yoksa TF35000'e özgü doğrulanmış bilgi mi** olduğunu açıkça ayır.
- Kamuya açık olmayan, ticari sır veya şirket içi kısıtlı verileri uygulamaya ekleme.
- Görsellerin kullanım hakkını kontrol et; kaynak tablosunu güncelle.
- Kod değiştirmeden önce Git üzerinden commit oluştur; böylece eski sürüme dönebilirsin.
- Önce `npm.cmd run build` ile TypeScript ve Vite derlemesini kontrol et; sonra EXE üret.

## 13. Kod üzerinde en sık yapacağın işlemler

| İşlem | Dosya |
| --- | --- |
| Ana sayfadaki kart başlığını değiştir | `src/components/Dashboard.tsx` |
| Menüye yeni sistem ekle | `src/data/catalog.json` |
| TF35000 teknik metni ekle | `content/<id>/<bolum>.tr.mdx` |
| Görsel değiştir | `public/images/` + `src/data/assetMap.json` |
| Yeni 3D kompresör modeli göster | `public/models/` + `src/data/projectConfig.json` |
| Tema renklerini değiştir | `src/styles/tfx-theme.css` |
| EXE adını değiştir | `package.json` ve `electron/main.cjs` |
| Uygulama ikonunu değiştir | `desktop-assets/icon.ico` + `public/images/app-icon.png` |

---

**Kaynak kod dayanağı:** Erişilebilir Inside the Jet Engine V1.4 kaynakları. V5'in tam kaynak ZIP'i mevcut olmadığından bu çalışma birebir V5 yükseltmesi olarak tanımlanmamalıdır.

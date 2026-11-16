# 3D model ekleme

Varsayılan kompresör modeli `src/components/EngineViewer.tsx` içinde Three.js ile üretilen **temsili** geometridir.
Kendi `.glb` dosyanı buraya kopyala (ör. `public/models/benim-kompresorum.glb`).
`src/data/projectConfig.json` içindeki `compressorModelPath` değerini `"./models/benim-kompresorum.glb"` olarak değiştir.
Model büyük/küçük görünüyorsa `compressorModelScale` değerini ayarla.
GLB dosyası, dağıtım paketi için Vite tarafından kopyalanır.
Bu özellik yalnızca kompresör görüntüleyicisi içindir; tüm motor modeli entegrasyonu ayrı geliştirme gerektirir.

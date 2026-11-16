# TFX — TF35000 | v0.2.0

**Created by Emine Yasan**

Siyah/turkuaz temalı, React + TypeScript + Three.js + Electron tabanlı interaktif mühendislik ansiklopedisi.

## v0.2 yenilikleri

- Sol üst uygulama adı **TFX**, hemen altında **Created by Emine Yasan**.
- Windows uygulama ürün adı **TFX**. Motor adı **TF35000**.
- Üst menüde çalışan **İçerik Yönetimi / Content Studio** paneli.
- Komponent ekleme ve düzenleme, teknik makale yazma, görsel yükleme.
- Değişiklikleri yerel IndexedDB'de saklama; içerik güncellemeleri için yeniden EXE üretme zorunluluğu yok.
- JSON yedek dışa aktarma ve başka bilgisayarda içe aktarma.
- Önceki motor ve komponent görselleri **aynen korundu**.

## Hızlı başlangıç (Windows CMD veya VS Code terminali)

```cmd
npm.cmd install
npm.cmd run dev
```

Electron masaüstü geliştirme penceresi:

```cmd
npm.cmd run desktop:dev
```

Windows EXE oluşturmak için `CREATE_EXE_WINDOWS.bat` dosyasını çalıştır veya:

```cmd
npm.cmd run desktop:dist
```

**Ayrıntılı adım adım rehber:** `docs/TFX_V0_2_KULLANIM_REHBERI_TR.md`

> Bu ZIP kaynak kod paketidir, hazır EXE değildir. Gerçek TF35000 tasarım verileri ve OEM görselleri henüz eklenmemiştir.

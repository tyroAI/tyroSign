# tyroSign — Demo

Kurumsal e-posta imzası, dijital kartvizit, QR kartvizit ve LinkedIn banner stüdyosunun **demo sürümü**.

- **Canlı:** https://tyroai.github.io/tyroSign/
- Giriş ekranındaki butona basınca örnek bir hesapla (Deniz Aydın) doğrudan uygulamaya girilir.
- Kurumsal yapı kurgusaldır: ana şirket **tyroTech** ve grup şirketleri, ofisler, logolar tamamen demo verisidir (`src/constants/`, `public/logos/`).
- Azure AD / Microsoft Graph bağlantısı yoktur; profil, yönetici ve e-posta gönderimi dummy veriyle simüle edilir (`src/hooks/useMsal.js`).

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # dist/
```

`main` dalına her push, GitHub Actions ile GitHub Pages'e deploy edilir.

import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      // İKİ GİRİŞ: ana uygulama + Thub'ın WebView'ı için gömülü kartvizit.
      // Ayrı HTML olmasının sebebi src/embed.jsx başlığında yazılı (özetle: embed
      // MSAL yüklememeli, ama main.jsx'in açılış yolu da değişmemeli).
      // Anahtar adı çıktı chunk'ının adını belirler. 'index' OLMAK ZORUNDA:
      // CLAUDE.md'deki canlı doğrulama komutu `index-*.js` chunk'ını indirip içinde
      // VITE_CLIENT_ID arıyor (secret tanımsızsa uygulama girişsiz yayınlanır, build
      // uyarı vermez). 'main' yazılırsa o komut dosyayı bulamaz ve sistem sağlamken
      // "giriş kapalı" alarmı verir.
      input: {
        index: resolve(__dirname, 'index.html'),
        'card-embed': resolve(__dirname, 'card-embed.html'),
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-qrcode': ['qrcode'],
        },
      },
    },
  }
});

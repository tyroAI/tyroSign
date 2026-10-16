// Gömülü kartvizit sayfasının giriş noktası (card-embed.html).
//
// ANA UYGULAMADAN AYRI BİR GİRİŞ OLMASININ SEBEBİ: embed'in kimlik doğrulaması
// YAPMAMASI şart. App.jsx import edilirse useMsal modül yüklenirken MSAL örneğini
// kuruyor. Aynı dosyada dallanmak (main.jsx içinde dinamik import) bunu çözerdi ama
// ana uygulamanın açılış yolunu değiştiriyordu: App ayrı bir chunk'a düşüyor,
// açılışta fazladan bir istek turu doğuyor ve CLAUDE.md'deki canlı doğrulama komutu
// (index chunk'ında VITE_CLIENT_ID arar) yanlış alarm veriyordu. Ayrı HTML girişiyle
// main.jsx'e hiç dokunulmuyor.
//
// Kart çizimi PAYLAŞILIYOR: bu sayfa businessCardV2 / cardStg / v2Data modüllerinin
// aynısını kullanıyor, yani tasarım değişince embed kendiliğinden takip ediyor.
import React from 'react';
import ReactDOM from 'react-dom/client';
import CardEmbed from './CardEmbed.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CardEmbed />
    </ErrorBoundary>
  </React.StrictMode>
);

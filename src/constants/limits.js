export const MAX_LOGO_SIZE = 512000;       // 500KB
export const MAX_LOGO_W = 200;
export const MAX_LOGO_H = 80;
// Varsayılan TYRO logosunun GÖSTERİM ölçüsü. Oran dosyanınkiyle AYNI olmalı
// (512x223 → 2.296), yoksa üreticiler width/height verdiği için logo ezilir.
// Yükseklik 45→61: yeni logo alt yazı içeriyor, aynı genişlikte daha uzun.
export const DEFAULT_LOGO_W = 140;
export const DEFAULT_LOGO_H = 61;
export const MAX_BANNER_SIZE = 2097152;    // 2MB
// İmza altına eklenebilecek promosyon banner sayısı. Her banner imza HTML'ine base64
// gömüldüğü için sayı arttıkça imza dosyası büyür (Outlook yavaşlar, Gmail kırpar) →
// üst sınır 3 tutuldu.
export const MAX_SIG_BANNERS = 3;
export const MAX_BANNER_W = 680;
export const SIG_WIDTH = 680;
export const SIG_CORP_WIDTH = 600;
